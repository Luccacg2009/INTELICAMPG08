import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { User } from '../users/user.entity';
export declare class FeedbackController {
    private feedbackService;
    constructor(feedbackService: FeedbackService);
    createFeedback(ideaId: string, dto: CreateFeedbackDto, user: User): Promise<import("../ideas/idea.entity").Feedback>;
    getFeedbacksByIdea(ideaId: string): Promise<import("../ideas/idea.entity").Feedback[]>;
    getMyFeedbacks(user: User): Promise<import("../ideas/idea.entity").Feedback[]>;
    getStats(ideaId: string): Promise<{
        positive: number;
        negative: number;
    }>;
    sendToAdmin(ideaId: string, user: User): Promise<import("../ideas/idea.entity").Feedback[]>;
    sendToVertical(ideaId: string, user: User): Promise<import("../ideas/idea.entity").Feedback[]>;
}
//# sourceMappingURL=feedback.controller.d.ts.map