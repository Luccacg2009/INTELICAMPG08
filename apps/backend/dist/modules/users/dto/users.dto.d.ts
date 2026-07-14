import { UserRole, UserVertical } from '../../../common/enums/user.enums';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    vertical?: UserVertical;
}
export declare class UpdateUserDto {
    name?: string;
    password?: string;
    role?: UserRole;
    vertical?: UserVertical;
    avatarUrl?: string;
    isActive?: boolean;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    vertical: UserVertical | null;
    isActive: boolean;
    createdAt: Date;
}
//# sourceMappingURL=users.dto.d.ts.map