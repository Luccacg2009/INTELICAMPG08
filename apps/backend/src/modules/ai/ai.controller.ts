import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AiService, IdeaSummary } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-summary')
  @ApiOperation({ summary: 'Gerar resumo da ideia via IA' })
  @ApiResponse({ status: 200, description: 'Resumo gerado com sucesso' })
  @ApiResponse({ status: 400, description: 'Ideia viola valores da empresa ou erro na IA' })
  async generateSummary(
    @Body() ideaData: {
      title: string;
      vertical: string;
      description: string;
      targetAudience: string;
      motivation?: string;
      launchLocation?: string;
    },
    @CurrentUser() user: User,
  ): Promise<IdeaSummary> {
    return this.aiService.generateSummary({
      ...ideaData,
      authorName: user.name,
    });
  }

  @Post('check-values')
  @ApiOperation({ summary: 'Verificar se ideia viola valores da empresa' })
  @ApiResponse({ status: 200 })
  async checkValues(@Body() ideaData: any) {
    return this.aiService.checkCompanyValues(ideaData);
  }
}