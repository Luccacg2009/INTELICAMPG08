import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from './project.entity';
import { ProjectStatus, EvaluationStatus } from '../../common/enums/user.enums';

@Entity('project_evaluations')
@Index(['projectId', 'evaluatorId'], { unique: true })
export class ProjectEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, project => project.evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'evaluator_id', type: 'uuid' })
  evaluatorId: string;

  @ManyToOne(() => User, user => user.evaluations)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: User;

  @Column({ type: 'enum', enum: ProjectStatus })
  status: ProjectStatus;

  @Column({ nullable: true, type: 'text' })
  strengths: string;

  @Column({ nullable: true, type: 'text' })
  weaknesses: string;

  @Column({ nullable: true, type: 'text' })
  suggestions: string;

  @Column({ nullable: true, type: 'text' })
  recommendation: string;

  @Column({ default: 0, type: 'int' })
  score: number;

  @Column({ name: 'reviewed_at', nullable: true, type: 'timestamp' })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}