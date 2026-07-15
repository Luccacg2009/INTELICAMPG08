import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIConversation } from './ai-conversation.entity';
import { AIMessage } from './ai-message.entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AIConversation, AIMessage, User, Project])],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}