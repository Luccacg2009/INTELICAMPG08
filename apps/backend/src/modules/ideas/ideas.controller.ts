import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Res, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto, UpdateIdeaDto, ReviewIdeaDto, RequestAIDeletionDto, IdeaListQueryDto } from './dto/idea.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserRole } from '../../common/enums/user.enums';
import { UserVertical } from '../../common/enums/user.enums';

@ApiTags('ideas')
@ApiBearerAuth()
@Controller('ideas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IdeasController {
  constructor(private ideasService: IdeasService) {}

  @Post()
  @Roles(UserRole.PARTICIPANT, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar nova ideia de produto' })
  @ApiResponse({ status: 201, description: 'Ideia criada com sucesso' })
  async create(@Body() dto: CreateIdeaDto, @CurrentUser() user: User) {
    return this.ideasService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas as ideias (analistas e admins)' })
  @ApiResponse({ status: 200 })
  async findAll(@Query() query: IdeaListQueryDto, @CurrentUser() user: User) {
    return this.ideasService.findAll(query, user.role, user.id);
  }

  @Get('my-ideas')
  @Roles(UserRole.PARTICIPANT, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar minhas ideias' })
  @ApiResponse({ status: 200 })
  async findMyIdeas(@CurrentUser() user: User) {
    return this.ideasService.findByAuthor(user.id);
  }

  @Get('vertical/:vertical')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar ideias por vertical' })
  @ApiResponse({ status: 200 })
  async findByVertical(@Param('vertical') vertical: string) {
    return this.ideasService.findByVertical(vertical as any);
  }

  @Get(':id')
  @Roles(UserRole.PARTICIPANT, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter detalhes de uma ideia' })
  @ApiResponse({ status: 200 })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const idea = await this.ideasService.findById(id);
    if (idea.authorId !== user.id && user.role !== UserRole.ANALYST && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a ver esta ideia');
    }
    return idea;
  }

  @Patch(':id')
  @Roles(UserRole.PARTICIPANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar ideia (apenas se pendente)' })
  @ApiResponse({ status: 200 })
  async update(@Param('id') id: string, @Body() dto: UpdateIdeaDto, @CurrentUser() user: User) {
    return this.ideasService.update(id, dto, user.id, user.role);
  }

  @Patch(':id/review')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Revisar ideia (aprovar/rejeitar) - Analistas e Admins' })
  @ApiResponse({ status: 200 })
  async review(@Param('id') id: string, @Body() dto: ReviewIdeaDto, @CurrentUser() user: User) {
    return this.ideasService.review(id, dto, user.id);
  }

  @Post(':id/ai-summary')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Gerar/Atualizar resumo por IA' })
  @ApiResponse({ status: 200 })
  async generateAiSummary(@Param('id') id: string) {
    const idea = await this.ideasService.findById(id);
    await this.ideasService['generateAiSummary'](idea);
    return this.ideasService.findById(id);
  }

  @Post(':id/ai-deletion')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Solicitar exclusão da ideia pela IA (apenas Admin)' })
  @ApiResponse({ status: 201 })
  async requestAiDeletion(@Param('id') id: string, @Body() dto: RequestAIDeletionDto, @CurrentUser() user: User) {
    return this.ideasService.requestAiDeletion(id, dto, user.id);
  }

  @Patch(':id/ai-deletion/review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Aprovar/Rejeitar exclusão por IA (apenas Admin)' })
  @ApiResponse({ status: 200 })
  async reviewAiDeletion(
    @Param('id') id: string,
    @Body() dto: { status: 'APPROVED' | 'REJECTED' },
    @CurrentUser() user: User,
  ) {
    return this.ideasService.reviewAiDeletion(id, dto.status, user.id);
  }

  @Get(':id/pdf')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Baixar PDF da ideia' })
  @ApiResponse({ status: 200, description: 'PDF gerado' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response, @CurrentUser() user: User) {
    const pdfBuffer = await this.ideasService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ideia-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Delete(':id')
  @Roles(UserRole.PARTICIPANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir ideia (autor ou admin)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.ideasService.delete(id, user.id, user.role);
  }
}