import { UserRole, UserVertical } from '../../../common/enums/user.enums';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    vertical?: UserVertical;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
//# sourceMappingURL=auth.dto.d.ts.map