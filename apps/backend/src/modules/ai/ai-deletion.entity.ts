import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Idea } from '../ideas/idea.entity';
import { AIDeletionStatus } from '../../common/enums/user.enums';

@Entity('ai_deletions')
@Index(['status'])
export class AIDeletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ideaId: string;

  @ManyToOne(() => Idea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ideaId' })
  idea: Idea;

  @Column()
  requesterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: AIDeletionStatus, default: AIDeletionStatus.PENDING })
  status: AIDeletionStatus;

  @Column({ nullable: true })
  reviewedById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: User | null;

  @Column({ nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}