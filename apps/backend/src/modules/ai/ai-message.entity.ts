import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { AIConversation } from './ai-conversation.entity';
import { User } from '../users/user.entity';

@Entity('ai_messages')
@Index(['conversationId'])
@Index(['userId'])
export class AIMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'varchar' })
  conversationId: string;

  @ManyToOne(() => AIConversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: AIConversation;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20 })
  role: string;

  @Column('text')
  content: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}