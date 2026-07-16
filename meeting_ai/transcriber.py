from faster_whisper import WhisperModel
from typing import List, Optional
from dataclasses import dataclass
import os
from meeting_ai.config import config


@dataclass
class TranscriptSegment:
    start: float
    end: float
    text: str


@dataclass
class TranscriptResult:
    language: str
    segments: List[TranscriptSegment]
    full_text: str


class Transcriber:
    def __init__(
        self,
        model_size: str = None,
        device: str = None,
        compute_type: str = None
    ):
        self.model_size = model_size or config.whisper_model
        self.device = device or config.whisper_device
        self.compute_type = compute_type or config.whisper_compute_type
        
        self.model = None
    
    def load(self):
        if self.model is None:
            print(f"Carregando modelo Whisper: {self.model_size} ({self.device})")
            self.model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type
            )
    
    def transcribe_file(self, audio_path: str, language: str = "pt") -> TranscriptResult:
        self.load()
        
        segments, info = self.model.transcribe(
            audio_path,
            language=language,
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        transcript_segments = []
        full_text = []
        
        for segment in segments:
            ts = TranscriptSegment(
                start=segment.start,
                end=segment.end,
                text=segment.text.strip()
            )
            transcript_segments.append(ts)
            full_text.append(segment.text.strip())
        
        return TranscriptResult(
            language=info.language,
            segments=transcript_segments,
            full_text=" ".join(full_text)
        )
    
    def transcribe_segments(self, segment_files: List[str], language: str = "pt") -> TranscriptResult:
        all_segments = []
        all_text = []
        time_offset = 0.0
        
        for seg_file in sorted(segment_files):
            result = self.transcribe_file(seg_file, language)
            
            for seg in result.segments:
                seg.start += time_offset
                seg.end += time_offset
                all_segments.append(seg)
            
            all_text.append(result.full_text)
            time_offset = all_segments[-1].end if all_segments else 0
        
        return TranscriptResult(
            language=language,
            segments=all_segments,
            full_text=" ".join(all_text)
        )


def format_transcript(result: TranscriptResult, include_timestamps: bool = True) -> str:
    lines = []
    for seg in result.segments:
        if include_timestamps:
            start = format_time(seg.start)
            end = format_time(seg.end)
            lines.append(f"[{start} - {end}] {seg.text}")
        else:
            lines.append(seg.text)
    return "\n".join(lines)


def format_time(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def save_transcript(result: TranscriptResult, output_path: str, include_timestamps: bool = True):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(format_transcript(result, include_timestamps))
    print(f"Transcrição salva: {output_path}")