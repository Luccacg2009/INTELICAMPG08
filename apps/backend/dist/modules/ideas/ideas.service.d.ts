import { Repository } from 'typeorm';
import { Idea, Feedback, AIDeletion } from './idea.entity';
import { UserRole, UserVertical } from '../../common/enums/user.enums';
import { CreateIdeaDto, UpdateIdeaDto, ReviewIdeaDto, RequestAIDeletionDto, IdeaListQueryDto } from './dto/idea.dto';
import { AiService } from '../ai/ai.service';
import { PdfService } from '../pdf/pdf.service';
export declare class IdeasService {
    private ideaRepository;
    private feedbackRepository;
    private aiDeletionRepository;
    private aiService;
    private pdfService;
    constructor(ideaRepository: Repository<Idea>, feedbackRepository: Repository<Feedback>, aiDeletionRepository: Repository<AIDeletion>, aiService: AiService, pdfService: PdfService);
    create(dto: CreateIdeaDto, authorId: string): Promise<Idea>;
    findAll(query: IdeaListQueryDto): Promise<{
        ideas: Idea[];
        total: number;
    }>;
    findById(id: string): Promise<Idea>;
    findByAuthor(authorId: string): Promise<Idea[]>;
    findByVertical(vertical: UserVertical): Promise<Idea[]>;
    update(id: string, dto: UpdateIdeaDto, userId: string, userRole: UserRole): Promise<Idea>;
    review(id: string, dto: ReviewIdeaDto, reviewerId: string): Promise<Idea>;
    private generateAiSummary;
    requestAiDeletion(id: string, dto: RequestAIDeletionDto, requesterId: string): Promise<AIDeletion>;
    reviewAiDeletion(id: string, status: 'APPROVED' | 'REJECTED', reviewerId: string): Promise<AIDeletion>;
    generatePdf(id: string): Promise<Buffer>;
    delete(id: string, userId: string, userRole: UserRole): Promise<void>;
}
//# sourceMappingURL=ideas.service.d.ts.map