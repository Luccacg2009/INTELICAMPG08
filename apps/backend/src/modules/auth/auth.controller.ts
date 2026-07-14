import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, Tokens } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiBearerAuth('refresh-token')
  async refresh(@CurrentUser() user: User, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
    const tokens = await this.authService.refreshTokens(user.id, refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiBearerAuth()
  async logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user.id);
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    return { message: 'Logout realizado com sucesso' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter usuário logado' })
  @ApiBearerAuth()
  async me(@CurrentUser() user: User) {
    const { passwordHash, refreshToken, ...userWithoutSecrets } = user;
    return userWithoutSecrets;
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}