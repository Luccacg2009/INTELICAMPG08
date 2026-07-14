import { User } from '../users/user.entity';
import { Idea } from '../ideas/idea.entity';
export declare class Feedback {
    id: string;
    content: string;
    type: 'POSITIVE' | 'NEGATIVE';
    negativeReason: string | null;
    marketingSuggestions: string[] | null;
    ideaId: string;
    idea: Idea;
    authorId: string;
    author: User;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=feedback.entity.d.ts.map