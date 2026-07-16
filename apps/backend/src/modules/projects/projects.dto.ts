import { IsString, IsOptional, IsNumber, IsEnum, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, ProjectPriority, UserVertical, EvaluationStatus, PriorityColor } from '../../common/enums/user.enums';

export class CreateProjectDto {
  @ApiProperty({ example: 'Campanha de Verão 2024' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Campanha promocional para o verão...' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'Aumentar vendas de passagens no verão' })
  @IsString()
  @MinLength(10)
  centralIdea: string;

  @ApiProperty({ example: 'Clientes entre 18-45 anos' })
  @IsString()
  @MinLength(5)
  targetAudience: string;

  @ApiProperty({ example: 'azul123', description: 'Senha de acesso ao projeto' })
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  accessPassword: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ example: '3 meses' })
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiPropertyOptional({ enum: ProjectPriority, example: ProjectPriority.HIGH, description: 'Prioridade calculada automaticamente baseada em benchmarks históricos' })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiPropertyOptional({ enum: PriorityColor, example: PriorityColor.YELLOW, description: 'Cor da prioridade (Verde=Alta, Amarelo=Média, Vermelho=Baixa)' })
  @IsOptional()
  @IsEnum(PriorityColor)
  priorityColor?: PriorityColor;

  @ApiProperty({ enum: UserVertical, example: UserVertical.MARKETING })
  @IsEnum(UserVertical)
  vertical: UserVertical;

  @ApiPropertyOptional({ example: 'Motivo do desenvolvimento do projeto' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Campanha de Verão 2024' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Campanha promocional para o verão...' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ example: 'Aumentar vendas de passagens no verão' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  centralIdea?: string;

  @ApiPropertyOptional({ example: 'Clientes entre 18-45 anos' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  targetAudience?: string;

  @ApiPropertyOptional({ example: 'nova-senha123' })
  @IsOptional()
  @IsString()
  @MinLength(4)
  accessPassword?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ example: '3 meses' })
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiPropertyOptional({ enum: ProjectPriority, example: ProjectPriority.HIGH })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiPropertyOptional({ enum: PriorityColor, example: PriorityColor.YELLOW })
  @IsOptional()
  @IsEnum(PriorityColor)
  priorityColor?: PriorityColor;

  @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class EvaluateProjectDto {
  @ApiProperty({ enum: EvaluationStatus, example: EvaluationStatus.APPROVED })
  @IsEnum(EvaluationStatus)
  status: EvaluationStatus;

  @ApiPropertyOptional({ example: 'Boa ideia, bem estruturada' })
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional({ example: 'Falta detalhar o orçamento' })
  @IsOptional()
  @IsString()
  weaknesses?: string;

  @ApiPropertyOptional({ example: 'Sugiro adicionar métricas de sucesso' })
  @IsOptional()
  @IsString()
  suggestions?: string;

  @ApiPropertyOptional({ example: 'Recomendo aprovação com ajustes no orçamento' })
  @IsOptional()
  @IsString()
  recommendation?: string;

  @ApiPropertyOptional({ example: 85, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;
}

export class ProjectListQueryDto {
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vertical?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// Re-export enums for convenience
export { ProjectStatus, ProjectPriority, UserVertical, EvaluationStatus } from '../../common/enums/user.enums';