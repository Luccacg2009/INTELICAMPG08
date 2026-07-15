import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

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
}