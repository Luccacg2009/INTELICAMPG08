import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerticalConfig } from './vertical-config.entity';
import { CompanyValue } from './company-value.entity';
import { VerticalsController } from './verticals.controller';
import { VerticalsService } from './verticals.service';

@Module({
  imports: [TypeOrmModule.forFeature([VerticalConfig, CompanyValue])],
  controllers: [VerticalsController],
  providers: [VerticalsService],
  exports: [VerticalsService],
})
export class VerticalsModule {}