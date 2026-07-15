import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PostMortemService } from './post-mortem.service';
import { CreatePostMortemDto, UpdatePostMortemDto, CreateCommentDto, PostMortemQueryDto } from './post-mortem.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserRole } from '../../common/enums/user.enums';
import { PostMortemStatus } from './post-mortem.entity';

@ApiTags('post-mortems')
@ApiBearerAuth()
@Controller('post-mortems')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostMortemController {
  constructor(private postMortemService: PostMortemService) {}

  @Post()
  @Roles(UserRole.PARTICIPANT, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo post-mortem' })
  @ApiResponse({ status: 201, description: 'Post-mortem criado com sucesso' })
  async create(@Body() dto: CreatePostMortemDto, @CurrentUser() user: User) {
    return this.postMortemService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar post-mortems' })
  @ApiResponse({ status: 200 })
  async findAll(@Query() query: PostMortemQueryDto) {
    return this.postMortemService.findAll(query);
  }

  @Get('lessons-learned')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter lições aprendidas por tipo' })
  @ApiQuery({ name: 'vertical', required: false, enum: ['MARKETING', 'PRODUCT', 'SALES', 'ENGINEERING', 'DESIGN', 'OPERATIONS', 'FINANCE', 'HR', 'LEGAL', 'OTHER'] })
  @ApiResponse({ status: 200 })
  async getLessonsLearned(@Query('vertical') vertical?: string) {
    return this.postMortemService.getLessonsLearned(vertical as any);
  }

  @Get('vertical/:vertical')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar post-mortems por vertical' })
  @ApiResponse({ status: 200 })
  async getByVertical(@Param('vertical') vertical: string) {
    return this.postMortemService.getByVertical(vertical as any);
  }

  @Get(':id')
  @Roles(UserRole.PARTICIPANT, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter detalhes de um post-mortem' })
  @ApiResponse({ status: 200 })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.postMortemService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.PARTICIPANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar post-mortem' })
  @ApiResponse({ status: 200 })
  async update(@Param('id') id: string, @Body() dto: UpdatePostMortemDto, @CurrentUser() user: User) {
    return this.postMortemService.update(id, dto, user.id, user.role);
  }

  @Post(':id/comments')
  @Roles(UserRole.PARTICIPANT, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Adicionar comentário ao post-mortem' })
  @ApiResponse({ status: 201 })
  async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @CurrentUser() user: User) {
    return this.postMortemService.addComment(id, dto.content, user.id);
  }

  @Get(':id/comments')
  @Roles(UserRole.PARTICIPANT, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar comentários do post-mortem' })
  @ApiResponse({ status: 200 })
  async getComments(@Param('id') id: string) {
    return this.postMortemService.getComments(id);
  }

  @Delete(':id')
  @Roles(UserRole.PARTICIPANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir post-mortem' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.postMortemService.delete(id, user.id, user.role);
  }
}