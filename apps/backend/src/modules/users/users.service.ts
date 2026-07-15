import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserRole, UserVertical } from '../../common/enums/user.enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(data: { 
    email: string; 
    passwordHash: string; 
    name: string; 
    role: UserRole; 
    vertical?: UserVertical;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }
    const user = this.userRepository.create({
      ...data,
      mustChangePassword: true,
    });
    return this.userRepository.save(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 12) : null;
    
    await this.refreshTokenRepository.delete({ userId });
    
    if (hashed) {
      const token = this.refreshTokenRepository.create({
        token: hashed,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await this.refreshTokenRepository.save(token);
    }
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const tokenRecord = await this.refreshTokenRepository.findOne({ where: { userId } });
    if (!tokenRecord) return false;
    return bcrypt.compare(refreshToken, tokenRecord.token);
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

  async changePassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.userRepository.update(userId, { 
      passwordHash: newPasswordHash,
      mustChangePassword: false,
    });
  }

  async deactivate(userId: string): Promise<void> {
    await this.userRepository.update(userId, { isActive: false });
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.find({ order: { name: 'ASC' } });
  }

  async getByRole(role: UserRole): Promise<User[]> {
    return this.userRepository.find({ where: { role }, order: { name: 'ASC' } });
  }

  async getByVertical(vertical: UserVertical): Promise<User[]> {
    return this.userRepository.find({ where: { vertical }, order: { name: 'ASC' } });
  }
}