import { UserRole, UserVertical } from '../../common/enums/user.enums';
import { RefreshToken } from './refresh-token.entity';
import { Idea } from '../ideas/idea.entity';
import { Feedback } from '../feedback/feedback.entity';
import { AIDeletion } from '../ai/ai-deletion.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    vertical: UserVertical;
    avatarUrl: string;
    isActive: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ideas: Idea[];
    feedbacks: Feedback[];
    aiDeletions: AIDeletion[];
    refreshTokens: RefreshToken[];
}
//# sourceMappingURL=user.entity.d.ts.map