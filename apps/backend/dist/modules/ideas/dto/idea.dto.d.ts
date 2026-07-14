import { IdeaStatus, UserVertical } from '../../../common/enums/user.enums';
export declare class CreateIdeaDto {
    title: string;
    description: string;
    vertical: UserVertical;
    targetAudience: string;
    motivation?: string;
    launchLocation?: string;
}
export declare class UpdateIdeaDto {
    title?: string;
    description?: string;
    vertical?: UserVertical;
    targetAudience?: string;
    motivation?: string;
    launchLocation?: string;
}
export declare class ReviewIdeaDto {
    status: IdeaStatus;
    strengths?: string;
    weaknesses?: string;
    developmentWays?: string;
}
export declare class RequestAIDeletionDto {
    reason: string;
}
export declare class ReviewAIDeletionDto {
    status: 'APPROVED' | 'REJECTED';
}
export declare class IdeaListQueryDto {
    status?: string;
    vertical?: string;
    authorId?: string;
    page?: string;
    limit?: string;
}
export declare class IdeaResponseDto {
    id: string;
    title: string;
    description: string;
    vertical: UserVertical;
    targetAudience: string;
    motivation: string;
    launchLocation: string;
    status: IdeaStatus;
    authorId: string;
    authorName: string;
    authorVertical: string;
    strengths?: string;
    weaknesses?: string;
    developmentWays?: string;
    aiSummary?: string;
    aiStrengths?: string;
    aiWeaknesses?: string;
    aiDevelopment?: string;
    pdfUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    reviewedAt?: Date;
    reviewedByName?: string;
}
//# sourceMappingURL=idea.dto.d.ts.map