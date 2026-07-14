import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IdeasModule } from './modules/ideas/ideas.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AiModule } from './modules/ai/ai.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    UsersModule,
    IdeasModule,
    FeedbackModule,
    AiModule,
    PdfModule,
  ],
})
export class AppModule {}