import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerticalsService } from './verticals.service';
import { VerticalsController } from './verticals.controller';
import { VerticalConfig, CompanyValue, VerticalBenchmark, MarketBenchmark } from './vertical-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VerticalConfig, CompanyValue, VerticalBenchmark, MarketBenchmark])],
  providers: [VerticalsService],
  controllers: [VerticalsController],
  exports: [VerticalsService],
})
export class VerticalsModule {}