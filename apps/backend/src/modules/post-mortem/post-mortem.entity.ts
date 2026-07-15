import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { UserVertical } from '../../common/enums/user.enums';

export enum PostMortemStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PostMortemType {
  PROJECT = 'PROJECT',
  INCIDENT = 'INCIDENT',
  FEATURE = 'FEATURE',
  PROCESS = 'PROCESS',
  OTHER = 'OTHER',
}

@Entity('post_mortems')
@Index(['status'])
@Index(['vertical'])
@Index(['type'])
@Index(['authorId'])
export class PostMortem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: PostMortemType })
  type: PostMortemType;

  @Column({ type: 'enum', enum: UserVertical })
  vertical: UserVertical;

  @Column({ type: 'enum', enum: PostMortemStatus, default: PostMortemStatus.DRAFT })
  status: PostMortemStatus;

  @Column('text', { nullable: true })
  timeline: string;

  @Column('text', { nullable: true })
  rootCause: string;

  @Column('text', { nullable: true })
  impact: string;

  @Column('text', { nullable: true })
  resolution: string;

  @Column('text', { nullable: true, name: 'lessons_learned' })
  lessonsLearned: string;

  @Column('jsonb', { nullable: true, name: 'action_items' })
  actionItems: { description: string; owner: string; dueDate: string; status: string }[];

  @Column('jsonb', { nullable: true })
  metrics: Record<string, number>;

  @Column({ nullable: true, name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ nullable: true, name: 'published_at' })
  publishedAt: Date;

  @OneToMany(() => PostMortemComment, comment => comment.postMortem)
  comments: PostMortemComment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('post_mortem_comments')
@Index(['postMortemId'])
export class PostMortemComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_mortem_id' })
  postMortemId: string;

  @ManyToOne(() => PostMortem, pm => pm.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_mortem_id' })
  postMortem: PostMortem;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column('text')
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}