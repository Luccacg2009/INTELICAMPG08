from fpdf import FPDF
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass
from meeting_ai.config import config

# Azul principal da marca
AZUL_PRINCIPAL = (0, 70, 130)      # Azul escuro principal
AZUL_CLARO = (0, 120, 200)         # Azul médio
AZUL_MUITO_CLARO = (230, 240, 250) # Azul bem claro para fundos
BRANCO = (255, 255, 255)
CINZA_ESCURO = (30, 30, 30)
CINZA_MEDIO = (100, 100, 100)
CINZA_CLARO = (200, 200, 200)


class MeetingPDF(FPDF):
    def header(self):
        # Barra azul no topo
        self.set_fill_color(*AZUL_PRINCIPAL)
        self.rect(0, 0, 210, 18, 'F')
        
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(*BRANCO)
        self.set_y(4)
        self.cell(0, 10, 'ATA DE REUNIÃO', 0, 1, 'C')
        self.ln(4)
    
    def footer(self):
        self.set_y(-20)
        # Linha azul fina
        self.set_draw_color(*AZUL_PRINCIPAL)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(2)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(*CINZA_MEDIO)
        self.cell(0, 10, f'Página {self.page_no()}/{{nb}}', 0, 0, 'C')
    
    def section_title(self, title: str):
        # Fundo azul claro para título da seção
        self.set_fill_color(*AZUL_MUITO_CLARO)
        self.set_draw_color(*AZUL_PRINCIPAL)
        y_before = self.get_y()
        self.rect(10, y_before, 190, 10, 'FD')
        
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*AZUL_PRINCIPAL)
        self.set_xy(15, y_before + 1)
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
            # Bullet simples (traço) - compatível com fonte padrão
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
    
    # Classification Banner (top)
    if summary.classification:
        pdf.classification_banner(summary.classification, summary.classification_reason)
    
    # Header info
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(0, 51, 102)
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