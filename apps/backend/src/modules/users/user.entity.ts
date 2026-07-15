import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole, UserVertical } from '../../common/enums/user.enums';
import { RefreshToken } from './refresh-token.entity';
import { Project } from '../projects/project.entity';
import { ProjectEvaluation } from '../projects/project-evaluation.entity';
import { AIConversation } from '../ai/ai-conversation.entity';
import { AIMessage } from '../ai/ai-message.entity';

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.WORKER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserVertical, default: UserVertical.MARKETING, nullable: true })
  vertical: UserVertical;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'must_change_password', default: true })
  mustChangePassword: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Project, project => project.author)
  projects: Project[];

  @OneToMany(() => ProjectEvaluation, evaluation => evaluation.evaluator)
  evaluations: ProjectEvaluation[];

  @OneToMany(() => AIConversation, conversation => conversation.user)
  aiConversations: AIConversation[];

  @OneToMany(() => AIMessage, message => message.user)
  aiMessages: AIMessage[];

  @OneToMany(() => RefreshToken, token => token.user)
  refreshTokens: RefreshToken[];
}