import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { Idea } from '../ideas/idea.entity';
import { User } from '../users/user.entity';

export interface IdeaPdfData {
  idea: Idea;
  author: User;
  summary: string;
  strengths: string;
  weaknesses: string;
  developmentWays: string;
}

@Injectable()
export class PdfService {
  generateIdeaPdf(data: IdeaPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.buildPdf(doc, data);
      doc.end();
    });
  }

  private buildPdf(doc: PDFKit.PDFDocument, data: IdeaPdfData) {
    const { idea, author, summary, strengths, weaknesses, developmentWays } = data;

    doc.fontSize(24).font('Helvetica-Bold').text('RELATÓRIO DE IDEAÇÃO DE PRODUTO', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text('Empresa Azul - Vertical de Marketing', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(10).font('Helvetica').text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'right' });
    doc.moveDown(1);

    this.addSection(doc, 'INFORMAÇÕES GERAIS');
    this.addField(doc, 'Título da Ideia', idea.title);
    this.addField(doc, 'Vertical Responsável', idea.vertical);
    this.addField(doc, 'Autor', `${author.name} (${author.email})`);
    this.addField(doc, 'Vertical do Autor', author.vertical || 'Não informada');
    this.addField(doc, 'Data de Submissão', idea.createdAt.toLocaleDateString('pt-BR'));
    this.addField(doc, 'Status Atual', this.translateStatus(idea.status));
    doc.moveDown();

    this.addSection(doc, 'IDEIA CENTRAL');
    this.addParagraph(doc, idea.description);
    doc.moveDown();

    this.addSection(doc, 'PÚBLICO-ALVO');
    this.addParagraph(doc, idea.targetAudience);
    doc.moveDown();

    if (idea.motivation) {
      this.addSection(doc, 'MOTIVAÇÃO');
      this.addParagraph(doc, idea.motivation);
      doc.moveDown();
    }

    if (idea.launchLocation) {
      this.addSection(doc, 'LOCAL DE LANÇAMENTO PRETENDIDO');
      this.addParagraph(doc, idea.launchLocation);
      doc.moveDown();
    }

    this.addSection(doc, 'RESUMO EXECUTIVO (GERADO POR IA)');
    this.addParagraph(doc, summary);
    doc.moveDown();

    this.addSection(doc, 'PONTOS FORTES');
    this.addBulletList(doc, strengths);
    doc.moveDown();

    this.addSection(doc, 'PONTOS FRACOS');
    this.addBulletList(doc, weaknesses);
    doc.moveDown();

    this.addSection(doc, 'FORMAS DE DESENVOLVIMENTO');
    this.addBulletList(doc, developmentWays);
    doc.moveDown(2);

    doc.fontSize(10).font('Helvetica-Oblique').text(
      'Documento confidencial - Uso interno da Empresa Azul',
      { align: 'center' }
    );
  }

  private addSection(doc: PDFKit.PDFDocument, title: string) {
    doc.fontSize(14).font('Helvetica-Bold').text(title);
    doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).strokeColor('#2563eb').stroke();
    doc.moveDown(0.5);
  }

  private addField(doc: PDFKit.PDFDocument, label: string, value: string) {
    doc.fontSize(10).font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value);
  }

  private addParagraph(doc: PDFKit.PDFDocument, text: string) {
    doc.fontSize(11).font('Helvetica').text(text, { align: 'justify' });
  }

  private addBulletList(doc: PDFKit.PDFDocument, text: string) {
    const items = text.split('\n').filter(item => item.trim());
    items.forEach(item => {
      doc.fontSize(11).font('Helvetica').text(`• ${item.trim()}`, { indent: 20 });
    });
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      PENDING_REVIEW: 'Aguardando Análise',
      UNDER_REVIEW: 'Em Análise',
      APPROVED: 'Aprovada',
      REJECTED: 'Rejeitada',
      IN_DEVELOPMENT: 'Em Desenvolvimento',
      LAUNCHED: 'Lançada',
      ARCHIVED: 'Arquivada',
      AI_DELETION_REQUESTED: 'Exclusão por IA Solicitada',
      DELETED_BY_AI: 'Excluída por IA',
    };
    return map[status] || status;
  }
}