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
export declare class PdfService {
    generateIdeaPdf(data: IdeaPdfData): Promise<Buffer>;
    private buildPdf;
    private addSection;
    private addField;
    private addParagraph;
    private addBulletList;
    private translateStatus;
}
//# sourceMappingURL=pdf.service.d.ts.map