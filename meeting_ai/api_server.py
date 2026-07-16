from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import asyncio
import json
import os
from pathlib import Path
from datetime import datetime
import subprocess
import tempfile

from meeting_ai.config import config
from meeting_ai.auth import verify_password, set_password, is_first_run, prompt_password
from meeting_ai.summarizer import LLMSummarizer, MeetingSummary
from meeting_ai.pdf_generator import generate_meeting_pdf

app = FastAPI(title="Meeting AI API", version="1.0.0")

# In-memory job storage (use Redis in production)
jobs = {}


class AuthRequest(BaseModel):
    password: str


class AuthResponse(BaseModel):
    success: bool
    message: str


class RecordRequest(BaseModel):
    duration: int = 300
    device_index: Optional[int] = None


class TranscribeRequest(BaseModel):
    audio_path: str
    language: str = "pt"
    is_segments: bool = False


class SummarizeRequest(BaseModel):
    transcript: str
    language: str = "pt"


class FullPipelineRequest(BaseModel):
    duration: int = 300
    device_index: Optional[int] = None
    language: str = "pt"
    title: Optional[str] = None


class JobStatus(BaseModel):
    job_id: str
    status: str  # pending, running, completed, failed
    progress: int
    message: str
    result: Optional[dict] = None


@app.post("/auth/verify", response_model=AuthResponse)
async def verify_auth(request: AuthRequest):
    """Verify password"""
    if verify_password(request.password):
        return AuthResponse(success=True, message="Acesso autorizado")
    return AuthResponse(success=False, message="Senha incorreta")


@app.post("/auth/setup")
async def setup_password(request: AuthRequest):
    """Setup initial password"""
    if not is_first_run():
        raise HTTPException(status_code=400, detail="Senha já configurada")
    set_password(request.password)
    return {"success": True, "message": "Senha configurada com sucesso"}


@app.post("/auth/change")
async def change_password(old_password: str, new_password: str):
    """Change password"""
    from meeting_ai.auth import verify_password as vp, set_password as sp
    if not vp(old_password):
        raise HTTPException(status_code=401, detail="Senha atual incorreta")
    sp(new_password)
    return {"success": True, "message": "Senha alterada com sucesso"}


@app.get("/devices")
async def list_audio_devices():
    """List available audio input devices"""
    try:
        import pyaudio
        pa = pyaudio.PyAudio()
        devices = []
        for i in range(pa.get_device_count()):
            info = pa.get_device_info_by_index(i)
            if info['maxInputChannels'] > 0:
                devices.append({
                    "index": i,
                    "name": info['name'],
                    "channels": info['maxInputChannels'],
                    "sample_rate": int(info['defaultSampleRate'])
                })
        pa.terminate()
        return {"devices": devices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/record")
async def start_recording(request: RecordRequest, background_tasks: BackgroundTasks):
    """Start recording audio"""
    job_id = f"rec_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    jobs[job_id] = JobStatus(
        job_id=job_id,
        status="running",
        progress=0,
        message="Iniciando gravação..."
    )
    
    background_tasks.add_task(record_audio_task, job_id, request.duration, request.device_index)
    return {"job_id": job_id, "status": "started"}


async def record_audio_task(job_id: str, duration: int, device_index: Optional[int]):
    """Background task for recording"""
    try:
        from meeting_ai.audio_recorder import record_meeting, AudioRecorder
        
        recorder = AudioRecorder()
        segment_files = []
        
        def on_segment(f):
            segment_files.append(f)
            jobs[job_id].progress = min(90, len(segment_files) * 10)
            jobs[job_id].message = f"Gravando... {len(segment_files)} segmentos"
        
        output_file = record_meeting(
            duration_seconds=duration,
            device_index=device_index,
            on_segment=on_segment
        )
        
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "Gravação concluída"
        jobs[job_id].result = {
            "audio_file": output_file,
            "segments": segment_files
        }
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].message = f"Erro: {str(e)}"


@app.post("/transcribe")
async def transcribe_audio(request: TranscribeRequest, background_tasks: BackgroundTasks):
    """Transcribe audio file"""
    job_id = f"trans_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    jobs[job_id] = JobStatus(
        job_id=job_id,
        status="running",
        progress=0,
        message="Iniciando transcrição..."
    )
    
    background_tasks.add_task(transcribe_task, job_id, request.audio_path, request.language, request.is_segments)
    return {"job_id": job_id, "status": "started"}


async def transcribe_task(job_id: str, audio_path: str, language: str, is_segments: bool):
    try:
        from meeting_ai.transcriber import Transcriber, save_transcript
        
        transcriber = Transcriber()
        jobs[job_id].progress = 20
        jobs[job_id].message = "Carregando modelo Whisper..."
        
        if is_segments:
            from pathlib import Path
            segment_files = sorted(Path(audio_path).glob("*.wav"))
            result = transcriber.transcribe_segments([str(f) for f in segment_files], language)
        else:
            result = transcriber.transcribe_file(audio_path, language)
        
        jobs[job_id].progress = 80
        jobs[job_id].message = "Salvando transcrição..."
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = Path(config.output_dir) / f"transcript_{timestamp}.txt"
        save_transcript(result, str(output_file), True)
        
        json_file = str(output_file.with_suffix('.json'))
        import json as json_lib
        with open(json_file, 'w', encoding='utf-8') as f:
            json_lib.dump({
                "language": result.language,
                "full_text": result.full_text,
                "segments": [{"start": s.start, "end": s.end, "text": s.text} for s in result.segments]
            }, f, ensure_ascii=False, indent=2)
        
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "Transcrição concluída"
        jobs[job_id].result = {
            "transcript_file": str(output_file),
            "json_file": json_file,
            "language": result.language,
            "full_text": result.full_text,
            "segments_count": len(result.segments)
        }
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].message = f"Erro: {str(e)}"


@app.post("/summarize")
async def summarize_text(request: SummarizeRequest, background_tasks: BackgroundTasks):
    """Generate summary from transcript"""
    job_id = f"sum_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    jobs[job_id] = JobStatus(
        job_id=job_id,
        status="running",
        progress=0,
        message="Gerando resumo..."
    )
    
    background_tasks.add_task(summarize_task, job_id, request.transcript, request.language)
    return {"job_id": job_id, "status": "started"}


async def summarize_task(job_id: str, transcript: str, language: str):
    try:
        summarizer = LLMSummarizer()
        jobs[job_id].progress = 50
        jobs[job_id].message = "Processando com LLM..."
        
        summary = summarizer.summarize(transcript, language)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        summary_file = Path(config.output_dir) / f"summary_{timestamp}.json"
        
        import json as json_lib
        from dataclasses import asdict
        with open(summary_file, 'w', encoding='utf-8') as f:
            json_lib.dump(asdict(summary), f, ensure_ascii=False, indent=2)
        
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "Resumo gerado"
        jobs[job_id].result = {
            "summary_file": str(summary_file),
            "summary": asdict(summary)
        }
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].message = f"Erro: {str(e)}"


@app.post("/generate-pdf")
async def generate_pdf(summary_data: dict):
    """Generate PDF from summary JSON"""
    try:
        summary = MeetingSummary(**summary_data)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_file = Path(config.output_dir) / f"ata_{timestamp}.pdf"
        
        generate_meeting_pdf(summary, str(pdf_file))
        
        return {
            "success": True,
            "pdf_file": str(pdf_file),
            "message": "PDF gerado com sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/full-pipeline")
async def full_pipeline(request: FullPipelineRequest, background_tasks: BackgroundTasks):
    """Run complete pipeline: record -> transcribe -> summarize -> PDF"""
    job_id = f"full_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    jobs[job_id] = JobStatus(
        job_id=job_id,
        status="running",
        progress=0,
        message="Iniciando pipeline completo..."
    )
    
    background_tasks.add_task(full_pipeline_task, job_id, request)
    return {"job_id": job_id, "status": "started"}


async def full_pipeline_task(job_id: str, request: FullPipelineRequest):
    try:
        from meeting_ai.audio_recorder import record_meeting, AudioRecorder
        from meeting_ai.transcriber import Transcriber, save_transcript
        from meeting_ai.summarizer import LLMSummarizer
        from meeting_ai.pdf_generator import generate_meeting_pdf
        from meeting_ai.config import config
        from pathlib import Path
        import json as json_lib
        from dataclasses import asdict
        
        # 1. Record
        jobs[job_id].progress = 10
        jobs[job_id].message = "Gravando áudio..."
        
        recorder = AudioRecorder()
        segment_files = []
        
        def on_segment(f):
            segment_files.append(f)
        
        record_meeting(
            duration_seconds=request.duration,
            device_index=request.device_index,
            on_segment=on_segment
        )
        
        # 2. Transcribe
        jobs[job_id].progress = 30
        jobs[job_id].message = "Transcrevendo..."
        
        transcriber = Transcriber()
        result = transcriber.transcribe_segments(segment_files, request.language)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        transcript_file = Path(config.output_dir) / f"transcript_{timestamp}.txt"
        save_transcript(result, str(transcript_file), True)
        
        # 3. Summarize
        jobs[job_id].progress = 60
        jobs[job_id].message = "Gerando resumo..."
        
        summarizer = LLMSummarizer()
        summary = summarizer.summarize(result.full_text, request.language)
        summary.title = request.title or summary.title
        summary.date = datetime.now().strftime("%d/%m/%Y")
        
        summary_file = Path(config.output_dir) / f"summary_{timestamp}.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json_lib.dump(asdict(summary), f, ensure_ascii=False, indent=2)
        
        # 4. PDF
        jobs[job_id].progress = 80
        jobs[job_id].message = "Gerando PDF..."
        
        pdf_file = Path(config.output_dir) / f"ata_{timestamp}.pdf"
        generate_meeting_pdf(summary, str(pdf_file))
        
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "Pipeline completo!"
        jobs[job_id].result = {
            "transcript_file": str(transcript_file),
            "summary_file": str(summary_file),
            "pdf_file": str(pdf_file),
            "summary": asdict(summary)
        }
    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].message = f"Erro: {str(e)}"


@app.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get job status"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return jobs[job_id]


@app.get("/jobs")
async def list_jobs():
    """List all jobs"""
    return {"jobs": list(jobs.values())}


@app.get("/output-files")
async def list_output_files():
    """List generated files"""
    output_dir = Path(config.output_dir)
    if not output_dir.exists():
        return {"files": []}
    
    files = []
    for f in output_dir.iterdir():
        if f.is_file():
            files.append({
                "name": f.name,
                "path": str(f),
                "size": f.stat().st_size,
                "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
            })
    return {"files": sorted(files, key=lambda x: x['modified'], reverse=True)}


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "meeting-ai-api"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)