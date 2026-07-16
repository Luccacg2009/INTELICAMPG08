import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    # Audio
    sample_rate: int = 16000
    channels: int = 1
    chunk_size: int = 1024
    record_seconds: int = 30
    
    # Whisper
    whisper_model: str = "base"
    whisper_device: str = "auto"
    whisper_compute_type: str = "int8"
    
    # LLM
    llm_provider: str = "ollama"  # openai, ollama, groq
    llm_model: str = "llama3.1:8b"
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    ollama_host: str = "http://localhost:11434"
    
    # Output
    output_dir: str = "./output"
    
    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            whisper_model=os.getenv("WHISPER_MODEL", "base"),
            whisper_device=os.getenv("WHISPER_DEVICE", "auto"),
            whisper_compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "int8"),
            llm_provider=os.getenv("LLM_PROVIDER", "ollama"),
            llm_model=os.getenv("LLM_MODEL", "llama3.1:8b"),
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            groq_api_key=os.getenv("GROQ_API_KEY"),
            ollama_host=os.getenv("OLLAMA_HOST", "http://localhost:11434"),
            output_dir=os.getenv("OUTPUT_DIR", "./output"),
        )

config = Config.from_env()