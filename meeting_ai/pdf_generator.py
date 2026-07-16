from fpdf import FPDF
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass
from meeting_ai.config import config


class MeetingPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(0, 51, 102)
        self.cell(0, 10, 'ATA DE REUNIÃO', 0, 1, 'C')
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Página {self.page_no()}/{{nb}}', 0, 0, 'C')
    
    def section_title(self, title: str):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(0, 51, 102)
        self.cell(0, 8, title, 0, 1, 'L')
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(2)
    
    def section_body(self, text: str):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5, text)
        self.ln(3)
    
    def bullet_list(self, items: List[str]):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(30, 30, 30)
        for item in items:
            self.set_x(15)
            self.multi_cell(0, 5, f'- {item}')
        self.ln(2)
    
    def key_value(self, key: str, value: str):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(0, 51, 102)
        self.cell(45, 6, f'{key}:', 0, 0)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 6, value)
        self.ln(1)
    
    def classification_banner(self, classification: str, reason: str):
        """Desenha banner colorido no topo baseado na classificação"""
        colors = {
            'verde': (34, 139, 34),    # Verde
            'amarelo': (255, 165, 0),  # Laranja/Amarelo
            'vermelho': (178, 34, 34), # Vermelho
        }
        labels = {
            'verde': 'VERDE - Sem necessidade de marketing',
            'amarelo': 'AMARELO - Sugere contato com marketing',
            'vermelho': 'VERMELHO - Requer contato imediato com marketing',
        }
        
        color = colors.get(classification.lower(), colors['verde'])
        label = labels.get(classification.lower(), labels['verde'])
        
        # Banner background
        self.set_fill_color(*color)
        self.rect(10, self.get_y(), 190, 18, 'F')
        
        # Label text
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 12)
        self.set_xy(15, self.get_y() + 2)
        self.cell(180, 8, label, 0, 1, 'C')
        
        # Reason
        self.set_font('Helvetica', '', 9)
        self.set_xy(15, self.get_y() + 1)
        self.multi_cell(180, 5, reason, 0, 'C')
        
        self.ln(8)
        self.set_text_color(30, 30, 30)


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