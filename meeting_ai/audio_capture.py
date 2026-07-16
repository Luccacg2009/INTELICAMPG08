import pyaudio
import numpy as np
import threading
import time
import wave
import os
from typing import Optional, Callable
from config import config

class AudioCapture:
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
        self.stream: Optional[pyaudio.Stream] = None
        self.frames = []
        self.recording = False
        self.callback: Optional[Callable[[np.ndarray], None]] = None
        self._thread: Optional[threading.Thread] = None
        
    def list_devices(self):
        """Lista dispositivos de áudio disponíveis"""
        print("Dispositivos de áudio disponíveis:")
        for i in range(self.audio.get_device_count()):
            info = self.audio.get_device_info_by_index(i)
            print(f"  [{i}] {info['name']} - in:{int(info['maxInputChannels'])} out:{int(info['maxOutputChannels'])}")
    
    def find_system_audio_device(self) -> int:
        """Tenta encontrar o dispositivo de áudio do sistema (monitor)"""
        for i in range(self.audio.get_device_count()):
            info = self.audio.get_device_info_by_index(i)
            name = info['name'].lower()
            if any(kw in name for kw in ['monitor', 'loopback', 'stereo mix', 'what u hear', 'system']):
                if info['maxInputChannels'] > 0:
                    print(f"Dispositivo de loopback encontrado: [{i}] {info['name']}")
                    return i
        return -1
    
    def set_callback(self, callback: Callable[[np.ndarray], None]):
        self.callback = callback
    
    def start(self):
        if self.recording:
            return
            
        if self.device_index is None:
            self.device_index = self.find_system_audio_device()
            if self.device_index == -1:
                print("AVISO: Dispositivo de loopback não encontrado. Use list_devices() para ver opções.")
                self.device_index = self.audio.get_default_input_device_info()['index']
        
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=self.channels,
            rate=self.sample_rate,
            input=True,
            input_device_index=self.device_index,
            frames_per_buffer=self.chunk_size,
            stream_callback=self._callback
        )
        
        self.recording = True
        self.frames = []
        self.stream.start_stream()
        print(f"Gravando do dispositivo [{self.device_index}]...")
    
    def _callback(self, in_data, frame_count, time_info, status):
        if self.recording:
            audio_data = np.frombuffer(in_data, dtype=np.int16).astype(np.float32) / 32768.0
            self.frames.append(audio_data)
            if self.callback:
                self.callback(audio_data)
        return (in_data, pyaudio.paContinue)
    
    def stop(self) -> np.ndarray:
        if not self.recording:
            return np.array([])
            
        self.recording = False
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        
        if self.frames:
            audio = np.concatenate(self.frames)
            print(f"Gravação finalizada: {len(audio)/self.sample_rate:.1f}s")
            return audio
        return np.array([])
    
    def save_wav(self, filename: str, audio: np.ndarray):
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        audio_int16 = (audio * 32767).astype(np.int16)
        with wave.open(filename, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(2)
            wf.setframerate(self.sample_rate)
            wf.writeframes(audio_int16.tobytes())
        print(f"Áudio salvo: {filename}")
    
    def close(self):
        self.stop()
        self.audio.terminate()

class SegmentRecorder:
    def __init__(self, capture: AudioCapture, segment_duration: int = 30):
        self.capture = capture
        self.segment_duration = segment_duration
        self.segments = []
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._callback: Optional[Callable[[str], None]] = None
    
    def set_segment_callback(self, callback: Callable[[str], None]):
        self._callback = callback
    
    def start(self):
        self._running = True
        self.capture.start()
        self._thread = threading.Thread(target=self._record_loop)
        self._thread.start()
    
    def _record_loop(self):
        while self._running:
            time.sleep(self.segment_duration)
            if not self._running:
                break
            audio = self.capture.stop()
            if len(audio) > 0:
                filename = f"segment_{len(self.segments):04d}.wav"
                filepath = os.path.join(config.output_dir, "segments", filename)
                self.capture.save_wav(filepath, audio)
                self.segments.append(filepath)
                if self._callback:
                    self._callback(filepath)
                self.capture.start()
    
    def stop(self) -> list:
        self._running = False
        audio = self.capture.stop()
        if len(audio) > 0:
            filename = f"segment_{len(self.segments):04d}.wav"
            filepath = os.path.join(config.output_dir, "segments", filename)
            self.capture.save_wav(filepath, audio)
            self.segments.append(filepath)
        if self._thread:
            self._thread.join()
        return self.segments
    
    def get_all_audio(self) -> np.ndarray:
        all_audio = []
        for seg in self.segments:
            import wave
            with wave.open(seg, 'rb') as wf:
                frames = wf.readframes(wf.getnframes())
                audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
                all_audio.append(audio)
        return np.concatenate(all_audio) if all_audio else np.array([])