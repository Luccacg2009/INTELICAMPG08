import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserRole, UserVertical } from './common/enums/user.enums';

const INITIAL_PASSWORDS: Record<UserRole, string> = {
  [UserRole.WORKER]: 'azul123',
  [UserRole.ANALYST]: 'azul456',
  [UserRole.ADMIN]: 'azul789',
};

const DEFAULT_USERS = [
  { email: 'admin@azul.com', name: 'Administrador Marketing', role: UserRole.ADMIN, vertical: UserVertical.MARKETING },
  { email: 'analista@azul.com', name: 'Analista de Projetos', role: UserRole.ANALYST, vertical: UserVertical.MARKETING },
  { email: 'trabalhador@azul.com', name: 'Colaborador Produto', role: UserRole.WORKER, vertical: UserVertical.PRODUCT },
  { email: 'trabalhador2@azul.com', name: 'Colaborador Vendas', role: UserRole.WORKER, vertical: UserVertical.SALES },
  { email: 'trabalhador3@azul.com', name: 'Colaborador Engenharia', role: UserRole.WORKER, vertical: UserVertical.ENGINEERING },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  console.log('🌱 Iniciando seed de usuários padrão...\n');

  for (const userData of DEFAULT_USERS) {
    const existing = await usersService.findByEmail(userData.email);
    if (existing) {
      console.log(`⚠️  Usuário ${userData.email} já existe, pulando...`);
      continue;
    }

    const password = INITIAL_PASSWORDS[userData.role];
    const passwordHash = await bcrypt.hash(password, 12);

    await usersService.create({
      email: userData.email,
      passwordHash,
      name: userData.name,
      role: userData.role,
      vertical: userData.vertical,
    });

    console.log(`✅ Criado: ${userData.name} (${userData.email})`);
    console.log(`   Role: ${userData.role} | Senha inicial: ${password}\n`);
  }

  console.log('🎉 Seed concluído!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   ADMIN:       admin@azul.com       / azul789');
  console.log('   ANALYST:     analista@azul.com    / azul456');
  console.log('   WORKER:      trabalhador@azul.com / azul123');
  console.log('   WORKER:      trabalhador2@azul.com / azul123');
  console.log('   WORKER:      trabalhador3@azul.com / azul123');

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});