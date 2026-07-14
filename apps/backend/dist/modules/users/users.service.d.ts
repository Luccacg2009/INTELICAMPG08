import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';
import { RegisterDto } from '../auth/dto/auth.dto';
import { UserVertical } from '../../common/enums/user.enums';
export declare class UsersService {
    private userRepository;
    private refreshTokenRepository;
    constructor(userRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>);
    create(dto: RegisterDto & {
        passwordHash: string;
    }): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    findByVertical(vertical: UserVertical): Promise<User[]>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
    updateLastLogin(userId: string): Promise<void>;
    update(userId: string, data: Partial<User>): Promise<User>;
    deactivate(userId: string): Promise<void>;
    validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
    getAnalysts(): Promise<User[]>;
}
//# sourceMappingURL=users.service.d.ts.map