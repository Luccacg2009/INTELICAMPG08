import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmCompany, CrmContact, CrmDeal, CrmActivity, CrmPipeline, CrmContactStatus, CrmDealStage, CrmActivityType } from './crm.entity';
import { User } from '../users/user.entity';
import { UserRole } from '../../common/enums/user.enums';

export interface CreateCompanyDto {
  name: string;
  domain?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  vertical?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  description?: string;
  customFields?: Record<string, any>;
}

export interface UpdateCompanyDto {
  name?: string;
  domain?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  vertical?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  status?: string;
  description?: string;
  customFields?: Record<string, any>;
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  status?: CrmContactStatus;
  notes?: string;
  companyId?: string;
  customFields?: Record<string, any>;
}

export interface UpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  status?: CrmContactStatus;
  notes?: string;
  companyId?: string;
  customFields?: Record<string, any>;
}

export interface CreateDealDto {
  name: string;
  value: number;
  stage?: CrmDealStage;
  probability?: number;
  expectedCloseDate?: Date;
  description?: string;
  companyId?: string;
  contactId?: string;
  customFields?: Record<string, any>;
}

export interface UpdateDealDto {
  name?: string;
  value?: number;
  stage?: CrmDealStage;
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  lostReason?: string;
  description?: string;
  customFields?: Record<string, any>;
}

export interface CreateActivityDto {
  type: CrmActivityType;
  subject: string;
  description?: string;
  dueDate?: Date;
  duration?: number;
  contactId?: string;
  dealId?: string;
  metadata?: Record<string, any>;
}

export interface CrmQueryDto {
  status?: string;
  stage?: string;
  vertical?: string;
  ownerId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(CrmCompany)
    private companyRepository: Repository<CrmCompany>,
    @InjectRepository(CrmContact)
    private contactRepository: Repository<CrmContact>,
    @InjectRepository(CrmDeal)
    private dealRepository: Repository<CrmDeal>,
    @InjectRepository(CrmActivity)
    private activityRepository: Repository<CrmActivity>,
    @InjectRepository(CrmPipeline)
    private pipelineRepository: Repository<CrmPipeline>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Companies
  async createCompany(dto: CreateCompanyDto, ownerId: string): Promise<CrmCompany> {
    const company = this.companyRepository.create({ ...dto, ownerId });
    return this.companyRepository.save(company);
  }

  async findAllCompanies(query: CrmQueryDto): Promise<{ data: CrmCompany[]; total: number }> {
    const qb = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.owner', 'owner')
      .orderBy('company.createdAt', 'DESC');

    if (query.status) qb.andWhere('company.status = :status', { status: query.status });
    if (query.vertical) qb.andWhere('company.vertical = :vertical', { vertical: query.vertical });
    if (query.ownerId) qb.andWhere('company.ownerId = :ownerId', { ownerId: query.ownerId });

    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findCompanyById(id: string): Promise<CrmCompany> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['owner', 'contacts', 'deals'],
    });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return company;
  }

  async updateCompany(id: string, dto: UpdateCompanyDto, userId: string, userRole: UserRole): Promise<CrmCompany> {
    const company = await this.findCompanyById(id);
    if (company.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a editar esta empresa');
    }
    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }

  async deleteCompany(id: string, userId: string, userRole: UserRole): Promise<void> {
    const company = await this.findCompanyById(id);
    if (company.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a excluir esta empresa');
    }
    await this.companyRepository.remove(company);
  }

  // Contacts
  async createContact(dto: CreateContactDto, ownerId: string): Promise<CrmContact> {
    const contact = this.contactRepository.create({ ...dto, ownerId });
    return this.contactRepository.save(contact);
  }

  async findAllContacts(query: CrmQueryDto): Promise<{ data: CrmContact[]; total: number }> {
    const qb = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.company', 'company')
      .leftJoinAndSelect('contact.owner', 'owner')
      .orderBy('contact.createdAt', 'DESC');

    if (query.status) qb.andWhere('contact.status = :status', { status: query.status });
    if (query.ownerId) qb.andWhere('contact.ownerId = :ownerId', { ownerId: query.ownerId });

    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findContactById(id: string): Promise<CrmContact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['company', 'owner', 'deals', 'activities'],
    });
    if (!contact) throw new NotFoundException('Contato não encontrado');
    return contact;
  }

  async updateContact(id: string, dto: UpdateContactDto, userId: string, userRole: UserRole): Promise<CrmContact> {
    const contact = await this.findContactById(id);
    if (contact.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a editar este contato');
    }
    Object.assign(contact, dto);
    return this.contactRepository.save(contact);
  }

  async deleteContact(id: string, userId: string, userRole: UserRole): Promise<void> {
    const contact = await this.findContactById(id);
    if (contact.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a excluir este contato');
    }
    await this.contactRepository.remove(contact);
  }

  // Deals
  async createDeal(dto: CreateDealDto, ownerId: string): Promise<CrmDeal> {
    const deal = this.dealRepository.create({ ...dto, ownerId });
    return this.dealRepository.save(deal);
  }

  async findAllDeals(query: CrmQueryDto): Promise<{ data: CrmDeal[]; total: number }> {
    const qb = this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.company', 'company')
      .leftJoinAndSelect('deal.contact', 'contact')
      .leftJoinAndSelect('deal.owner', 'owner')
      .orderBy('deal.createdAt', 'DESC');

    if (query.stage) qb.andWhere('deal.stage = :stage', { stage: query.stage });
    if (query.ownerId) qb.andWhere('deal.ownerId = :ownerId', { ownerId: query.ownerId });

    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findDealById(id: string): Promise<CrmDeal> {
    const deal = await this.dealRepository.findOne({
      where: { id },
      relations: ['company', 'contact', 'owner', 'activities'],
    });
    if (!deal) throw new NotFoundException('Negócio não encontrado');
    return deal;
  }

  async updateDeal(id: string, dto: UpdateDealDto, userId: string, userRole: UserRole): Promise<CrmDeal> {
    const deal = await this.findDealById(id);
    if (deal.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a editar este negócio');
    }
    Object.assign(deal, dto);
    if (dto.stage === CrmDealStage.CLOSED_WON) {
      deal.actualCloseDate = new Date();
      deal.probability = 100;
    } else if (dto.stage === CrmDealStage.CLOSED_LOST) {
      deal.actualCloseDate = new Date();
      deal.probability = 0;
    }
    return this.dealRepository.save(deal);
  }

  async deleteDeal(id: string, userId: string, userRole: UserRole): Promise<void> {
    const deal = await this.findDealById(id);
    if (deal.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a excluir este negócio');
    }
    await this.dealRepository.remove(deal);
  }

  // Activities
  async createActivity(dto: CreateActivityDto, ownerId: string): Promise<CrmActivity> {
    const activity = this.activityRepository.create({ ...dto, ownerId });
    return this.activityRepository.save(activity);
  }

  async findAllActivities(query: { contactId?: string; dealId?: string; ownerId?: string; page?: number; limit?: number }): Promise<{ data: CrmActivity[]; total: number }> {
    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.contact', 'contact')
      .leftJoinAndSelect('activity.deal', 'deal')
      .leftJoinAndSelect('activity.owner', 'owner')
      .orderBy('activity.dueDate', 'ASC');

    if (query.contactId) qb.andWhere('activity.contactId = :contactId', { contactId: query.contactId });
    if (query.dealId) qb.andWhere('activity.dealId = :dealId', { dealId: query.dealId });
    if (query.ownerId) qb.andWhere('activity.ownerId = :ownerId', { ownerId: query.ownerId });

    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async completeActivity(id: string, userId: string): Promise<CrmActivity> {
    const activity = await this.activityRepository.findOne({ where: { id } });
    if (!activity) throw new NotFoundException('Atividade não encontrada');
    activity.completed = true;
    activity.completedAt = new Date();
    return this.activityRepository.save(activity);
  }

  // Pipelines
  async createPipeline(data: { name: string; description?: string; stages: any[]; isDefault?: boolean }): Promise<CrmPipeline> {
    const pipeline = this.pipelineRepository.create(data);
    return this.pipelineRepository.save(pipeline);
  }

  async findAllPipelines(): Promise<CrmPipeline[]> {
    return this.pipelineRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getDefaultPipeline(): Promise<CrmPipeline> {
    let pipeline = await this.pipelineRepository.findOne({ where: { isDefault: true } });
    if (!pipeline) {
      pipeline = await this.createPipeline({
        name: 'Pipeline Padrão',
        isDefault: true,
        stages: [
          { name: 'Prospecção', order: 1, probability: 10, color: '#3B82F6' },
          { name: 'Qualificação', order: 2, probability: 25, color: '#8B5CF6' },
          { name: 'Proposta', order: 3, probability: 50, color: '#F59E0B' },
          { name: 'Negociação', order: 4, probability: 75, color: '#EF4444' },
          { name: 'Fechado - Ganho', order: 5, probability: 100, color: '#10B981' },
          { name: 'Fechado - Perdido', order: 6, probability: 0, color: '#6B7280' },
        ],
      });
    }
    return pipeline;
  }

  // Dashboard stats
  async getDashboardStats(userId: string, userRole: UserRole): Promise<any> {
    const companyQb = this.companyRepository.createQueryBuilder('company');
    const contactQb = this.contactRepository.createQueryBuilder('contact');
    const dealQb = this.dealRepository.createQueryBuilder('deal');
    const activityQb = this.activityRepository.createQueryBuilder('activity');

    if (userRole !== UserRole.ADMIN) {
      companyQb.andWhere('company.ownerId = :userId', { userId });
      contactQb.andWhere('contact.ownerId = :userId', { userId });
      dealQb.andWhere('deal.ownerId = :userId', { userId });
      activityQb.andWhere('activity.ownerId = :userId', { userId });
    }

    const [totalCompanies, totalContacts, dealsByStage, openActivities] = await Promise.all([
      companyQb.getCount(),
      contactQb.getCount(),
      dealQb.select('deal.stage, COUNT(*) as count, SUM(deal.value) as totalValue').groupBy('deal.stage').getRawMany(),
      activityQb.andWhere('activity.completed = false').andWhere('activity.dueDate >= :now', { now: new Date() }).getCount(),
    ]);

    return {
      totalCompanies,
      totalContacts,
      dealsByStage,
      openActivities,
    };
  }
}