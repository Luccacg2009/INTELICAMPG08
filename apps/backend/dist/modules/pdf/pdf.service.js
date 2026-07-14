"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PdfService = class PdfService {
    generateIdeaPdf(data) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            this.buildPdf(doc, data);
            doc.end();
        });
    }
    buildPdf(doc, data) {
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
        doc.fontSize(10).font('Helvetica-Oblique').text('Documento confidencial - Uso interno da Empresa Azul', { align: 'center' });
    }
    addSection(doc, title) {
        doc.fontSize(14).font('Helvetica-Bold').text(title);
        doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).strokeColor('#2563eb').stroke();
        doc.moveDown(0.5);
    }
    addField(doc, label, value) {
        doc.fontSize(10).font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(value);
    }
    addParagraph(doc, text) {
        doc.fontSize(11).font('Helvetica').text(text, { align: 'justify' });
    }
    addBulletList(doc, text) {
        const items = text.split('\n').filter(item => item.trim());
        items.forEach(item => {
            doc.fontSize(11).font('Helvetica').text(`• ${item.trim()}`, { indent: 20 });
        });
    }
    translateStatus(status) {
        const map = {
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
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map