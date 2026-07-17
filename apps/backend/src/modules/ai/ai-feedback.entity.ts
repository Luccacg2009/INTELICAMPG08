import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

export enum AIFeedbackType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
}

export enum AIFeedbackStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  SENT = 'SENT',
}

@Entity('ai_feedbacks')
@Index(['projectId'])
@Index(['analystId'])
@Index(['status'])
export class AIFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'varchar' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'analyst_id', type: 'varchar' })
  analystId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'analyst_id' })
  analyst: User;

  @Column({ type: 'simple-enum', enum: AIFeedbackType })
  type: AIFeedbackType;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'marketing_suggestions', type: 'text', nullable: true })
  marketingSuggestions: string;

  @Column({ name: 'negative_reason', type: 'text', nullable: true })
  negativeReason: string;

  @Column({ type: 'simple-enum', enum: AIFeedbackStatus, default: AIFeedbackStatus.PENDING })
  status: AIFeedbackStatus;

  @Column({ name: 'ai_processed_content', type: 'text', nullable: true })
  aiProcessedContent: string;

  @Column({ name: 'sent_to_vertical_at', type: 'datetime', nullable: true })
  sentToVerticalAt: Date;

  @Column({ name: 'sent_to_admin_at', type: 'datetime', nullable: true })
  sentToAdminAt: Date;

  @Column({ name: 'processed_at', type: 'datetime', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}