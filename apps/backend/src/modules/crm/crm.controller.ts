import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { CreateCompanyDto, UpdateCompanyDto, CreateContactDto, UpdateContactDto, CreateDealDto, UpdateDealDto, CreateActivityDto, CrmQueryDto } from './crm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserRole } from '../../common/enums/user.enums';

@ApiTags('crm')
@ApiBearerAuth()
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private crmService: CrmService) {}

  // Companies
  @Post('companies')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar empresa' })
  async createCompany(@Body() dto: CreateCompanyDto, @CurrentUser() user: User) {
    return this.crmService.createCompany(dto, user.id);
  }

  @Get('companies')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar empresas' })
  async findAllCompanies(@Query() query: CrmQueryDto) {
    return this.crmService.findAllCompanies(query);
  }

  @Get('companies/:id')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter empresa por ID' })
  async findCompany(@Param('id') id: string) {
    return this.crmService.findCompanyById(id);
  }

  @Put('companies/:id')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar empresa' })
  async updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @CurrentUser() user: User) {
    return this.crmService.updateCompany(id, dto, user.id, user.role);
  }

  @Delete('companies/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir empresa' })
  async deleteCompany(@Param('id') id: string, @CurrentUser() user: User) {
    await this.crmService.deleteCompany(id, user.id, user.role);
  }

  // Contacts
  @Post('contacts')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar contato' })
  async createContact(@Body() dto: CreateContactDto, @CurrentUser() user: User) {
    return this.crmService.createContact(dto, user.id);
  }

  @Get('contacts')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar contatos' })
  async findAllContacts(@Query() query: CrmQueryDto) {
    return this.crmService.findAllContacts(query);
  }

  @Get('contacts/:id')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter contato por ID' })
  async findContact(@Param('id') id: string) {
    return this.crmService.findContactById(id);
  }

  @Put('contacts/:id')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar contato' })
  async updateContact(@Param('id') id: string, @Body() dto: UpdateContactDto, @CurrentUser() user: User) {
    return this.crmService.updateContact(id, dto, user.id, user.role);
  }

  @Delete('contacts/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir contato' })
  async deleteContact(@Param('id') id: string, @CurrentUser() user: User) {
    await this.crmService.deleteContact(id, user.id, user.role);
  }

  // Deals
  @Post('deals')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar negócio' })
  async createDeal(@Body() dto: CreateDealDto, @CurrentUser() user: User) {
    return this.crmService.createDeal(dto, user.id);
  }

  @Get('deals')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar negócios' })
  async findAllDeals(@Query() query: CrmQueryDto) {
    return this.crmService.findAllDeals(query);
  }

  @Get('deals/:id')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter negócio por ID' })
  async findDeal(@Param('id') id: string) {
    return this.crmService.findDealById(id);
  }

  @Put('deals/:id')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar negócio' })
  async updateDeal(@Param('id') id: string, @Body() dto: UpdateDealDto, @CurrentUser() user: User) {
    return this.crmService.updateDeal(id, dto, user.id, user.role);
  }

  @Delete('deals/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir negócio' })
  async deleteDeal(@Param('id') id: string, @CurrentUser() user: User) {
    await this.crmService.deleteDeal(id, user.id, user.role);
  }

  // Activities
  @Post('activities')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar atividade' })
  async createActivity(@Body() dto: CreateActivityDto, @CurrentUser() user: User) {
    return this.crmService.createActivity(dto, user.id);
  }

  @Get('activities')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar atividades' })
  async findAllActivities(@Query() query: { contactId?: string; dealId?: string; ownerId?: string; page?: number; limit?: number }) {
    return this.crmService.findAllActivities(query);
  }

  @Put('activities/:id/complete')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Completar atividade' })
  async completeActivity(@Param('id') id: string, @CurrentUser() user: User) {
    return this.crmService.completeActivity(id, user.id);
  }

  // Pipelines
  @Post('pipelines')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar pipeline' })
  async createPipeline(@Body() data: { name: string; description?: string; stages: any[]; isDefault?: boolean }) {
    return this.crmService.createPipeline(data);
  }

  @Get('pipelines')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar pipelines' })
  async findAllPipelines() {
    return this.crmService.findAllPipelines();
  }

  // Dashboard
  @Get('dashboard')
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter estatísticas do dashboard CRM' })
  async getDashboard(@CurrentUser() user: User) {
    return this.crmService.getDashboardStats(user.id, user.role);
  }
}