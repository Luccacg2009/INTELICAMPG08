import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';
import { RegisterDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async create(dto: RegisterDto & { passwordHash: string }): Promise<User> {
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash: dto.passwordHash,
      name: dto.name,
      role: dto.role || 'PARTICIPANT',
      vertical: dto.vertical || 'MARKETING',
    });
    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByVertical(vertical: string): Promise<User[]> {
    return this.userRepository.find({ where: { vertical }, order: { name: 'ASC' } });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const existing = await this.refreshTokenRepository.findOne({ where: { userId } });
    if (existing) {
      await this.refreshTokenRepository.remove(existing);
    }
    if (refreshToken) {
      const hashed = await bcrypt.hash(refreshToken, 10);
      const token = this.refreshTokenRepository.create({
        token: hashed,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await this.refreshTokenRepository.save(token);
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  async update(userId: string, data: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, data);
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async deactivate(userId: string): Promise<void> {
    await this.userRepository.update(userId, { isActive: false });
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const tokenRecord = await this.refreshTokenRepository.findOne({ where: { userId } });
    if (!tokenRecord) return false;
    return bcrypt.compare(refreshToken, tokenRecord.token);
  }
}