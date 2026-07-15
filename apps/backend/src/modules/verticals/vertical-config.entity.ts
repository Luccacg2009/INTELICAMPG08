import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserVertical } from '../../common/enums/user.enums';

@Entity('vertical_configs')
export class VerticalConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserVertical, unique: true })
  vertical: UserVertical;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { default: [] })
  values: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('company_values')
export class CompanyValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('vertical_benchmarks')
@Index(['vertical'])
export class VerticalBenchmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserVertical })
  vertical: UserVertical;

  @Column('text')
  description: string;

  @Column('int', { default: 0 })
  totalProposals: number;

  @Column('int', { default: 0 })
  successfulProposals: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  successRate: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  avgCost: number;

  @Column('int', { nullable: true })
  avgTimeToMarketDays: number;

  @Column('text', { nullable: true })
  customerFeedbackSummary: string;

  @Column('text', { nullable: true })
  competitorAnalysis: string;

  @Column('jsonb', { nullable: true })
  keySuccessFactors: string[];

  @Column('jsonb', { nullable: true })
  commonFailureReasons: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('market_benchmarks')
@Index(['vertical'])
export class MarketBenchmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserVertical })
  vertical: UserVertical;

  @Column()
  competitorName: string;

  @Column('text')
  productDescription: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  marketShare: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pricePoint: number;

  @Column('text', { nullable: true })
  strengths: string;

  @Column('text', { nullable: true })
  weaknesses: string;

  @Column('text', { nullable: true })
  keyDifferentiators: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}