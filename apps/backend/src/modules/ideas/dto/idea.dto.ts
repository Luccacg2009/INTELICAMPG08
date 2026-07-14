import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdeaStatus, UserVertical } from '../../common/enums/user.enums';

export class CreateIdeaDto {
  @ApiProperty({ example: 'App de Delivery Sustentável' })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Aplicativo que conecta restaurantes com embalagens ecológicas...' })
  @IsString()
  @MinLength(50)
  description: string;

  @ApiProperty({ enum: UserVertical, example: UserVertical.BUSINESS })
  @IsEnum(UserVertical)
  vertical: UserVertical;

  @ApiProperty({ example: 'Restaurantes conscientes e consumidores eco-friendly' })
  @IsString()
  @MinLength(10)
  targetAudience: string;

  @ApiPropertyOptional({ example: 'Identifiquei demanda crescente por sustentabilidade...' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  motivation?: string;

  @ApiPropertyOptional({ example: 'São Paulo - SP' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  launchLocation?: string;
}

export class UpdateIdeaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(50)
  description?: string;

  @ApiPropertyOptional({ enum: UserVertical })
  @IsOptional()
  @IsEnum(UserVertical)
  vertical?: UserVertical;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  targetAudience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  motivation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  launchLocation?: string;
}

export class ReviewIdeaDto {
  @ApiProperty({ enum: IdeaStatus, example: IdeaStatus.APPROVED })
  @IsEnum(IdeaStatus)
  @IsIn([IdeaStatus.APPROVED, IdeaStatus.REJECTED, IdeaStatus.UNDER_REVIEW])
  status: IdeaStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weaknesses?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  developmentWays?: string;
}

export class RequestAIDeletionDto {
  @ApiProperty({ example: 'Ideia viola política de sustentabilidade da empresa' })
  @IsString()
  @MinLength(20)
  reason: string;
}

export class ReviewAIDeletionDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';
}

export class IdeaListQueryDto {
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

export class IdeaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: UserVertical })
  vertical: UserVertical;

  @ApiProperty()
  targetAudience: string;

  @ApiProperty()
  motivation: string;

  @ApiProperty()
  launchLocation: string;

  @ApiProperty({ enum: IdeaStatus })
  status: IdeaStatus;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  authorVertical: string;

  @ApiPropertyOptional()
  strengths?: string;

  @ApiPropertyOptional()
  weaknesses?: string;

  @ApiPropertyOptional()
  developmentWays?: string;

  @ApiPropertyOptional()
  aiSummary?: string;

  @ApiPropertyOptional()
  aiStrengths?: string;

  @ApiPropertyOptional()
  aiWeaknesses?: string;

  @ApiPropertyOptional()
  aiDevelopment?: string;

  @ApiPropertyOptional()
  pdfUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  reviewedAt?: Date;

  @ApiPropertyOptional()
  reviewedByName?: string;
}