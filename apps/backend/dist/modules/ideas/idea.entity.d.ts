import { User } from '../users/user.entity';
import { IdeaStatus, UserVertical } from '../../common/enums/user.enums';
export declare class Idea {
    id: string;
    title: string;
    description: string;
    vertical: UserVertical;
    targetAudience: string;
    motivation: string;
    launchLocation: string;
    status: IdeaStatus;
    strengths: string;
    weaknesses: string;
    developmentWays: string;
    aiSummary: string;
    aiStrengths: string;
    aiWeaknesses: string;
    aiDevelopment: string;
    pdfUrl: string;
    aiGeneratedAt: Date;
    authorId: string;
    author: User;
    reviewedById: string;
    reviewedBy: User;
    reviewedAt: Date;
    feedbacks: Feedback[];
    aiDeletion: AIDeletion;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Feedback {
    id: string;
    ideaId: string;
    idea: Idea;
    authorId: string;
    author: User;
    type: 'POSITIVE' | 'NEGATIVE';
    content: string;
    marketingSuggestions: string;
    negativeReason: string;
    sentToAdmin: boolean;
    sentToVertical: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AIDeletion {
    id: string;
    ideaId: string;
    idea: Idea;
    requesterId: string;
    requester: User;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
    reviewedById: string;
    reviewedBy: User;
    reviewedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=idea.entity.d.ts.map