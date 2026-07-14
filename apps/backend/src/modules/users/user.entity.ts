import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole, UserVertical } from '../../common/enums/user.enums';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['vertical'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PARTICIPANT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserVertical, default: UserVertical.MARKETING, nullable: true })
  vertical: UserVertical;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RefreshToken, token => token.user)
  refreshTokens: RefreshToken[];
}

@Entity('refresh_tokens')
@Index(['userId'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}