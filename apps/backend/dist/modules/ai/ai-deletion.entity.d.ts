import { User } from '../users/user.entity';
import { Idea } from '../ideas/idea.entity';
import { AIDeletionStatus } from '../../common/enums/user.enums';
export declare class AIDeletion {
    id: string;
    ideaId: string;
    idea: Idea;
    requesterId: string;
    requester: User;
    reason: string;
    status: AIDeletionStatus;
    reviewedById: string | null;
    reviewedBy: User | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=ai-deletion.entity.d.ts.map