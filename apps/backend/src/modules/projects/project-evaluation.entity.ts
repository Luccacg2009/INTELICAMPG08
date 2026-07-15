import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from './project.entity';
import { ProjectStatus, EvaluationStatus } from '../../common/enums/user.enums';

@Entity('project_evaluations')
@Index(['projectId', 'evaluatorId'], { unique: true })
export class ProjectEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, project => project.evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'evaluator_id' })
  evaluatorId: string;

  @ManyToOne(() => User, user => user.evaluations)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: User;

  @Column({ type: 'enum', enum: ProjectStatus })
  status: ProjectStatus;

  @Column({ nullable: true })
  strengths: string;

  @Column({ nullable: true })
  weaknesses: string;

  @Column({ nullable: true })
  suggestions: string;

  @Column({ nullable: true })
  recommendation: string;

  @Column({ default: 0 })
  score: number;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}