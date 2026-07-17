import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AIModule } from './modules/ai/ai.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { User } from './modules/users/user.entity';
import { Project } from './modules/projects/project.entity';
import { ProjectEvaluation } from './modules/projects/project-evaluation.entity';
import { AIConversation } from './modules/ai/ai-conversation.entity';
import { AIMessage } from './modules/ai/ai-message.entity';
import { RefreshToken } from './modules/users/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      // Banco em arquivo local — nenhum servidor externo é necessário.
      // O arquivo é criado automaticamente no primeiro boot.
      database: process.env.DATABASE_PATH || 'marketing_azul.sqlite',
      entities: [User, Project, ProjectEvaluation, AIConversation, AIMessage, RefreshToken],
      autoLoadEntities: true,
      // synchronize cria/atualiza as tabelas a partir das entidades no boot.
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    AIModule,
    PdfModule,
  ],
})
export class AppModule {}