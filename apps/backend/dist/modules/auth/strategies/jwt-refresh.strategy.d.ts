import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(req: Request, payload: {
        sub: string;
        email: string;
    }): Promise<{
        refreshToken: string;
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        role: import("../../../common/enums/user.enums").UserRole;
        vertical: import("../../../common/enums/user.enums").UserVertical;
        avatarUrl: string;
        isActive: boolean;
        lastLoginAt: Date;
        createdAt: Date;
        updatedAt: Date;
        ideas: import("../../ideas/idea.entity").Idea[];
        feedbacks: import("../../feedback/feedback.entity").Feedback[];
        aiDeletions: import("../../ai/ai-deletion.entity").AIDeletion[];
        refreshTokens: import("../../users/refresh-token.entity").RefreshToken[];
    }>;
}
export {};
//# sourceMappingURL=jwt-refresh.strategy.d.ts.map