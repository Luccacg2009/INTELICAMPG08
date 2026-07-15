import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserVertical } from '../../../common/enums/user.enums';

export class RegisterDto {
  @ApiProperty({ example: 'joao@azul.com.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'azul123', description: 'Senha inicial baseada no papel: WORKER=azul123, ANALYST=azul456, ADMIN=azul789' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.WORKER, description: 'Papel do usuário: WORKER (colaborador), ANALYST (analista de marketing), ADMIN (administrador)' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ enum: UserVertical, example: UserVertical.MARKETING })
  @IsOptional()
  @IsEnum(UserVertical)
  vertical?: UserVertical;
}

export class LoginDto {
  @ApiProperty({ example: 'joao@azul.com.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'azul123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}