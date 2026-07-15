import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './user.entity';
import { UserRole, UserVertical } from '../../common/enums/user.enums';
import * as bcrypt from 'bcryptjs';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo usuário (apenas admin)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role || UserRole.WORKER,
      vertical: dto.vertical || UserVertical.MARKETING,
    });
    return this.toResponse(user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os usuários (apenas admin)' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.getAll();
    return users.map(this.toResponse);
  }

  @Get('analysts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar analistas ativos' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async getAnalysts(): Promise<UserResponseDto[]> {
    const users = await this.usersService.getByRole(UserRole.ANALYST);
    return users.map(this.toResponse);
  }

  @Get('vertical/:vertical')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar usuários por vertical' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findByVertical(@Param('vertical') vertical: string): Promise<UserResponseDto[]> {
    const users = await this.usersService.getByVertical(vertical as UserVertical);
    return users.map(this.toResponse);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter perfil do usuário logado' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getProfile(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.toResponse(user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter usuário por ID (apenas admin)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.toResponse(user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário (apenas admin)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, dto);
    return this.toResponse(user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar usuário (apenas admin)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.deactivate(id);
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      vertical: user.vertical,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}