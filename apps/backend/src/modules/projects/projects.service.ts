import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { ProjectEvaluation } from './project-evaluation.entity';
import { User } from '../users/user.entity';
import { CreateProjectDto, UpdateProjectDto, EvaluateProjectDto, ProjectListQueryDto } from './projects.dto';
import { UserRole, ProjectStatus, EvaluationStatus, UserVertical } from '../../common/enums/user.enums';
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
    const project = this.projectRepository.create({
      ...dto,
      authorId,
      status: ProjectStatus.DRAFT,
    });
    return this.projectRepository.save(project);
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