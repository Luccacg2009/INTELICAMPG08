import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostMortem, PostMortemComment, PostMortemStatus, PostMortemType } from './post-mortem.entity';
import { User } from '../users/user.entity';
import { UserRole, UserVertical } from '../../common/enums/user.enums';

export interface CreatePostMortemDto {
  title: string;
  summary: string;
  type: PostMortemType;
  vertical: UserVertical;
  relatedIdeaIds?: string[];
  whatWentWell?: string;
  whatWentWrong?: string;
  rootCauseAnalysis?: string;
  actionItems?: string;
  lessonsLearned?: string;
  metrics?: Record<string, any>;
}

export interface UpdatePostMortemDto {
  title?: string;
  summary?: string;
  type?: PostMortemType;
  vertical?: UserVertical;
  relatedIdeaIds?: string[];
  whatWentWell?: string;
  whatWentWrong?: string;
  rootCauseAnalysis?: string;
  actionItems?: string;
  lessonsLearned?: string;
  metrics?: Record<string, any>;
  status?: PostMortemStatus;
}

export interface PostMortemQueryDto {
  status?: string;
  type?: string;
  vertical?: string;
  authorId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PostMortemService {
  constructor(
    @InjectRepository(PostMortem)
    private postMortemRepository: Repository<PostMortem>,
    @InjectRepository(PostMortemComment)
    private commentRepository: Repository<PostMortemComment>,
  ) {}

  async create(dto: CreatePostMortemDto, authorId: string): Promise<PostMortem> {
    const postMortem = this.postMortemRepository.create({
      ...dto,
      authorId,
      status: PostMortemStatus.DRAFT,
    });
    return this.postMortemRepository.save(postMortem);
  }

  async findAll(query: PostMortemQueryDto): Promise<{ data: PostMortem[]; total: number }> {
    const qb = this.postMortemRepository
      .createQueryBuilder('pm')
      .leftJoinAndSelect('pm.author', 'author')
      .orderBy('pm.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('pm.status = :status', { status: query.status });
    }
    if (query.type) {
      qb.andWhere('pm.type = :type', { type: query.type });
    }
    if (query.vertical) {
      qb.andWhere('pm.vertical = :vertical', { vertical: query.vertical });
    }
    if (query.authorId) {
      qb.andWhere('pm.authorId = :authorId', { authorId: query.authorId });
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findById(id: string): Promise<PostMortem> {
    const pm = await this.postMortemRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author'],
    });
    if (!pm) throw new NotFoundException('Post-mortem não encontrado');
    return pm;
  }

  async update(id: string, dto: UpdatePostMortemDto, userId: string, userRole: UserRole): Promise<PostMortem> {
    const pm = await this.findById(id);
    if (pm.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a editar este post-mortem');
    }
    if (pm.status === PostMortemStatus.PUBLISHED && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não é possível editar post-mortem publicado');
    }
    Object.assign(pm, dto);
    if (dto.status === PostMortemStatus.PUBLISHED && pm.status !== PostMortemStatus.PUBLISHED) {
      pm.publishedAt = new Date();
    }
    return this.postMortemRepository.save(pm);
  }

  async delete(id: string, userId: string, userRole: UserRole): Promise<void> {
    const pm = await this.findById(id);
    if (pm.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Não autorizado a excluir este post-mortem');
    }
    await this.postMortemRepository.remove(pm);
  }

  async addComment(postMortemId: string, content: string, authorId: string): Promise<PostMortemComment> {
    const pm = await this.findById(postMortemId);
    const comment = this.commentRepository.create({
      postMortemId,
      authorId,
      content,
    });
    return this.commentRepository.save(comment);
  }

  async getComments(postMortemId: string): Promise<PostMortemComment[]> {
    return this.commentRepository.find({
      where: { postMortemId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async getByVertical(vertical: UserVertical): Promise<PostMortem[]> {
    return this.postMortemRepository.find({
      where: { vertical, status: PostMortemStatus.PUBLISHED },
      relations: ['author'],
      order: { publishedAt: 'DESC' },
    });
  }

  async getLessonsLearned(vertical?: UserVertical): Promise<{ type: PostMortemType; lessons: string[] }[]> {
    const qb = this.postMortemRepository
      .createQueryBuilder('pm')
      .select('pm.type', 'type')
      .addSelect('pm.lessonsLearned', 'lessonsLearned')
      .where('pm.status = :status', { status: PostMortemStatus.PUBLISHED })
      .andWhere('pm.lessonsLearned IS NOT NULL')
      .andWhere('pm.lessonsLearned != :empty', { empty: '' });

    if (vertical) {
      qb.andWhere('pm.vertical = :vertical', { vertical });
    }

    const results = await qb.getRawMany();
    return results.map(r => ({
      type: r.type,
      lessons: r.lessonsLearned.split('\n').filter(l => l.trim()),
    }));
  }
}