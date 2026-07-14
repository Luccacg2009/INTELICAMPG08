import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdeasController } from './ideas.controller';
import { IdeasService } from './ideas.service';
import { Idea } from './idea.entity';
import { Feedback } from './idea.entity';
import { AIDeletion } from './idea.entity';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Idea, Feedback, AIDeletion]),
    UsersModule,
    AiModule,
    PdfModule,
  ],
  controllers: [IdeasController],
  providers: [IdeasService],
  exports: [IdeasService],
})
export class IdeasModule {}