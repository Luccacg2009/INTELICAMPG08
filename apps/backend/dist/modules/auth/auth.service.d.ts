import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';
export interface TokenPayload {
    sub: string;
    email: string;
    role: string;
    vertical: string | null;
}
export interface Tokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        user: Partial<User>;
        tokens: Tokens;
    }>;
    login(dto: LoginDto): Promise<{
        user: Partial<User>;
        tokens: Tokens;
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<Tokens>;
    logout(userId: string): Promise<void>;
    validateUser(payload: TokenPayload): Promise<User | null>;
    private generateTokens;
}
//# sourceMappingURL=auth.service.d.ts.map