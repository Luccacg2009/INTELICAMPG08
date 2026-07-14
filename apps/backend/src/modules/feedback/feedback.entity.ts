import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { User } from './user.entity';
import { Idea } from '../ideas/idea.entity';

@Entity('feedbacks')
@Unique(['ideaId', 'authorId'])
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['POSITIVE', 'NEGATIVE'] })
  type: 'POSITIVE' | 'NEGATIVE';

  @Column({ type: 'text', nullable: true })
  negativeReason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  marketingSuggestions: string[] | null;

  @Column()
  ideaId: string;

  @ManyToOne(() => Idea, idea => idea.feedbacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ideaId' })
  idea: Idea;

  @Column()
  authorId: string;

  @ManyToOne(() => User, user => user.feedbacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}