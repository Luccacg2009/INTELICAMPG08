import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole, UserVertical } from '../../common/enums/user.enums';
import { RefreshToken } from './refresh-token.entity';
import { Idea } from '../ideas/idea.entity';
import { Feedback } from '../feedback/feedback.entity';
import { AIDeletion } from '../ai/ai-deletion.entity';

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

  @OneToMany(() => Idea, idea => idea.author)
  ideas: Idea[];

  @OneToMany(() => Feedback, feedback => feedback.author)
  feedbacks: Feedback[];

  @OneToMany(() => AIDeletion, deletion => deletion.requester)
  aiDeletions: AIDeletion[];

  @OneToMany(() => RefreshToken, token => token.user)
  refreshTokens: RefreshToken[];
}