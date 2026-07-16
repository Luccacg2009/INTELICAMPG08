import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { AIFeedbackType, AIFeedback } from './ai-feedback.entity';
import { UserRole } from '../../common/enums/user.enums';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Enviar mensagem para o agente de IA' })
  @ApiResponse({ status: 201, description: 'Resposta da IA' })
  async chat(
    @Body() body: { content: string; conversationId?: string; projectId?: string },
    @CurrentUser() user: User,
  ) {
    return this.aiService.sendMessage(user.id, body.content, body.conversationId, body.projectId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de conversas' })
  async getConversations(@CurrentUser() user: User) {
    return this.aiService.getConversations(user.id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Obter mensagens de uma conversa' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  async getMessages(
    @Param('id') conversationId: string,
    @CurrentUser() user: User,
  ) {
    return this.aiService.getConversationMessages(conversationId, user.id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Excluir conversa' })
  @ApiResponse({ status: 200, description: 'Conversa excluída' })
  async deleteConversation(
    @Param('id') conversationId: string,
    @CurrentUser() user: User,
  ) {
    await this.aiService.deleteConversation(conversationId, user.id);
    return { message: 'Conversa excluída com sucesso' };
  }

  @Post('feedback')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Enviar feedback do analista para IA processar e notificar vertical + admin marketing' })
  @ApiResponse({ status: 201, description: 'Feedback processado e enviado' })
  async sendFeedback(
    @Body() body: { projectId: string; type: AIFeedbackType; content: string },
    @CurrentUser() user: User,
  ): Promise<AIFeedback> {
    return this.aiService.processAnalystFeedback(body.projectId, user.id, body.type, body.content);
  }

  @Get('feedback/project/:projectId')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Listar feedbacks de um projeto' })
  @ApiResponse({ status: 200, description: 'Lista de feedbacks' })
  async getProjectFeedback(@Param('projectId') projectId: string): Promise<AIFeedback[]> {
    return this.aiService.getProjectFeedback(projectId);
  }

  @Get('feedback/notifications')
  @ApiOperation({ summary: 'Obter notificações de feedback do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  async getFeedbackNotifications(@CurrentUser() user: User) {
    return this.aiService.getUserFeedbackNotifications(user.id);
  }
}