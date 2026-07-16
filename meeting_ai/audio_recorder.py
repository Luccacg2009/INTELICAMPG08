import pyaudio
import wave
import threading
import time
import os
from datetime import datetime
from typing import Optional, Callable
from meeting_ai.config import config


class AudioRecorder:
    def __init__(
        self,
        sample_rate: int = None,
        channels: int = None,
        chunk_size: int = None,
        device_index: int = None
    ):
        self.sample_rate = sample_rate or config.sample_rate
        self.channels = channels or config.channels
        self.chunk_size = chunk_size or config.chunk_size
        self.device_index = device_index
        
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.frames = []
        self.recording = False
        self.thread = None
        self.on_segment: Optional[Callable[[str], None]] = None
        self.segment_duration = config.record_seconds
    
    def list_devices(self):
        print("Dispositivos de áudio disponíveis:")
        for i in range(self.audio.get_device_count()):
            info = self.audio.get_device_info_by_index(i)
            print(f"  [{i}] {info['name']} (in: {info['maxInputChannels']}, out: {info['maxOutputChannels']})")
    
    def start(self, on_segment: Optional[Callable[[str], None]] = None):
        if self.recording:
            return
        
        self.on_segment = on_segment
        self.recording = True
        self.frames = []
        
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=self.channels,
            rate=self.sample_rate,
            input=True,
            input_device_index=self.device_index,
            frames_per_buffer=self.chunk_size
        )
        
        self.thread = threading.Thread(target=self._record_loop)
        self.thread.start()
        print(f"Gravação iniciada (segmentos de {self.segment_duration}s)")
    
    def _record_loop(self):
        segment_frames = []
        frames_per_segment = int(self.sample_rate / self.chunk_size * self.segment_duration)
        
        while self.recording:
            data = self.stream.read(self.chunk_size, exception_on_overflow=False)
            segment_frames.append(data)
            self.frames.append(data)
            
            if len(segment_frames) >= frames_per_segment:
                self._save_segment(segment_frames)
                segment_frames = []
    
    def _save_segment(self, frames):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        os.makedirs(config.output_dir, exist_ok=True)
        filename = os.path.join(config.output_dir, f"segment_{timestamp}.wav")
        
        with wave.open(filename, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.audio.get_sample_size(pyaudio.paInt16))
            wf.setframerate(self.sample_rate)
            wf.writeframes(b''.join(frames))
        
        print(f"Segmento salvo: {filename}")
        if self.on_segment:
            self.on_segment(filename)
    
    def stop(self) -> str:
        if not self.recording:
            return ""
        
        self.recording = False
        if self.thread:
            self.thread.join()
        
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        os.makedirs(config.output_dir, exist_ok=True)
        filename = os.path.join(config.output_dir, f"recording_{timestamp}.wav")
        
        with wave.open(filename, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.audio.get_sample_size(pyaudio.paInt16))
            wf.setframerate(self.sample_rate)
            wf.writeframes(b''.join(self.frames))
        
        print(f"Gravação completa salva: {filename}")
        return filename
    
    def __del__(self):
        self.audio.terminate()


def record_meeting(
    duration_seconds: int = None,
    device_index: int = None,
    on_segment: Optional[Callable[[str], None]] = None
) -> str:
    recorder = AudioRecorder(
        device_index=device_index,
        record_seconds=config.record_seconds
    )
    recorder.start(on_segment)
    
    try:
        target_duration = duration_seconds or (config.record_seconds * 10)
        time.sleep(target_duration)
    except KeyboardInterrupt:
        print("\nInterrompido pelo usuário")
    finally:
        return recorder.stop()