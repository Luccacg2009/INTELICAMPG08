import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { UserVertical, ProjectStatus, ProjectPriority } from '../../common/enums/user.enums';
import { ProjectEvaluation } from './project-evaluation.entity';

@Entity('projects')
@Index(['vertical'])
@Index(['status'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'central_idea', type: 'text' })
  centralIdea: string;

  @Column({ name: 'target_audience', type: 'text' })
  targetAudience: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timeline: string;

  @Column({ type: 'enum', enum: ProjectPriority, default: ProjectPriority.MEDIUM })
  priority: ProjectPriority;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @Column({ type: 'enum', enum: UserVertical })
  vertical: UserVertical;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User, user => user.projects)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'launch_location', type: 'varchar', length: 200, nullable: true })
  launchLocation: string;

  @Column({ name: 'ai_summary', type: 'text', nullable: true })
  aiSummary: string;

  @Column({ name: 'ai_analysis', type: 'text', nullable: true })
  aiAnalysis: string;

  @Column({ name: 'pdf_url', type: 'varchar', length: 500, nullable: true })
  pdfUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProjectEvaluation, evaluation => evaluation.project)
  evaluations: ProjectEvaluation[];
}