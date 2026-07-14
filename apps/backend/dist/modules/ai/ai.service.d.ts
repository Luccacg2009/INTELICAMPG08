import { ConfigService } from '@nestjs/config';
import { VerticalsService } from '../verticals/verticals.service';
export interface IdeaSummary {
    summary: string;
    strengths: string;
    weaknesses: string;
    developmentWays: string;
}
export declare class AiService {
    private configService;
    private verticalsService;
    private openai;
    private promptTemplate;
    constructor(configService: ConfigService, verticalsService: VerticalsService);
    private getCompanyValues;
    generateSummary(ideaData: {
        title: string;
        vertical: string;
        description: string;
        targetAudience: string;
        motivation?: string;
        launchLocation?: string;
        authorName: string;
    }): Promise<IdeaSummary>;
    checkCompanyValues(ideaData: any): Promise<{
        violates: boolean;
        reason?: string;
    }>;
}
//# sourceMappingURL=ai.service.d.ts.map