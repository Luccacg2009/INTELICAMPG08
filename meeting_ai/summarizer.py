import os
import json
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
from meeting_ai.config import config


@dataclass
class MeetingSummary:
    title: str
    date: str
    participants: list
    summary: str
    key_points: list
    decisions: list
    action_items: list
    next_steps: list
    classification: str = "verde"  # verde, amarelo, vermelho
    classification_reason: str = ""


SUMMARY_PROMPT = """Você é um assistente especializado em criar atas de reunião estruturadas.

Analise a transcrição abaixo e crie um resumo estruturado em PORTUGUÊS (PT-BR) no formato JSON exato:

{
  "title": "Título descritivo da reunião",
  "date": "Data da reunião (se mencionada) ou 'Não informada'",
  "participants": ["Lista de participantes mencionados"],
  "summary": "Resumo executivo de 2-3 parágrafos cobrindo os principais tópicos discutidos",
  "key_points": ["Ponto principal 1", "Ponto principal 2", "..."],
  "decisions": ["Decisão 1", "Decisão 2", "..."],
  "action_items": ["Ação 1 - Responsável: Nome - Prazo: Data", "Ação 2 - Responsável: Nome - Prazo: Data", "..."],
  "next_steps": ["Próximo passo 1", "Próximo passo 2", "..."],
  "classification": "verde|amarelo|vermelho",
  "classification_reason": "Justificativa breve para a classificação"
}

REGRAS DE CLASSIFICAÇÃO (baseado no conteúdo da reunião):
- VERDE: Reunião operacional/rotineira, sem problemas críticos, decisões alinhadas, nenhum risco identificado. Não requer ação de marketing.
- AMARELO: Reunião com pontos de atenção, alguns riscos ou oportunidades moderadas, decisões que podem impactar comunicação externa. Sugere contato com marketing mas não é urgente.
- VERMELHO: Reunião com crise, problemas graves, decisões de alto impacto reputacional, lançamentos urgentes, mudança de estratégia crítica. Requer contato imediato com marketing (apenas sugestão).

Regras:
- Se informação não estiver na transcrição, use lista vazia [] ou string vazia ""
- Seja objetivo e conciso
- Extraia nomes de pessoas mencionadas como participantes
- Ações devem ter responsável e prazo se mencionados
- Decisões devem ser claras e acionáveis
- CLASSIFICAÇÃO OBRIGATÓRIA: escolha apenas verde, amarelo ou vermelho

TRANSCRIÇÃO:
{transcript}
"""


class LLMSummarizer:
    def __init__(self):
        self.llm_provider = config.llm_provider
        self.ollama_model = config.llm_model
        self.ollama_host = config.ollama_host
    
    def summarize(self, transcript: str, language: str = "pt") -> MeetingSummary:
        if self.llm_provider == "ollama":
            return self._summarize_local(transcript, language)
        else:
            return self._summarize_api(transcript, language)
    
    def _summarize_local(self, transcript: str, language: str) -> MeetingSummary:
        try:
            import ollama
            client = ollama.Client(host=self.ollama_host)
            
            prompt = SUMMARY_PROMPT.format(transcript=transcript[:12000])
            
            response = client.generate(
                model=self.ollama_model,
                prompt=prompt,
                options={"temperature": 0.1, "num_predict": 2048}
            )
            
            return self._parse_response(response['response'])
        
        except Exception as e:
            print(f"Erro no Ollama: {e}")
            return self._fallback_summary(transcript)
    
    def _summarize_api(self, transcript: str, language: str) -> MeetingSummary:
        # Placeholder para API externa (OpenAI, etc)
        return self._fallback_summary(transcript)
    
    def _parse_response(self, response: str) -> MeetingSummary:
        try:
            # Try to extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                data = json.loads(json_str)
                return MeetingSummary(**data)
        except Exception as e:
            print(f"Erro ao parsear JSON: {e}")
        
        return self._fallback_summary("")
    
    def _fallback_summary(self, transcript: str) -> MeetingSummary:
        return MeetingSummary(
            title="Reunião (resumo automático falhou)",
            date="Não informada",
            participants=[],
            summary=transcript[:500] + "..." if len(transcript) > 500 else transcript,
            key_points=[],
            decisions=[],
            action_items=[],
            next_steps=[],
            classification="verde",
            classification_reason="Classificação padrão (fallback)"
        )