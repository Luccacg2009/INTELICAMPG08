import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../ideas/idea.entity';
import { Idea } from '../ideas/idea.entity';
import { User } from '../users/user.entity';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { UserRole } from '../../common/enums/user.enums';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Idea)
    private ideaRepository: Repository<Idea>,
  ) {}

  async create(ideaId: string, dto: CreateFeedbackDto, author: User): Promise<Feedback> {
    const idea = await this.ideaRepository.findOne({ where: { id: ideaId }, relations: ['author'] });
    if (!idea) throw new NotFoundException('Ideia não encontrada');

    if (idea.authorId === author.id) {
      throw new ForbiddenException('Não pode dar feedback na própria ideia');
    }

    const existing = await this.feedbackRepository.findOne({ where: { ideaId, authorId: author.id } });
    if (existing) {
      throw new ForbiddenException('Você já deu feedback para esta ideia');
    }

    const feedback = this.feedbackRepository.create({
      ideaId,
      authorId: author.id,
      type: dto.type,
      content: dto.content,
      marketingSuggestions: dto.marketingSuggestions,
      negativeReason: dto.negativeReason,
    });

    return this.feedbackRepository.save(feedback);
  }

  async findByIdea(ideaId: string): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { ideaId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByAuthor(authorId: string): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { authorId },
      relations: ['idea', 'idea.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFeedbackStats(ideaId: string): Promise<{ positive: number; negative: number }> {
    const [positive, negative] = await Promise.all([
      this.feedbackRepository.count({ where: { ideaId, type: 'POSITIVE' } }),
      this.feedbackRepository.count({ where: { ideaId, type: 'NEGATIVE' } }),
    ]);
    return { positive, negative };
  }

  async sendToAdmin(ideaId: string, adminId: string): Promise<Feedback[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { ideaId, sentToAdmin: false },
    });
    for (const f of feedbacks) {
      f.sentToAdmin = true;
    }
    return this.feedbackRepository.save(feedbacks);
  }

  async sendToVertical(ideaId: string, verticalLeadId: string): Promise<Feedback[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { ideaId, sentToVertical: false },
    });
    for (const f of feedbacks) {
      f.sentToVertical = true;
    }
    return this.feedbackRepository.save(feedbacks);
  }
}