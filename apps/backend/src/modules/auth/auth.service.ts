import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { User } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../common/enums/user.enums';

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

const INITIAL_PASSWORDS: Record<UserRole, string> = {
  [UserRole.WORKER]: 'azul123',
  [UserRole.ANALYST]: 'azul456',
  [UserRole.ADMIN]: 'azul789',
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  validateInitialPassword(role: UserRole, password: string): boolean {
    const expectedPassword = INITIAL_PASSWORDS[role];
    return expectedPassword === password;
  }

  async register(dto: RegisterDto): Promise<{ user: Partial<User>; tokens: Tokens }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    if (!this.validateInitialPassword(dto.role, dto.password)) {
      throw new BadRequestException('Senha inicial incorreta para o papel selecionado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      ...dto,
      passwordHash,
    });

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, refreshTokens: __, ...userWithoutSecrets } = user;
    return { user: userWithoutSecrets, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: Partial<User>; tokens: Tokens }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersService.updateLastLogin(user.id);

    const { passwordHash: _, refreshTokens: __, ...userWithoutSecrets } = user;
    return { user: userWithoutSecrets, tokens };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const isValid = await this.usersService.validateRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await this.usersService.changePassword(userId, newPasswordHash);
  }

  async validateUser(payload: TokenPayload): Promise<User | null> {
    return this.usersService.findById(payload.sub);
  }

  private async generateTokens(user: User): Promise<Tokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      vertical: user.vertical,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }
}