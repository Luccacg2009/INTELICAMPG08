import { AiService, IdeaSummary } from './ai.service';
import { User } from '../users/user.entity';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    generateSummary(ideaData: {
        title: string;
        vertical: string;
        description: string;
        targetAudience: string;
        motivation?: string;
        launchLocation?: string;
    }, user: User): Promise<IdeaSummary>;
    checkValues(ideaData: any): Promise<{
        violates: boolean;
        reason?: string;
    }>;
}
//# sourceMappingURL=ai.controller.d.ts.map