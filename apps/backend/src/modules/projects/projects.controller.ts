import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, EvaluateProjectDto, ProjectListQueryDto } from './projects.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserRole } from '../../common/enums/user.enums';
import { Response } from 'express';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: User) {
    return this.projectsService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.WORKER, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar projetos' })
  @ApiResponse({ status: 200, description: 'Lista de projetos' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'IN_DEVELOPMENT', 'LAUNCHED', 'ARCHIVED'] })
  @ApiQuery({ name: 'vertical', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: any, @CurrentUser() user: User) {
    return this.projectsService.findAll(query, user);
  }

  @Get('my-evaluations')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Minhas avaliações' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações do analista' })
  async getMyEvaluations(@CurrentUser() user: User) {
    return this.projectsService.getMyEvaluations(user.id);
  }

  @Get(':id')
  @Roles(UserRole.WORKER, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter projeto por ID' })
  @ApiResponse({ status: 200, description: 'Detalhes do projeto' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.findById(id, user);
  }

  @Put(':id')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  async update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: User) {
    return this.projectsService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir projeto' })
  @ApiResponse({ status: 204, description: 'Projeto excluído com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para excluir' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.projectsService.delete(id, user.id, user.role);
  }

  @Post(':id/evaluate')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Avaliar projeto (Aprovar/Rejeitar/Solicitar revisão)' })
  @ApiResponse({ status: 201, description: 'Avaliação registrada com sucesso' })
  async evaluate(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: User) {
    return this.projectsService.evaluate(id, dto, user.id);
  }

  @Post(':id/submit-review')
  @Roles(UserRole.WORKER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Enviar projeto para revisão' })
  @ApiResponse({ status: 200, description: 'Projeto enviado para revisão' })
  async submitForReview(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.submitForReview(id, user.id, user.role);
  }

  @Post(':id/ai-summary')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Gerar resumo por IA' })
  @ApiResponse({ status: 200, description: 'Resumo gerado' })
  async generateAiSummary(@Param('id') id: string) {
    return this.projectsService.generateAiSummary(id);
  }

  @Get(':id/pdf')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Gerar PDF do projeto' })
  @ApiResponse({ status: 200, description: 'PDF gerado' })
  async generatePdf(@Param('id') id: string, @Res() res: Response, @CurrentUser() user: User) {
    const pdfBuffer = await this.projectsService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="projeto-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}