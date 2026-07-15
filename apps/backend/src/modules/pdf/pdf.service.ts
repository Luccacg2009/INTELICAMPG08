import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Project } from '../projects/project.entity';

@Injectable()
export class PDFService {
  async generateProjectPdf(project: Project): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.buildProjectPdf(doc, project);
      doc.end();
    });
  }

  private buildProjectPdf(doc: PDFKit.PDFDocument, project: Project): void {
    // Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e3a5f').text('AZUL LINHAS AÉREAS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').fillColor('#666').text('Relatório de Projeto de Marketing', { align: 'center' });
    doc.moveDown(1.5);

    // Project Info
    doc.fontSize(12).fillColor('#333');
    
    const info = [
      ['Título:', project.title],
      ['Vertical:', project.vertical],
      ['Status:', project.status],
      ['Prioridade:', project.priority],
      ['Orçamento:', project.budget ? `R$ ${project.budget.toLocaleString('pt-BR')}` : 'Não informado'],
      ['Prazo:', project.timeline || 'Não informado'],
    ];

    info.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true });
      doc.font('Helvetica').text(` ${value}`);
    });

    doc.moveDown(1.5);

    // Description
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e3a5f').text('Descrição do Projeto');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#333').text(project.description, { align: 'justify' });
    doc.moveDown(1);

    // Objective
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e3a5f').text('Objetivo');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#333').text(project.centralIdea, { align: 'justify' });
    doc.moveDown(1);

    // Target Audience
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e3a5f').text('Público-alvo');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#333').text(project.targetAudience, { align: 'justify' });
    doc.moveDown(1);

    // Central Idea
    if (project.centralIdea) {
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e3a5f').text('Ideia Central');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').fillColor('#333').text(project.centralIdea, { align: 'justify' });
      doc.moveDown(1);
    }

    // AI Analysis
    if (project.aiSummary || project.aiAnalysis) {
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e3a5f').text('Análise por Inteligência Artificial');
      doc.moveDown(1);
      
      if (project.aiSummary) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Resumo Executivo:');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor('#333').text(project.aiSummary, { align: 'justify' });
        doc.moveDown(1);
      }
      
      if (project.aiAnalysis) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Análise Completa:');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor('#333').text(project.aiAnalysis, { align: 'justify' });
      }
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#999').text(
      `Documento gerado em ${new Date().toLocaleString('pt-BR')} | Azul Linhas Aéreas - Confidencial`,
      { align: 'center' }
    );
  }
}