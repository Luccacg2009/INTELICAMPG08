import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Idea, Feedback, AIDeletion, IdeaStatus } from './idea.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateIdeaDto, UpdateIdeaDto, ReviewIdeaDto, AISummaryDto, RequestAIDeletionDto, IdeaListQueryDto } from './dto/idea.dto';
import { AiService } from '../ai/ai.service';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class IdeasService {
  constructor(
    @InjectRepository(Idea)
    private ideaRepository: Repository<Idea>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(AIDeletion)
    private aiDeletionRepository: Repository<AIDeletion>,
    private aiService: AiService,
    private pdfService: PdfService,
  ) {}

  async create(dto: CreateIdeaDto, authorId: string): Promise<Idea> {
    const idea = this.ideaRepository.create({
      ...dto,
      authorId,
      status: IdeaStatus.PENDING_REVIEW,
    });
    return this.ideaRepository.save(idea);
  }

  async findAll(query: IdeaListQueryDto): Promise<{ ideas: Idea[]; total: number }> {
    const qb = this.ideaRepository
      .createQueryBuilder('idea')
      .leftJoinAndSelect('idea.author', 'author')
      .leftJoinAndSelect('idea.reviewedBy', 'reviewedBy')
      .orderBy('idea.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('idea.status = :status', { status: query.status });
    }
    if (query.vertical) {
      qb.andWhere('idea.vertical = :vertical', { vertical: query.vertical });
    }
    if (query.authorId) {
      qb.andWhere('idea.authorId = :authorId', { authorId: query.authorId });
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [ideas, total] = await qb.getManyAndCount();
    return { ideas, total };
  }

  async findById(id: string): Promise<Idea> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'reviewedBy', 'feedbacks', 'feedbacks.author', 'aiDeletion', 'aiDeletion.requester'],
    });
    if (!idea) throw new NotFoundException('Ideia não encontrada');
    return idea;
  }

  async findByAuthor(authorId: string): Promise<Idea[]> {
    return this.ideaRepository.find({
      where: { authorId },
      relations: ['feedbacks'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateIdeaDto, userId: string, userRole: UserRole): Promise<Idea> {
    const idea = await this.findById(id);
    if (idea.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a editar esta ideia');
    }
    if (idea.status !== IdeaStatus.PENDING_REVIEW && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não é possível editar ideia já analisada');
    }
    Object.assign(idea, dto);
    return this.ideaRepository.save(idea);
  }

  async review(id: string, dto: ReviewIdeaDto, reviewerId: string): Promise<Idea> {
    const idea = await this.findById(id);
    if (idea.status !== IdeaStatus.PENDING_REVIEW && idea.status !== IdeaStatus.UNDER_REVIEW) {
      throw new BadRequestException('Ideia não está em status de revisão');
    }

    idea.status = dto.status;
    idea.reviewedById = reviewerId;
    idea.reviewedAt = new Date();
    if (dto.strengths) idea.strengths = dto.strengths;
    if (dto.weaknesses) idea.weaknesses = dto.weaknesses;
    if (dto.developmentWays) idea.developmentWays = dto.developmentWays;

    if (dto.status === IdeaStatus.APPROVED || dto.status === IdeaStatus.REJECTED) {
      await this.generateAiSummary(idea);
    }

    return this.ideaRepository.save(idea);
  }

  private async generateAiSummary(idea: Idea): Promise<void> {
    try {
      const summary = await this.aiService.generateSummary({
        title: idea.title,
        vertical: idea.vertical,
        description: idea.description,
        targetAudience: idea.targetAudience,
        motivation: idea.motivation,
        launchLocation: idea.launchLocation,
        authorName: idea.author.name,
      });

      idea.aiSummary = summary.summary;
      idea.aiStrengths = summary.strengths;
      idea.aiWeaknesses = summary.weaknesses;
      idea.aiDevelopment = summary.developmentWays;
      idea.aiGeneratedAt = new Date();

      await this.ideaRepository.save(idea);
    } catch (error) {
      console.error('Erro ao gerar resumo IA:', error);
    }
  }

  async requestAiDeletion(id: string, dto: RequestAIDeletionDto, requesterId: string): Promise<AIDeletion> {
    const idea = await this.findById(id);
    if (idea.aiDeletion) {
      throw new BadRequestException('Solicitação de exclusão por IA já existe para esta ideia');
    }

    const deletion = this.aiDeletionRepository.create({
      ideaId: id,
      requesterId,
      reason: dto.reason,
      status: 'PENDING',
    });
    idea.status = IdeaStatus.AI_DELETION_REQUESTED;
    await this.ideaRepository.save(idea);
    return this.aiDeletionRepository.save(deletion);
  }

  async reviewAiDeletion(id: string, status: 'APPROVED' | 'REJECTED', reviewerId: string): Promise<AIDeletion> {
    const deletion = await this.aiDeletionRepository.findOne({
      where: { ideaId: id },
      relations: ['idea'],
    });
    if (!deletion) throw new NotFoundException('Solicitação de exclusão não encontrada');

    deletion.status = status;
    deletion.reviewedById = reviewerId;
    deletion.reviewedAt = new Date();

    if (status === 'APPROVED') {
      deletion.idea.status = IdeaStatus.DELETED_BY_AI;
      await this.ideaRepository.save(deletion.idea);
    } else {
      deletion.idea.status = IdeaStatus.PENDING_REVIEW;
      await this.ideaRepository.save(deletion.idea);
    }

    return this.aiDeletionRepository.save(deletion);
  }

  async generatePdf(id: string): Promise<Buffer> {
    const idea = await this.findById(id);
    if (!idea.aiSummary) throw new BadRequestException('Resumo por IA não disponível');

    return this.pdfService.generateIdeaPdf({
      idea,
      author: idea.author,
      summary: idea.aiSummary,
      strengths: idea.aiStrengths,
      weaknesses: idea.aiWeaknesses,
      developmentWays: idea.aiDevelopment,
    });
  }

  async delete(id: string, userId: string, userRole: UserRole): Promise<void> {
    const idea = await this.findById(id);
    if (idea.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a excluir esta ideia');
    }
    await this.ideaRepository.remove(idea);
  }
}