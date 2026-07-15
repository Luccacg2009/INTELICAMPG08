import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { UserVertical } from '../../common/enums/user.enums';

export enum CrmContactStatus {
  LEAD = 'LEAD',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export enum CrmDealStage {
  PROSPECTING = 'PROSPECTING',
  QUALIFICATION = 'QUALIFICATION',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export enum CrmActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  TASK = 'TASK',
  NOTE = 'NOTE',
}

@Entity('crm_companies')
@Index(['vertical'])
@Index(['status'])
export class CrmCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'enum', enum: UserVertical, nullable: true })
  vertical: UserVertical;

  @Column({ nullable: true })
  industry: string;

  @Column('int', { default: 0 })
  employeeCount: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  customFields: Record<string, any>;

  @Column({ nullable: true, name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => CrmContact, contact => contact.company)
  contacts: CrmContact[];

  @OneToMany(() => CrmDeal, deal => deal.company)
  deals: CrmDeal[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('crm_contacts')
@Index(['email'])
@Index(['companyId'])
@Index(['status'])
@Index(['ownerId'])
export class CrmContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  twitterHandle: string;

  @Column({ type: 'enum', enum: CrmContactStatus, default: CrmContactStatus.LEAD })
  status: CrmContactStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column('jsonb', { nullable: true })
  customFields: Record<string, any>;

  @Column({ nullable: true, name: 'company_id' })
  companyId: string;

  @ManyToOne(() => CrmCompany, company => company.contacts, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: CrmCompany;

  @Column({ nullable: true, name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => CrmDeal, deal => deal.contact)
  deals: CrmDeal[];

  @OneToMany(() => CrmActivity, activity => activity.contact)
  activities: CrmActivity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('crm_deals')
@Index(['stage'])
@Index(['companyId'])
@Index(['contactId'])
@Index(['ownerId'])
@Index(['expectedCloseDate'])
export class CrmDeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 15, scale: 2 })
  value: number;

  @Column({ type: 'enum', enum: CrmDealStage, default: CrmDealStage.PROSPECTING })
  stage: CrmDealStage;

  @Column('int', { default: 0 })
  probability: number;

  @Column({ nullable: true, name: 'expected_close_date' })
  expectedCloseDate: Date;

  @Column({ nullable: true, name: 'actual_close_date' })
  actualCloseDate: Date;

  @Column({ nullable: true })
  lostReason: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  customFields: Record<string, any>;

  @Column({ nullable: true, name: 'company_id' })
  companyId: string;

  @ManyToOne(() => CrmCompany, company => company.deals, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: CrmCompany;

  @Column({ nullable: true, name: 'contact_id' })
  contactId: string;

  @ManyToOne(() => CrmContact, contact => contact.deals, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contact_id' })
  contact: CrmContact;

  @Column({ nullable: true, name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => CrmActivity, activity => activity.deal)
  activities: CrmActivity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('crm_activities')
@Index(['type'])
@Index(['contactId'])
@Index(['dealId'])
@Index(['ownerId'])
@Index(['dueDate'])
export class CrmActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CrmActivityType })
  type: CrmActivityType;

  @Column()
  subject: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true, name: 'due_date' })
  dueDate: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true, name: 'completed_at' })
  completedAt: Date;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true, name: 'contact_id' })
  contactId: string;

  @ManyToOne(() => CrmContact, contact => contact.activities, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contact_id' })
  contact: CrmContact;

  @Column({ nullable: true, name: 'deal_id' })
  dealId: string;

  @ManyToOne(() => CrmDeal, deal => deal.activities, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deal_id' })
  deal: CrmDeal;

  @Column({ nullable: true, name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('crm_pipelines')
export class CrmPipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column('jsonb', { default: [] })
  stages: { name: string; order: number; probability: number; color: string }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}