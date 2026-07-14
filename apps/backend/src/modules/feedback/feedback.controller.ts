import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, FeedbackResponseDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@ApiTags('feedback')
@ApiBearerAuth()
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post('idea/:ideaId')
  @Roles(UserRole.ANALYST)
  @ApiOperation({ summary: 'Dar feedback em uma ideia (apenas Analistas)' })
  @ApiResponse({ status: 201, type: FeedbackResponseDto })
  @ApiResponse({ status: 403, description: 'Não autorizado ou já deu feedback' })
  async createFeedback(
    @Param('ideaId') ideaId: string,
    @Body() dto: CreateFeedbackDto,
    @CurrentUser() user: User,
  ) {
    return this.feedbackService.create(ideaId, dto, user);
  }

  @Get('idea/:ideaId')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar feedbacks de uma ideia' })
  @ApiResponse({ status: 200, type: [FeedbackResponseDto] })
  async getFeedbacksByIdea(@Param('ideaId') ideaId: string) {
    return this.feedbackService.findByIdea(ideaId);
  }

  @Get('my-feedbacks')
  @Roles(UserRole.ANALYST)
  @ApiOperation({ summary: 'Listar meus feedbacks' })
  @ApiResponse({ status: 200, type: [FeedbackResponseDto] })
  async getMyFeedbacks(@CurrentUser() user: User) {
    return this.feedbackService.findByAuthor(user.id);
  }

  @Get('idea/:ideaId/stats')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Estatísticas de feedback de uma ideia' })
  @ApiResponse({ status: 200 })
  async getStats(@Param('ideaId') ideaId: string) {
    return this.feedbackService.getFeedbackStats(ideaId);
  }

  @Post('idea/:ideaId/send-to-admin')
  @Roles(UserRole.ANALYST)
  @ApiOperation({ summary: 'Enviar feedbacks para administrador' })
  @ApiResponse({ status: 200 })
  async sendToAdmin(@Param('ideaId') ideaId: string, @CurrentUser() user: User) {
    return this.feedbackService.sendToAdmin(ideaId, user.id);
  }

  @Post('idea/:ideaId/send-to-vertical')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Enviar feedbacks para vertical responsável' })
  @ApiResponse({ status: 200 })
  async sendToVertical(@Param('ideaId') ideaId: string, @CurrentUser() user: User) {
    return this.feedbackService.sendToVertical(ideaId, user.id);
  }
}