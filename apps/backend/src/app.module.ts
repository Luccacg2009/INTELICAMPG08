import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IdeasModule } from './modules/ideas/ideas.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AiModule } from './modules/ai/ai.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { VerticalsModule } from './modules/verticals/verticals.module';
import { PostMortemModule } from './modules/post-mortem/post-mortem.module';
import { CrmModule } from './modules/crm/crm.module';
import { FinancialModule } from './modules/financial/financial.module';
import { LgpdModule } from './modules/lgpd/lgpd.module';
import { NpsModule } from './modules/nps/nps.module';
import { ChurnModule } from './modules/churn/churn.module';
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
    VerticalsModule,
    PostMortemModule,
    CrmModule,
    FinancialModule,
    LgpdModule,
    NpsModule,
    ChurnModule,
  ],
})
export class AppModule {}