# Meeting AI - Ata de Reunião Automática

Sistema completo para gravar reuniões online (Meet/Teams/Zoom), transcrever com Whisper local e gerar PDF com resumo estruturado via LLM.

## Funcionalidades

- **Gravação de áudio do sistema** - Captura áudio de reuniões online (precisa configurar loopback)
- **Transcrição local** - Whisper (faster-whisper) rodando na sua máquina, sem nuvem
- **Resumo estruturado** - LLM (Ollama local ou OpenAI/Groq) gera ata com: participantes, resumo, decisões, ações, próximos passos
- **Classificação automática** - IA classifica a reunião em **Verde/Amarelo/Vermelho** com banner colorido no PDF indicando se deve acionar marketing
- **Acesso restrito** - Autenticação por senha (padrão: `azul123`), apenas tomadores de decisão (incl. outras verticais)
- **PDF profissional** - Gera ata formatada pronta para compartilhar
- **Pipeline completo** - Um comando faz tudo: `meeting-ai full`

## Pré-requisitos

### 1. Sistema de áudio (Loopback)

**Linux (PipeWire/PulseAudio):**
```bash
# Instalar dependências
sudo apt install libportaudio2 portaudio19-dev

# Listar dispositivos para achar o monitor
pactl list short sources
# Procure por algo como "alsa_output.pci-...monitor"
```

**macOS:**
```bash
# Instalar BlackHole (driver de áudio virtual)
brew install blackhole-2ch
# Ou use Background Music app
```

**Windows:**
```bash
# Instalar VB-Cable
# https://vb-audio.com/Cable/
```

### 2. Python e dependências

```bash
cd meeting_ai
pip install -r requirements.txt
```

### 3. Modelo LLM (escolha um)

**Opção A: Ollama (local, grátis, recomendado)**
```bash
# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar modelo
ollama pull llama3.1:8b
# ou para português: ollama pull aya:8b

# Iniciar servidor
ollama serve
```

**Opção B: OpenAI (cloud)**
```bash
export OPENAI_API_KEY=sua-chave
# Edite .env: LLM_PROVIDER=openai, LLM_MODEL=gpt-4o-mini
```

**Opção C: Groq (cloud, rápido, grátis)**
```bash
export GROQ_API_KEY=sua-chave
# Edite .env: LLM_PROVIDER=groq, LLM_MODEL=llama-3.1-8b-instant
```

## Configuração

```bash
cp .env.example .env
# Edite .env conforme necessário
```

## Uso

### Pipeline completo (recomendado)
```bash
# Grava 5 min, transcreve, resume, gera PDF
python main.py full --duration 300 --title "Reunião de Planejamento"

# Lista dispositivos de áudio primeiro
python main.py record --list-devices
```

### Comandos individuais

```bash
# 1. Apenas gravar
python main.py record --duration 600 --device 2

# 2. Transcrever arquivo ou pasta de segmentos
python main.py transcribe audio.wav
python main.py transcribe ./output/segments --segments

# 3. Resumir transcrição
python main.py summarize transcript.txt

# 4. Gerar PDF do resumo
python main.py pdf summary.json
```

### Autenticação (acesso restrito)

O sistema requer senha para acesso. Apenas tomadores de decisão têm acesso.

```bash
# Primeira execução - configura senha inicial (padrão: azul123)
python main.py auth setup

# Altera senha
python main.py auth change

# Reseta senha para padrão
python main.py auth reset
```

Na primeira execução de qualquer comando principal (`record`, `transcribe`, `summarize`, `pdf`, `full`), será solicitada a senha. Se não houver senha configurada, usará a padrão `azul123` e pedirá para configurar uma nova.

## Saída

Todos os arquivos vão para `./output/` (configurável no `.env`):
```
output/
├── segments/           # Segmentos de áudio (30s cada)
├── transcript_*.txt    # Transcrição com timestamps
├── transcript_*.json   # Transcrição estruturada
├── summary_*.json      # Resumo estruturado
└── ata_*.pdf           # PDF final da ata
```

## Exemplo de PDF gerado

O PDF contém:
- **Banner de classificação colorido** (verde/amarelo/vermelho) indicando necessidade de acionar marketing:
  - 🟢 **VERDE**: Reunião operacional/rotineira - **não é necessário acionar a equipe de marketing**
  - 🟡 **AMARELO**: Pontos de atenção/oportunidades moderadas - **sugere contato com marketing** (não urgente)
  - 🔴 **VERMELHO**: Crise/alto impacto/lançamento urgente - **sugere contato imediato com marketing** (apenas sugestão)
- **Título e data** da reunião
- **Participantes** identificados na transcrição
- **Resumo executivo** (2-3 parágrafos)
- **Pontos principais** discutidos
- **Decisões tomadas**
- **Ações e responsáveis** (com prazos se mencionados)
- **Próximos passos**

## Dicas

1. **Teste o áudio primeiro**: `python main.py record --list-devices` e veja qual é o "monitor" do seu sistema
2. **Modelo Whisper**: `base` é rápido, `small`/`medium` mais preciso. Use `large-v3` se tiver GPU
3. **Ollama**: Modelos menores (8b) são rápidos; 70b dá melhor qualidade mas precisa mais RAM
4. **Reuniões longas**: O sistema grava em segmentos de 30s para não perder nada se travar

## Solução de problemas

| Problema | Solução |
|----------|---------|
| "No input device found" | Configure loopback/BlackHole/VB-Cable e use `--device N` |
| Transcrição ruim | Use modelo `medium` ou `large-v3`, verifique ganho do microfone |
| Ollama não conecta | `ollama serve` rodando? `OLLAMA_HOST` correto no .env? |
| PDF com caracteres estranhos | Fonte Helvetica não tem todos chars PT-BR; use `DejaVu` se precisar |

## Licença

MIT