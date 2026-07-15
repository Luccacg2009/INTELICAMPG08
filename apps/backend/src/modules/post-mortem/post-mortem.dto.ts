import { IsString, IsOptional, IsEnum, IsDateString, ValidateNested, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PostMortemStatus, PostMortemType } from './post-mortem.entity';
import { UserVertical } from '../../common/enums/user.enums';

export class ActionItemDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  owner: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty()
  @IsString()
  status: string;
}

export class CreatePostMortemDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: PostMortemType })
  @IsEnum(PostMortemType)
  type: PostMortemType;

  @ApiProperty({ enum: UserVertical })
  @IsEnum(UserVertical)
  vertical: UserVertical;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rootCause?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  impact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lessonsLearned?: string;

  @ApiPropertyOptional({ type: [ActionItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionItemDto)
  actionItems?: ActionItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metrics?: Record<string, number>;
}

export class UpdatePostMortemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: PostMortemType })
  @IsOptional()
  @IsEnum(PostMortemType)
  type?: PostMortemType;

  @ApiPropertyOptional({ enum: UserVertical })
  @IsOptional()
  @IsEnum(UserVertical)
  vertical?: UserVertical;

  @ApiPropertyOptional({ enum: PostMortemStatus })
  @IsOptional()
  @IsEnum(PostMortemStatus)
  status?: PostMortemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rootCause?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  impact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lessonsLearned?: string;

  @ApiPropertyOptional({ type: [ActionItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionItemDto)
  actionItems?: ActionItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metrics?: Record<string, number>;
}

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  content: string;
}

export class PostMortemQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vertical?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsString()
  limit?: string;
}