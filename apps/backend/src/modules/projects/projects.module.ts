import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { ProjectEvaluation } from './project-evaluation.entity';
import { User } from '../users/user.entity';
import { AIModule } from '../ai/ai.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectEvaluation, User]), AIModule, PdfModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}