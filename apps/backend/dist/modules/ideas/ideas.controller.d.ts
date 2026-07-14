import { Response } from 'express';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto, UpdateIdeaDto, ReviewIdeaDto, RequestAIDeletionDto, IdeaListQueryDto } from './dto/idea.dto';
import { User } from '../users/user.entity';
export declare class IdeasController {
    private ideasService;
    constructor(ideasService: IdeasService);
    create(dto: CreateIdeaDto, user: User): Promise<import("./idea.entity").Idea>;
    findAll(query: IdeaListQueryDto): Promise<{
        ideas: import("./idea.entity").Idea[];
        total: number;
    }>;
    findMyIdeas(user: User): Promise<import("./idea.entity").Idea[]>;
    findByVertical(vertical: string): Promise<import("./idea.entity").Idea[]>;
    findOne(id: string, user: User): Promise<import("./idea.entity").Idea>;
    update(id: string, dto: UpdateIdeaDto, user: User): Promise<import("./idea.entity").Idea>;
    review(id: string, dto: ReviewIdeaDto, user: User): Promise<import("./idea.entity").Idea>;
    generateAiSummary(id: string): Promise<import("./idea.entity").Idea>;
    requestAiDeletion(id: string, dto: RequestAIDeletionDto, user: User): Promise<import("./idea.entity").AIDeletion>;
    reviewAiDeletion(id: string, dto: {
        status: 'APPROVED' | 'REJECTED';
    }, user: User): Promise<import("./idea.entity").AIDeletion>;
    downloadPdf(id: string, res: Response, user: User): Promise<void>;
    remove(id: string, user: User): Promise<void>;
}
//# sourceMappingURL=ideas.controller.d.ts.map