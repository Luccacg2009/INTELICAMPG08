import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostMortemService } from './post-mortem.service';
import { PostMortemController } from './post-mortem.controller';
import { PostMortem, PostMortemComment } from './post-mortem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostMortem, PostMortemComment])],
  providers: [PostMortemService],
  controllers: [PostMortemController],
  exports: [PostMortemService],
})
export class PostMortemModule {}