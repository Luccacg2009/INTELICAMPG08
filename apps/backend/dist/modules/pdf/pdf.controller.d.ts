import { Response } from 'express';
import { PdfService } from './pdf.service';
import { IdeasService } from '../ideas/ideas.service';
import { User } from '../users/user.entity';
export declare class PdfController {
    private pdfService;
    private ideasService;
    constructor(pdfService: PdfService, ideasService: IdeasService);
    generateIdeaPdf(id: string, res: Response, user: User): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=pdf.controller.d.ts.map