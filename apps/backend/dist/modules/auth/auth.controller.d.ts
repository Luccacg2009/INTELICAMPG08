import { AuthService, Tokens } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from '../users/user.entity';
import { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: Partial<User>;
        tokens: Tokens;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: Partial<User>;
        accessToken: string;
    }>;
    refresh(user: User, req: any, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(user: User, res: Response): Promise<{
        message: string;
    }>;
    me(user: User): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../../common/enums/user.enums").UserRole;
        vertical: import("../../common/enums/user.enums").UserVertical;
        avatarUrl: string;
        isActive: boolean;
        lastLoginAt: Date;
        createdAt: Date;
        updatedAt: Date;
        ideas: import("../ideas/idea.entity").Idea[];
        feedbacks: import("../feedback/feedback.entity").Feedback[];
        aiDeletions: import("../ai/ai-deletion.entity").AIDeletion[];
    }>;
    private setRefreshTokenCookie;
}
//# sourceMappingURL=auth.controller.d.ts.map