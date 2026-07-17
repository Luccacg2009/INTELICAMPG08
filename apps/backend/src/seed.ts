import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Project } from './modules/projects/project.entity';
import { ProjectPriority, ProjectStatus, PriorityColor, UserRole, UserVertical } from './common/enums/user.enums';

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

const DEMO_PROJECTS = [
  {
    title: 'Embarque inteligente com biometria',
    description: 'Simplificar a jornada do passageiro usando biometria no embarque e reduzir filas nos aeroportos.',
    centralIdea: 'Criar uma experiência de embarque sem documentos físicos nos principais hubs da Azul.',
    targetAudience: 'Passageiros frequentes e clientes TudoAzul',
    vertical: UserVertical.MARKETING,
    status: ProjectStatus.PENDING_REVIEW,
    priority: ProjectPriority.HIGH,
    priorityColor: PriorityColor.GREEN,
    budget: 350000,
    timeline: '6 meses',
    launchLocation: 'Aeroporto de Viracopos',
    authorEmail: 'trabalhador@azul.com',
  },
  {
    title: 'Clube de benefícios para famílias',
    description: 'Plano de vantagens com bagagem compartilhada, marcação de assentos e pontos em grupo.',
    centralIdea: 'Aumentar a fidelização de famílias que viajam juntas por meio de benefícios compartilhados.',
    targetAudience: 'Famílias com crianças e viajantes de lazer',
    vertical: UserVertical.MARKETING,
    status: ProjectStatus.PENDING_REVIEW,
    priority: ProjectPriority.MEDIUM,
    priorityColor: PriorityColor.YELLOW,
    budget: 180000,
    timeline: '4 meses',
    launchLocation: 'Aplicativo e site da Azul',
    authorEmail: 'trabalhador2@azul.com',
  },
  {
    title: 'Painel de ofertas personalizadas',
    description: 'Recomendar destinos e serviços adicionais conforme o histórico e as preferências do cliente.',
    centralIdea: 'Usar dados de relacionamento para tornar as ofertas mais relevantes em cada etapa da compra.',
    targetAudience: 'Clientes cadastrados no TudoAzul',
    vertical: UserVertical.MARKETING,
    status: ProjectStatus.PENDING_REVIEW,
    priority: ProjectPriority.HIGH,
    priorityColor: PriorityColor.GREEN,
    budget: 240000,
    timeline: '5 meses',
    launchLocation: 'Canais digitais',
    authorEmail: 'trabalhador3@azul.com',
  },
  {
    title: 'Compensação voluntária de carbono',
    description: 'Permitir que o passageiro compense as emissões estimadas de sua viagem durante a compra.',
    centralIdea: 'Oferecer uma jornada transparente de contribuição ambiental integrada ao checkout.',
    targetAudience: 'Passageiros interessados em viagens sustentáveis',
    vertical: UserVertical.MARKETING,
    status: ProjectStatus.APPROVED,
    priority: ProjectPriority.MEDIUM,
    priorityColor: PriorityColor.YELLOW,
    budget: 120000,
    timeline: '3 meses',
    launchLocation: 'Site e aplicativo',
    authorEmail: 'admin@azul.com',
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const projectRepository = app.get<Repository<Project>>(getRepositoryToken(Project));

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

  console.log('\n💡 Criando projetos de demonstração...\n');
  const accessPasswordHash = await bcrypt.hash('demo123', 12);
  for (const projectData of DEMO_PROJECTS) {
    const existing = await projectRepository.findOne({ where: { title: projectData.title } });
    if (existing) {
      console.log(`⚠️  Projeto "${projectData.title}" já existe, pulando...`);
      continue;
    }

    const author = await usersService.findByEmail(projectData.authorEmail);
    if (!author) throw new Error(`Autor do seed não encontrado: ${projectData.authorEmail}`);
    const { authorEmail, ...data } = projectData;
    await projectRepository.save(projectRepository.create({
      ...data,
      authorId: author.id,
      accessPasswordHash,
    }));
    console.log(`✅ Criado: ${projectData.title}`);
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
