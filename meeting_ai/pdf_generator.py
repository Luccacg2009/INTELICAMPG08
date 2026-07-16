from fpdf import FPDF
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass
from pathlib import Path
from meeting_ai.config import config

# Cores principais
AZUL_PRINCIPAL = (0, 70, 130)      # Azul escuro principal
AZUL_CLARO = (0, 120, 200)         # Azul médio
AZUL_MUITO_CLARO = (230, 240, 250) # Azul bem claro para fundos
BRANCO = (255, 255, 255)
CINZA_ESCURO = (30, 30, 30)
CINZA_MEDIO = (100, 100, 100)
CINZA_CLARO = (200, 200, 200)

# Cores brasileiras para detalhes decorativos
VERDE_BRASIL = (0, 156, 59)        # Verde da bandeira
AMARELO_BRASIL = (255, 223, 0)     # Amarelo da bandeira

# Caminho dos assets
ASSETS_DIR = Path(__file__).parent / "assets"
SABIA_IMAGE = ASSETS_DIR / "sabia.png"


class MeetingPDF(FPDF):
    def __init__(self):
        super().__init__()
        self._draw_decorations = True
    
    def header(self):
        # Barra azul no topo
        self.set_fill_color(*AZUL_PRINCIPAL)
        self.rect(0, 0, 210, 18, 'F')
        
        # Linha decorativa verde-amarela (Brasil) abaixo do header
        self.set_draw_color(*VERDE_BRASIL)
        self.set_line_width(1.5)
        self.line(0, 18, 210, 18)
        self.set_draw_color(*AMARELO_BRASIL)
        self.set_line_width(1)
        self.line(0, 19.5, 210, 19.5)
        
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(*BRANCO)
        self.set_y(4)
        self.cell(0, 10, 'ATA DE REUNIÃO', 0, 1, 'C')
        self.ln(4)
    
    def footer(self):
        self.set_y(-25)
        # Linha decorativa brasileira no rodapé
        self.set_draw_color(*AMARELO_BRASIL)
        self.set_line_width(1)
        self.line(10, self.get_y(), 200, self.get_y())
        self.set_draw_color(*VERDE_BRASIL)
        self.set_line_width(1.5)
        self.line(10, self.get_y() + 1.5, 200, self.get_y() + 1.5)
        
        self.ln(5)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(*CINZA_MEDIO)
        self.cell(0, 10, f'Página {self.page_no()}/{{nb}}', 0, 0, 'C')
        
        # Pequeno pássaro decorativo no rodapé (canto inferior direito)
        if self._draw_decorations and SABIA_IMAGE.exists():
            try:
                self.image(str(SABIA_IMAGE), x=185, y=self.get_y() - 2, w=8, h=8)
            except Exception:
                pass
    
    def _draw_watermark_bird(self):
        """Desenha o pássaro sabiá como marca d'água sutil no centro da página"""
        if not self._draw_decorations or not SABIA_IMAGE.exists():
            return
        try:
            # Posição central com transparência simulada (desenha com cor clara)
            page_w = self.w
            page_h = self.h
            img_w = 60
            img_h = 60
            x = (page_w - img_w) / 2
            y = (page_h - img_h) / 2
            
            # Salva estado atual
            self.set_alpha(0.08)  # Transparência baixa para marca d'água
            self.image(str(SABIA_IMAGE), x=x, y=y, w=img_w, h=img_h)
            self.set_alpha(1.0)  # Restaura opacidade
        except Exception:
            self.set_alpha(1.0)
    
    def _draw_corner_birds(self):
        """Desenha pequenos pássaros nos cantos da página"""
        if not self._draw_decorations or not SABIA_IMAGE.exists():
            return
        try:
            # Canto superior esquerdo
            self.image(str(SABIA_IMAGE), x=5, y=25, w=12, h=12)
            # Canto superior direito
            self.image(str(SABIA_IMAGE), x=193, y=25, w=12, h=12)
        except Exception:
            pass
    
    def section_title(self, title: str):
        # Fundo azul claro para título da seção
        self.set_fill_color(*AZUL_MUITO_CLARO)
        self.set_draw_color(*AZUL_PRINCIPAL)
        y_before = self.get_y()
        self.rect(10, y_before, 190, 10, 'FD')
        
        # Pequena linha decorativa amarela à esquerda do título
        self.set_draw_color(*AMARELO_BRASIL)
        self.set_line_width(2)
        self.line(11, y_before + 2, 11, y_before + 8)
        
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*AZUL_PRINCIPAL)
        self.set_xy(18, y_before + 1)
        self.cell(180, 8, title, 0, 1, 'L')
        self.ln(4)
    
    def section_body(self, text: str):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*CINZA_ESCURO)
        self.multi_cell(0, 5.5, text)
        self.ln(3)
    
    def bullet_list(self, items: List[str]):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*CINZA_ESCURO)
        for item in items:
            self.set_x(18)
            # Bullet azul
            self.set_text_color(*AZUL_PRINCIPAL)
            self.cell(6, 5.5, '- ')
            self.set_text_color(*CINZA_ESCURO)
            self.multi_cell(0, 5.5, item)
        self.ln(2)
    
    def key_value(self, key: str, value: str):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*AZUL_PRINCIPAL)
        self.cell(50, 6, f'{key}:', 0, 0)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*CINZA_ESCURO)
        self.multi_cell(0, 6, value)
        self.ln(1)
    
    def classification_banner(self, classification: str, reason: str):
        """Desenha banner colorido no topo baseado na classificação"""
        colors = {
            'verde': (34, 139, 34),
            'amarelo': (255, 165, 0),
            'vermelho': (178, 34, 34),
        }
        labels = {
            'verde': 'VERDE - Sem necessidade de acionar marketing',
            'amarelo': 'AMARELO - Sugere contato com marketing',
            'vermelho': 'VERMELHO - Requer contato imediato com marketing',
        }
        
        color = colors.get(classification.lower(), colors['verde'])
        label = labels.get(classification.lower(), labels['verde'])
        
        # Banner background com cor da classificação
        self.set_fill_color(*color)
        self.rect(10, self.get_y(), 190, 20, 'F')
        
        # Faixa azul decorativa no topo do banner
        self.set_fill_color(*AZUL_PRINCIPAL)
        self.rect(10, self.get_y(), 190, 3, 'F')
        
        # Detalhe brasileiro: pequenas linhas verde/amarela nas laterais
        self.set_draw_color(*VERDE_BRASIL)
        self.set_line_width(2)
        self.line(10, self.get_y(), 10, self.get_y() + 20)
        self.line(200, self.get_y(), 200, self.get_y() + 20)
        self.set_draw_color(*AMARELO_BRASIL)
        self.set_line_width(1)
        self.line(12, self.get_y(), 12, self.get_y() + 20)
        self.line(198, self.get_y(), 198, self.get_y() + 20)
        
        # Label text
        self.set_text_color(*BRANCO)
        self.set_font('Helvetica', 'B', 12)
        self.set_xy(15, self.get_y() + 4)
        self.cell(180, 8, label, 0, 1, 'C')
        
        # Reason
        self.set_font('Helvetica', '', 9)
        self.set_xy(15, self.get_y() + 1)
        self.multi_cell(180, 5, reason, 0, 'C')
        
        self.ln(10)
        self.set_text_color(*CINZA_ESCURO)
    
    def _draw_sabia_watermark(self):
        """Desenha o sabiá como marca d'água central (se imagem existir)"""
        if SABIA_IMAGE.exists():
            try:
                # Marca d'água central grande com transparência simulada
                self.set_alpha(0.08)
                self.image(str(SABIA_IMAGE), x=55, y=60, w=100)
                self.set_alpha(1.0)
            except Exception:
                pass  # Ignora se houver erro com a imagem
    
    def _draw_corner_sabias(self):
        """Desenha pequenos sabiás nos cantos das páginas"""
        if SABIA_IMAGE.exists():
            try:
                self.set_alpha(0.15)
                # Canto superior esquerdo
                self.image(str(SABIA_IMAGE), x=12, y=22, w=18)
                # Canto superior direito
                self.image(str(SABIA_IMAGE), x=180, y=22, w=18)
                # Canto inferior esquerdo
                self.image(str(SABIA_IMAGE), x=12, y=255, w=15)
                # Canto inferior direito
                self.image(str(SABIA_IMAGE), x=183, y=255, w=15)
                self.set_alpha(1.0)
            except Exception:
                pass  # Ignora se houver erro com a imagem
    
    def _draw_brazilian_border(self):
        """Desenha uma borda sutil inspirada na bandeira brasileira"""
        # Linha verde fina no topo
        self.set_draw_color(*VERDE_BRASIL)
        self.set_line_width(0.8)
        self.line(10, 18, 200, 18)
        
        # Linha amarela fina abaixo
        self.set_draw_color(*AMARELO_BRASIL)
        self.set_line_width(0.4)
        self.line(10, 19, 200, 19)
        
        # Linhas laterais sutis
        self.set_draw_color(*VERDE_BRASIL)
        self.set_line_width(0.3)
        self.line(10, 18, 10, 277)
        self.line(200, 18, 200, 277)


@dataclass
class MeetingSummary:
    title: str
    date: str
    participants: List[str]
    summary: str
    key_points: List[str]
    decisions: List[str]
    action_items: List[str]
    next_steps: List[str]
    classification: str = "verde"
    classification_reason: str = ""


def generate_meeting_pdf(
    summary: MeetingSummary,
    output_path: str,
    title: Optional[str] = None
) -> str:
    pdf = MeetingPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    
    # Elementos decorativos brasileiros
    pdf._draw_brazilian_border()
    pdf._draw_sabia_watermark()
    pdf._draw_corner_sabias()
    
    # Classification Banner (top)
    if summary.classification:
        pdf.classification_banner(summary.classification, summary.classification_reason)
    
    # Header info
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(*AZUL_PRINCIPAL)
    pdf.cell(0, 10, summary.title or title or 'Reunião', 0, 1, 'C')
    pdf.ln(2)
    
    # Meta info
    pdf.key_value('Data da Reunião', summary.date)
    pdf.key_value('Gerado em', datetime.now().strftime('%d/%m/%Y %H:%M'))
    pdf.ln(4)
    
    # Participants
    if summary.participants:
        pdf.section_title('PARTICIPANTES')
        pdf.bullet_list(summary.participants)
    
    # Summary
    if summary.summary:
        pdf.section_title('RESUMO EXECUTIVO')
        pdf.section_body(summary.summary)
    
    # Key Points
    if summary.key_points:
        pdf.section_title('PONTOS PRINCIPAIS')
        pdf.bullet_list(summary.key_points)
    
    # Decisions
    if summary.decisions:
        pdf.section_title('DECISÕES TOMADAS')
        pdf.bullet_list(summary.decisions)
    
    # Action Items
    if summary.action_items:
        pdf.section_title('AÇÕES E RESPONSÁVEIS')
        pdf.bullet_list(summary.action_items)
    
    # Next Steps
    if summary.next_steps:
        pdf.section_title('PRÓXIMOS PASSOS')
        pdf.bullet_list(summary.next_steps)
    
    pdf.output(output_path)
    print(f"PDF gerado: {output_path}")
    return output_path