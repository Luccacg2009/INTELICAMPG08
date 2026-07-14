import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FeedbackType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
}

export class CreateFeedbackDto {
  @ApiProperty({ enum: FeedbackType, example: FeedbackType.POSITIVE })
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ApiProperty({ example: 'A ideia tem grande potencial de mercado...' })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ example: 'Sugiro campanha no Instagram...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  marketingSuggestions?: string;

  @ApiPropertyOptional({ example: 'Não atende público-alvo...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  negativeReason?: string;
}

export class FeedbackResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ideaId: string;

  @ApiProperty()
  ideaTitle: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty({ enum: FeedbackType })
  type: FeedbackType;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  marketingSuggestions?: string;

  @ApiPropertyOptional()
  negativeReason?: string;

  @ApiProperty()
  sentToAdmin: boolean;

  @ApiProperty()
  sentToVertical: boolean;

  @ApiProperty()
  createdAt: Date;
}