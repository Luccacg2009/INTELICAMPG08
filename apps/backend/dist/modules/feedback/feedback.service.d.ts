import { Repository } from 'typeorm';
import { Feedback } from '../ideas/idea.entity';
import { Idea } from '../ideas/idea.entity';
import { User } from '../users/user.entity';
import { CreateFeedbackDto } from './dto/feedback.dto';
export declare class FeedbackService {
    private feedbackRepository;
    private ideaRepository;
    constructor(feedbackRepository: Repository<Feedback>, ideaRepository: Repository<Idea>);
    create(ideaId: string, dto: CreateFeedbackDto, author: User): Promise<Feedback>;
    findByIdea(ideaId: string): Promise<Feedback[]>;
    findByAuthor(authorId: string): Promise<Feedback[]>;
    getFeedbackStats(ideaId: string): Promise<{
        positive: number;
        negative: number;
    }>;
    sendToAdmin(ideaId: string, adminId: string): Promise<Feedback[]>;
    sendToVertical(ideaId: string, verticalLeadId: string): Promise<Feedback[]>;
}
//# sourceMappingURL=feedback.service.d.ts.map