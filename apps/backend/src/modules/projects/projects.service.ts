import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Project } from './project.entity';
import { ProjectEvaluation } from './project-evaluation.entity';
import { User } from '../users/user.entity';
import { CreateProjectDto, UpdateProjectDto, EvaluateProjectDto, ProjectListQueryDto } from './projects.dto';
import { UserRole, ProjectStatus, EvaluationStatus, UserVertical, ProjectPriority, PriorityColor, PRIORITY_TO_COLOR } from '../../common/enums/user.enums';
import { ConfigService } from '@nestjs/config';
import { AIService } from '../ai/ai.service';
import { PDFService } from '../pdf/pdf.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectEvaluation)
    private evaluationRepository: Repository<ProjectEvaluation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    @Inject(forwardRef(() => AIService))
    private aiService: AIService,
    private pdfService: PDFService,
  ) {}

  async create(dto: CreateProjectDto, authorId: string): Promise<Project> {
    const accessPasswordHash = await bcrypt.hash(dto.accessPassword, 12);
    const { accessPassword, ...restDto } = dto;
    
    // Calculate priority based on historical benchmarks if not provided
    const priority = restDto.priority || await this.calculatePriorityFromBenchmarks(restDto.vertical);
    const priorityColor = PRIORITY_TO_COLOR[priority];
    
    const project = this.projectRepository.create({
      ...restDto,
      authorId,
      status: ProjectStatus.DRAFT,
      accessPasswordHash,
      priority,
      priorityColor,
    });
    return this.projectRepository.save(project);
  }

  /**
   * Calculate priority based on historical project performance in the same vertical
   * Uses: success rate, average budget efficiency, time to market, customer feedback
   */
  private async calculatePriorityFromBenchmarks(vertical: UserVertical): Promise<ProjectPriority> {
    // Get approved/launched projects from the same vertical in the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const historicalProjects = await this.projectRepository
      .createQueryBuilder('project')
      .where('project.vertical = :vertical', { vertical })
      .andWhere('project.status IN (:...statuses)', { 
        statuses: [ProjectStatus.APPROVED, ProjectStatus.LAUNCHED, ProjectStatus.IN_DEVELOPMENT] 
      })
      .andWhere('project.createdAt >= :date', { date: oneYearAgo })
      .getMany();

    if (historicalProjects.length < 3) {
      // Not enough historical data, default to MEDIUM
      return ProjectPriority.MEDIUM;
    }

    // Calculate success metrics
    const totalProjects = historicalProjects.length;
    const successfulProjects = historicalProjects.filter(p => 
      p.status === ProjectStatus.LAUNCHED || p.status === ProjectStatus.APPROVED
    ).length;
    const successRate = successfulProjects / totalProjects;

    // Calculate average budget efficiency (projects with budget that were successful)
    const projectsWithBudget = historicalProjects.filter(p => p.budget !== null && p.budget !== undefined);
    let avgBudgetEfficiency = 0.5; // default
    if (projectsWithBudget.length > 0) {
      // Simplified: success rate of projects with budget
      const successfulWithBudget = projectsWithBudget.filter(p => 
        p.status === ProjectStatus.LAUNCHED || p.status === ProjectStatus.APPROVED
      ).length;
      avgBudgetEfficiency = successfulWithBudget / projectsWithBudget.length;
    }

    // Calculate priority score (0-100)
    // Weight: 50% success rate, 30% budget efficiency, 20% project count factor
    const projectCountFactor = Math.min(totalProjects / 20, 1); // normalize to max 20 projects
    const priorityScore = (successRate * 0.5 + avgBudgetEfficiency * 0.3 + projectCountFactor * 0.2) * 100;

    // Map score to priority
    if (priorityScore >= 70) return ProjectPriority.HIGH;    // GREEN
    if (priorityScore >= 40) return ProjectPriority.MEDIUM;  // YELLOW
    return ProjectPriority.LOW;                               // RED
  }

  async findAll(query: ProjectListQueryDto, user: User): Promise<{ data: Project[]; total: number; page: number; limit: number }> {
    const { status, vertical, page = 1, limit = 10 } = query;
    const qb = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.author', 'author')
      .orderBy('project.createdAt', 'DESC');

    if (user.role === UserRole.WORKER) {
      qb.where('(project.authorId = :userId OR (project.status = :approved AND project.vertical = :vertical))', {
        userId: user.id,
        approved: ProjectStatus.APPROVED,
        vertical: user.vertical,
      });
    } else if (user.role === UserRole.ANALYST) {
      qb.where('(project.status = :pending AND project.vertical = :vertical) OR project.authorId = :userId', {
        pending: ProjectStatus.PENDING_REVIEW,
        vertical: user.vertical,
        userId: user.id,
      });
    }

    if (status) qb.andWhere('project.status = :status', { status });
    if (vertical) qb.andWhere('project.vertical = :vertical', { vertical });

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return { data, total, page, limit };
  }

  async findById(id: string, user?: User): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['author', 'evaluations', 'evaluations.evaluator'],
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');

    if (user && user.role === UserRole.WORKER && project.authorId !== user.id) {
      if (project.status !== ProjectStatus.APPROVED) {
        throw new ForbiddenException('Acesso negado a este projeto');
      }
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string, userRole: UserRole): Promise<Project> {
    const project = await this.findById(id);
    
    if (userRole === UserRole.WORKER && project.authorId !== userId) {
      throw new ForbiddenException('Você só pode editar seus próprios projetos');
    }

    if (project.status !== ProjectStatus.DRAFT && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Só é possível editar projetos em rascunho');
    }

    if (dto.accessPassword) {
      project.accessPasswordHash = await bcrypt.hash(dto.accessPassword, 12);
      delete dto.accessPassword;
    }

    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async submitForReview(id: string, userId: string, userRole: UserRole): Promise<Project> {
    const project = await this.findById(id);
    
    if (userRole === UserRole.WORKER && project.authorId !== userId) {
      throw new ForbiddenException('Você só pode enviar seus próprios projetos');
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException('Apenas projetos em rascunho podem ser enviados para revisão');
    }

    project.status = ProjectStatus.PENDING_REVIEW;
    return this.projectRepository.save(project);
  }

  async delete(id: string, userId: string, userRole: UserRole): Promise<void> {
    const project = await this.findById(id);
    
    if (userRole === UserRole.WORKER && project.authorId !== userId) {
      throw new ForbiddenException('Você só pode excluir seus próprios projetos');
    }

    await this.projectRepository.remove(project);
  }

  async evaluate(id: string, dto: EvaluateProjectDto, evaluatorId: string): Promise<ProjectEvaluation> {
    const project = await this.findById(id);
    
    if (project.status !== ProjectStatus.PENDING_REVIEW) {
      throw new BadRequestException('Apenas projetos em revisão podem ser avaliados');
    }

    const existingEvaluation = await this.evaluationRepository.findOne({
      where: { projectId: id, evaluatorId },
    });

    let evaluation: ProjectEvaluation;
    if (existingEvaluation) {
      Object.assign(existingEvaluation, dto);
      evaluation = existingEvaluation;
    } else {
      // Map EvaluationStatus to ProjectStatus for the evaluation entity
      const statusMap: Record<EvaluationStatus, ProjectStatus> = {
        [EvaluationStatus.APPROVED]: ProjectStatus.APPROVED,
        [EvaluationStatus.REJECTED]: ProjectStatus.REJECTED,
        [EvaluationStatus.NEEDS_REVISION]: ProjectStatus.DRAFT,
        [EvaluationStatus.PENDING]: ProjectStatus.PENDING_REVIEW,
      };
      
      evaluation = this.evaluationRepository.create({
        ...dto,
        projectId: id,
        evaluatorId,
        status: statusMap[dto.status],
      });
    }

    await this.evaluationRepository.save(evaluation);

    if (dto.status === EvaluationStatus.APPROVED) {
      project.status = ProjectStatus.APPROVED;
    } else if (dto.status === EvaluationStatus.REJECTED) {
      project.status = ProjectStatus.REJECTED;
    } else if (dto.status === EvaluationStatus.NEEDS_REVISION) {
      project.status = ProjectStatus.DRAFT;
    }
    
    await this.projectRepository.save(project);
    return evaluation;
  }

  async getMyEvaluations(evaluatorId: string): Promise<ProjectEvaluation[]> {
    return this.evaluationRepository.find({
      where: { evaluatorId },
      relations: ['project', 'project.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async generateAiSummary(id: string): Promise<Project> {
    const project = await this.findById(id);
    
    const prompt = `
    Analise este projeto da Azul Linhas Aéreas e forneça um resumo executivo, pontos fortes, pontos fracos e sugestões de desenvolvimento.
    
    Título: ${project.title}
    Descrição: ${project.description}
    Objetivo: ${project.centralIdea}
    Público-alvo: ${project.targetAudience}
    Vertical: ${project.vertical}
    Orçamento: ${project.budget || 'Não informado'}
    Prazo: ${project.timeline || 'Não informado'}
    Prioridade: ${project.priority}
    `;

    const analysis = await this.aiService.analyzeProject(prompt);
    
    project.aiSummary = analysis.summary;
    project.aiAnalysis = analysis.fullAnalysis;
    
    return this.projectRepository.save(project);
  }

  async generatePdf(id: string): Promise<Buffer> {
    const project = await this.findById(id);
    return this.pdfService.generateProjectPdf(project);
  }
}