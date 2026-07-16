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
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'marketing_azul',
          }),
      entities: [User, Project, ProjectEvaluation, AIConversation, AIMessage, RefreshToken],
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
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