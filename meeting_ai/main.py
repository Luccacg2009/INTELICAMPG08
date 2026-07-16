#!/usr/bin/env python3
"""
Meeting AI - Grava reuniões, transcreve e gera PDF com resumo estruturado.

Uso:
    python main.py record [--duration 300]        # Grava reunião (default 5 min)
    python main.py transcribe audio.wav           # Transcreve arquivo
    python main.py summarize transcript.txt       # Resume transcrição
    python main.py pdf summary.json               # Gera PDF do resumo
    python main.py full [--duration 300]          # Pipeline completo: grava -> transcreve -> resume -> PDF
    python main.py auth change                    # Altera senha
"""

import argparse
import sys
import os
from pathlib import Path
from datetime import datetime

from meeting_ai.config import config
from meeting_ai.audio_recorder import record_meeting, AudioRecorder
from meeting_ai.transcriber import Transcriber, save_transcript
from meeting_ai.summarizer import LLMSummarizer, MeetingSummary
from meeting_ai.pdf_generator import generate_meeting_pdf
from meeting_ai.auth import prompt_password, setup_initial_password, change_password_interactive, reset_password_interactive


def cmd_record(args):
    """Grava áudio da reunião"""
    recorder = AudioRecorder()
    
    if args.list_devices:
        recorder.list_devices()
        return
    
    def on_segment(segment_file):
        print(f"Segmento salvo: {segment_file}")
    
    print(f"Iniciando gravação (duração: {args.duration}s, dispositivo: {args.device or 'padrão'})")
    print("Pressione Ctrl+C para parar...")
    
    try:
        output_file = record_meeting(
            duration_seconds=args.duration,
            device_index=args.device,
            on_segment=on_segment
        )
        print(f"\nGravação salva em: {output_file}")
    except KeyboardInterrupt:
        print("\nGravação interrompida.")


def cmd_transcribe(args):
    """Transcreve arquivo de áudio"""
    transcriber = Transcriber()
    
    if args.segments:
        # Transcreve múltiplos segmentos
        segment_files = sorted(Path(args.input).glob("*.wav"))
        if not segment_files:
            print(f"Nenhum arquivo .wav encontrado em: {args.input}")
            return
        print(f"Encontrados {len(segment_files)} segmentos")
        result = transcriber.transcribe_segments([str(f) for f in segment_files], args.language)
    else:
        # Transcreve arquivo único
        result = transcriber.transcribe_file(args.input, args.language)
    
    output = args.output or str(Path(args.input).with_suffix('.txt'))
    save_transcript(result, output, args.timestamps)
    
    # Salva JSON também
    json_output = str(Path(output).with_suffix('.json'))
    import json
    from dataclasses import asdict
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump({
            "language": result.language,
            "full_text": result.full_text,
            "segments": [{"start": s.start, "end": s.end, "text": s.text} for s in result.segments]
        }, f, ensure_ascii=False, indent=2)
    print(f"JSON salvo: {json_output}")


def cmd_summarize(args):
    """Gera resumo estruturado da transcrição"""
    summarizer = LLMSummarizer()
    
    # Lê transcrição
    if args.input.endswith('.json'):
        import json
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
        transcript = data.get('full_text', '')
    else:
        with open(args.input, 'r', encoding='utf-8') as f:
            transcript = f.read()
    
    print("Gerando resumo com LLM...")
    summary = summarizer.summarize(transcript, args.language)
    
    # Salva JSON
    output = args.output or str(Path(args.input).with_suffix('.summary.json'))
    import json
    from dataclasses import asdict
    with open(output, 'w', encoding='utf-8') as f:
        json.dump(asdict(summary), f, ensure_ascii=False, indent=2)
    print(f"Resumo salvo: {output}")


def cmd_pdf(args):
    """Gera PDF a partir do resumo JSON"""
    import json
    with open(args.input, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    summary = MeetingSummary(**data)
    output = args.output or str(Path(args.input).with_suffix('.pdf'))
    generate_meeting_pdf(summary, output)


def cmd_full(args):
    """Pipeline completo: grava -> transcreve -> resume -> PDF"""
    print("=" * 50)
    print("PIPELINE COMPLETO DE REUNIÃO")
    print("=" * 50)
    
    # 1. Grava
    print("\n[1/4] Gravando áudio...")
    recorder = AudioRecorder()
    segments_dir = Path(config.output_dir) / "segments"
    segments_dir.mkdir(parents=True, exist_ok=True)
    
    segment_files = []
    def on_segment(f):
        segment_files.append(f)
    
    try:
        record_meeting(
            duration_seconds=args.duration,
            device_index=args.device,
            on_segment=on_segment
        )
    except KeyboardInterrupt:
        print("\nGravação interrompida.")
    
    if not segment_files:
        print("Nenhum segmento gravado.")
        return
    
    # 2. Transcreve
    print("\n[2/4] Transcrevendo...")
    transcriber = Transcriber()
    result = transcriber.transcribe_segments(segment_files, args.language)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    transcript_file = Path(config.output_dir) / f"transcript_{timestamp}.txt"
    save_transcript(result, str(transcript_file), True)
    
    # 3. Resume
    print("\n[3/4] Gerando resumo...")
    summarizer = LLMSummarizer()
    summary = summarizer.summarize(result.full_text, args.language)
    summary.title = args.title or summary.title
    summary.date = datetime.now().strftime("%d/%m/%Y")
    
    summary_file = Path(config.output_dir) / f"summary_{timestamp}.json"
    import json
    from dataclasses import asdict
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(asdict(summary), f, ensure_ascii=False, indent=2)
    print(f"Resumo salvo: {summary_file}")
    
    # 4. PDF
    print("\n[4/4] Gerando PDF...")
    pdf_file = Path(config.output_dir) / f"ata_{timestamp}.pdf"
    generate_meeting_pdf(summary, str(pdf_file))
    
    print("\n" + "=" * 50)
    print("CONCLUÍDO!")
    print(f"Transcrição: {transcript_file}")
    print(f"Resumo:      {summary_file}")
    print(f"PDF:         {pdf_file}")
    print("=" * 50)


def cmd_auth(args):
    """Comandos de autenticação"""
    if args.auth_action == 'change':
        change_password_interactive()
    elif args.auth_action == 'reset':
        reset_password_interactive()
    elif args.auth_action == 'setup':
        setup_initial_password()


def main():
    parser = argparse.ArgumentParser(description="Meeting AI - Grava, transcreve e resume reuniões")
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponíveis')
    
    # Record
    p_record = subparsers.add_parser('record', help='Gravar áudio da reunião')
    p_record.add_argument('--duration', '-d', type=int, default=300, help='Duração em segundos (default: 300)')
    p_record.add_argument('--device', type=int, help='Índice do dispositivo de áudio')
    p_record.add_argument('--list-devices', action='store_true', help='Listar dispositivos de áudio')
    p_record.set_defaults(func=cmd_record)
    
    # Transcribe
    p_transcribe = subparsers.add_parser('transcribe', help='Transcrever áudio')
    p_transcribe.add_argument('input', help='Arquivo de áudio ou pasta com segmentos')
    p_transcribe.add_argument('--language', '-l', default='pt', help='Idioma (default: pt)')
    p_transcribe.add_argument('--output', '-o', help='Arquivo de saída')
    p_transcribe.add_argument('--segments', action='store_true', help='Input é pasta com segmentos')
    p_transcribe.add_argument('--timestamps', action='store_true', default=True, help='Incluir timestamps')
    p_transcribe.set_defaults(func=cmd_transcribe)
    
    # Summarize
    p_summarize = subparsers.add_parser('summarize', help='Resumir transcrição')
    p_summarize.add_argument('input', help='Arquivo de transcrição (.txt ou .json)')
    p_summarize.add_argument('--language', '-l', default='pt', help='Idioma (default: pt)')
    p_summarize.add_argument('--output', '-o', help='Arquivo de saída')
    p_summarize.set_defaults(func=cmd_summarize)
    
    # PDF
    p_pdf = subparsers.add_parser('pdf', help='Gerar PDF do resumo')
    p_pdf.add_argument('input', help='Arquivo JSON do resumo')
    p_pdf.add_argument('--output', '-o', help='Arquivo PDF de saída')
    p_pdf.set_defaults(func=cmd_pdf)
    
    # Full pipeline
    p_full = subparsers.add_parser('full', help='Pipeline completo: gravar -> transcrever -> resumir -> PDF')
    p_full.add_argument('--duration', '-d', type=int, default=300, help='Duração em segundos (default: 300)')
    p_full.add_argument('--device', type=int, help='Índice do dispositivo de áudio')
    p_full.add_argument('--language', '-l', default='pt', help='Idioma (default: pt)')
    p_full.add_argument('--title', '-t', help='Título da reunião')
    p_full.set_defaults(func=cmd_full)
    
    # Auth commands
    p_auth = subparsers.add_parser('auth', help='Gerenciar autenticação')
    p_auth.add_argument('auth_action', choices=['change', 'reset', 'setup'], help='Ação: change=alterar senha, reset=resetar, setup=configurar inicial')
    p_auth.set_defaults(func=cmd_auth)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Garante diretório de saída
    Path(config.output_dir).mkdir(parents=True, exist_ok=True)
    
    # Configura senha inicial se necessário (exceto para auth setup)
    if args.command != 'auth' or args.auth_action != 'setup':
        setup_initial_password()
    
    # Verifica senha para comandos principais (exceto auth)
    if args.command != 'auth':
        if not prompt_password():
            sys.exit(1)
    
    args.func(args)


if __name__ == '__main__':
    main()