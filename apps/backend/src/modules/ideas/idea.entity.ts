import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { IdeaStatus, UserVertical } from '../../common/enums/user.enums';

@Entity('ideas')
@Index(['status'])
@Index(['vertical'])
@Index(['authorId'])
export class Idea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: UserVertical })
  vertical: UserVertical;

  @Column('text')
  targetAudience: string;

  @Column('text', { nullable: true })
  motivation: string;

  @Column({ nullable: true })
  launchLocation: string;

  @Column({ type: 'enum', enum: IdeaStatus, default: IdeaStatus.PENDING_REVIEW })
  status: IdeaStatus;

  @Column('text', { nullable: true })
  strengths: string;

  @Column('text', { nullable: true })
  weaknesses: string;

  @Column('text', { nullable: true })
  developmentWays: string;

  @Column('text', { nullable: true, name: 'ai_summary' })
  aiSummary: string;

  @Column('text', { nullable: true, name: 'ai_strengths' })
  aiStrengths: string;

  @Column('text', { nullable: true, name: 'ai_weaknesses' })
  aiWeaknesses: string;

  @Column('text', { nullable: true, name: 'ai_development' })
  aiDevelopment: string;

  @Column({ nullable: true, name: 'pdf_url' })
  pdfUrl: string;

  @Column({ nullable: true, name: 'ai_generated_at' })
  aiGeneratedAt: Date;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, user => user.ideas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ nullable: true, name: 'reviewed_by_id' })
  reviewedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User;

  @Column({ nullable: true, name: 'reviewed_at' })
  reviewedAt: Date;

  @OneToMany(() => Feedback, feedback => feedback.idea)
  feedbacks: Feedback[];

  @OneToOne(() => AIDeletion, deletion => deletion.idea)
  aiDeletion: AIDeletion;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('feedbacks')
@Index(['ideaId'])
@Index(['authorId'])
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'idea_id' })
  ideaId: string;

  @ManyToOne(() => Idea, idea => idea.feedbacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idea_id' })
  idea: Idea;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'enum', enum: ['POSITIVE', 'NEGATIVE'] })
  type: 'POSITIVE' | 'NEGATIVE';

  @Column('text')
  content: string;

  @Column('text', { nullable: true, name: 'marketing_suggestions' })
  marketingSuggestions: string;

  @Column('text', { nullable: true, name: 'negative_reason' })
  negativeReason: string;

  @Column({ default: false, name: 'sent_to_admin' })
  sentToAdmin: boolean;

  @Column({ default: false, name: 'sent_to_vertical' })
  sentToVertical: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('ai_deletions')
@Index(['status'])
export class AIDeletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'idea_id' })
  ideaId: string;

  @OneToOne(() => Idea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idea_id' })
  idea: Idea;

  @Column({ name: 'requester_id' })
  requesterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column('text')
  reason: string;

  @Column({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED'], default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

  @Column({ nullable: true, name: 'reviewed_by_id' })
  reviewedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User;

  @Column({ nullable: true, name: 'reviewed_at' })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}