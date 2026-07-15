import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VerticalsService } from './verticals.service';
import { VerticalConfig, CompanyValue, VerticalBenchmark, MarketBenchmark } from './vertical-config.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserVertical, UserRole } from '../../common/enums/user.enums';

@ApiTags('verticals')
@ApiBearerAuth()
@Controller('verticals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VerticalsController {
  constructor(private verticalsService: VerticalsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VERTICAL_LEAD, UserRole.ANALYST)
  @ApiOperation({ summary: 'Listar todas as verticais' })
  @ApiResponse({ status: 200, type: [VerticalConfig] })
  async getVerticals() {
    return this.verticalsService.getVerticals();
  }

  @Get(':vertical')
  @Roles(UserRole.ADMIN, UserRole.VERTICAL_LEAD, UserRole.ANALYST)
  @ApiOperation({ summary: 'Obter configuração de uma vertical' })
  @ApiResponse({ status: 200, type: VerticalConfig })
  async getVertical(@Param('vertical') vertical: UserVertical) {
    return this.verticalsService.getVertical(vertical);
  }

  @Put(':vertical')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar configuração de vertical (apenas Admin)' })
  @ApiResponse({ status: 200, type: VerticalConfig })
  async updateVertical(@Param('vertical') vertical: UserVertical, @Body() data: Partial<VerticalConfig>) {
    return this.verticalsService.updateVertical(vertical, data);
  }

  @Get('values/all')
  @Roles(UserRole.ADMIN, UserRole.VERTICAL_LEAD, UserRole.ANALYST)
  @ApiOperation({ summary: 'Listar valores da empresa' })
  @ApiResponse({ status: 200, type: [CompanyValue] })
  async getValues() {
    return this.verticalsService.getCompanyValues();
  }

  @Post('values')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo valor da empresa (apenas Admin)' })
  @ApiResponse({ status: 201, type: CompanyValue })
  async createValue(@Body() data: { name: string; description: string }) {
    return this.verticalsService.createValue(data);
  }

  @Put('values/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar valor da empresa (apenas Admin)' })
  @ApiResponse({ status: 200, type: CompanyValue })
  async updateValue(@Param('id') id: string, @Body() data: Partial<CompanyValue>) {
    return this.verticalsService.updateValue(id, data);
  }

  @Delete('values/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar valor da empresa (apenas Admin)' })
  @ApiResponse({ status: 204 })
  async deleteValue(@Param('id') id: string) {
    await this.verticalsService.deleteValue(id);
  }

  // Benchmark endpoints
  @Get('benchmarks')
  @Roles(UserRole.ADMIN, UserRole.VERTICAL_LEAD, UserRole.ANALYST)
  @ApiOperation({ summary: 'Obter benchmark histórico da vertical' })
  @ApiQuery({ name: 'vertical', required: true, enum: UserVertical })
  @ApiResponse({ status: 200, type: VerticalBenchmark })
  async getBenchmark(@Query('vertical') vertical: UserVertical) {
    return this.verticalsService.getBenchmark(vertical);
  }

  @Post('benchmarks')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar benchmark histórico (apenas Admin)' })
  @ApiResponse({ status: 201, type: VerticalBenchmark })
  async createBenchmark(@Body() data: Partial<VerticalBenchmark>) {
    return this.verticalsService.createBenchmark(data);
  }

  @Put('benchmarks/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar benchmark histórico (apenas Admin)' })
  @ApiResponse({ status: 200, type: VerticalBenchmark })
  async updateBenchmark(@Param('id') id: string, @Body() data: Partial<VerticalBenchmark>) {
    return this.verticalsService.updateBenchmark(id, data);
  }

  // Market benchmark endpoints
  @Get('market-benchmarks/all')
  @Roles(UserRole.ADMIN, UserRole.VERTICAL_LEAD, UserRole.ANALYST)
  @ApiOperation({ summary: 'Listar benchmarks de mercado/concorrentes' })
  @ApiQuery({ name: 'vertical', required: true, enum: UserVertical })
  @ApiResponse({ status: 200, type: [MarketBenchmark] })
  async getMarketBenchmarks(@Query('vertical') vertical: UserVertical) {
    return this.verticalsService.getMarketBenchmarks(vertical);
  }

  @Post('market-benchmarks')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar benchmark de mercado (apenas Admin)' })
  @ApiResponse({ status: 201, type: MarketBenchmark })
  async createMarketBenchmark(@Body() data: Partial<MarketBenchmark>) {
    return this.verticalsService.createMarketBenchmark(data);
  }

  @Put('market-benchmarks/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar benchmark de mercado (apenas Admin)' })
  @ApiResponse({ status: 200, type: MarketBenchmark })
  async updateMarketBenchmark(@Param('id') id: string, @Body() data: Partial<MarketBenchmark>) {
    return this.verticalsService.updateMarketBenchmark(id, data);
  }

  @Delete('market-benchmarks/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar benchmark de mercado (apenas Admin)' })
  @ApiResponse({ status: 204 })
  async deleteMarketBenchmark(@Param('id') id: string) {
    await this.verticalsService.deleteMarketBenchmark(id);
  }
}