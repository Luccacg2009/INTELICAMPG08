"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const idea_entity_1 = require("./idea.entity");
const user_enums_1 = require("../../common/enums/user.enums");
const ai_service_1 = require("../ai/ai.service");
const pdf_service_1 = require("../pdf/pdf.service");
let IdeasService = class IdeasService {
    ideaRepository;
    feedbackRepository;
    aiDeletionRepository;
    aiService;
    pdfService;
    constructor(ideaRepository, feedbackRepository, aiDeletionRepository, aiService, pdfService) {
        this.ideaRepository = ideaRepository;
        this.feedbackRepository = feedbackRepository;
        this.aiDeletionRepository = aiDeletionRepository;
        this.aiService = aiService;
        this.pdfService = pdfService;
    }
    async create(dto, authorId) {
        const idea = this.ideaRepository.create({
            ...dto,
            authorId,
            status: user_enums_1.IdeaStatus.PENDING_REVIEW,
        });
        return this.ideaRepository.save(idea);
    }
    async findAll(query) {
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
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        qb.skip((page - 1) * limit).take(limit);
        const [ideas, total] = await qb.getManyAndCount();
        return { ideas, total };
    }
    async findById(id) {
        const idea = await this.ideaRepository.findOne({
            where: { id },
            relations: ['author', 'reviewedBy', 'feedbacks', 'feedbacks.author', 'aiDeletion', 'aiDeletion.requester'],
        });
        if (!idea)
            throw new common_1.NotFoundException('Ideia não encontrada');
        return idea;
    }
    async findByAuthor(authorId) {
        return this.ideaRepository.find({
            where: { authorId },
            relations: ['feedbacks'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByVertical(vertical) {
        return this.ideaRepository.find({
            where: { vertical },
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, dto, userId, userRole) {
        const idea = await this.findById(id);
        if (idea.authorId !== userId && userRole !== user_enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Não autorizado a editar esta ideia');
        }
        if (idea.status !== user_enums_1.IdeaStatus.PENDING_REVIEW && userRole !== user_enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Não é possível editar ideia já analisada');
        }
        Object.assign(idea, dto);
        return this.ideaRepository.save(idea);
    }
    async review(id, dto, reviewerId) {
        const idea = await this.findById(id);
        if (idea.status !== user_enums_1.IdeaStatus.PENDING_REVIEW && idea.status !== user_enums_1.IdeaStatus.UNDER_REVIEW) {
            throw new common_1.BadRequestException('Ideia não está em status de revisão');
        }
        idea.status = dto.status;
        idea.reviewedById = reviewerId;
        idea.reviewedAt = new Date();
        if (dto.strengths)
            idea.strengths = dto.strengths;
        if (dto.weaknesses)
            idea.weaknesses = dto.weaknesses;
        if (dto.developmentWays)
            idea.developmentWays = dto.developmentWays;
        if (dto.status === user_enums_1.IdeaStatus.APPROVED || dto.status === user_enums_1.IdeaStatus.REJECTED) {
            await this.generateAiSummary(idea);
        }
        return this.ideaRepository.save(idea);
    }
    async generateAiSummary(idea) {
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
        }
        catch (error) {
            console.error('Erro ao gerar resumo IA:', error);
        }
    }
    async requestAiDeletion(id, dto, requesterId) {
        const idea = await this.findById(id);
        if (idea.aiDeletion) {
            throw new common_1.BadRequestException('Solicitação de exclusão por IA já existe para esta ideia');
        }
        const deletion = this.aiDeletionRepository.create({
            ideaId: id,
            requesterId,
            reason: dto.reason,
            status: 'PENDING',
        });
        idea.status = user_enums_1.IdeaStatus.AI_DELETION_REQUESTED;
        await this.ideaRepository.save(idea);
        return this.aiDeletionRepository.save(deletion);
    }
    async reviewAiDeletion(id, status, reviewerId) {
        const deletion = await this.aiDeletionRepository.findOne({
            where: { ideaId: id },
            relations: ['idea'],
        });
        if (!deletion)
            throw new common_1.NotFoundException('Solicitação de exclusão não encontrada');
        deletion.status = status;
        deletion.reviewedById = reviewerId;
        deletion.reviewedAt = new Date();
        if (status === 'APPROVED') {
            deletion.idea.status = user_enums_1.IdeaStatus.DELETED_BY_AI;
            await this.ideaRepository.save(deletion.idea);
        }
        else {
            deletion.idea.status = user_enums_1.IdeaStatus.PENDING_REVIEW;
            await this.ideaRepository.save(deletion.idea);
        }
        return this.aiDeletionRepository.save(deletion);
    }
    async generatePdf(id) {
        const idea = await this.findById(id);
        if (!idea.aiSummary)
            throw new common_1.BadRequestException('Resumo por IA não disponível');
        return this.pdfService.generateIdeaPdf({
            idea,
            author: idea.author,
            summary: idea.aiSummary,
            strengths: idea.aiStrengths,
            weaknesses: idea.aiWeaknesses,
            developmentWays: idea.aiDevelopment,
        });
    }
    async delete(id, userId, userRole) {
        const idea = await this.findById(id);
        if (idea.authorId !== userId && userRole !== user_enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Não autorizado a excluir esta ideia');
        }
        await this.ideaRepository.remove(idea);
    }
};
exports.IdeasService = IdeasService;
exports.IdeasService = IdeasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(idea_entity_1.Idea)),
    __param(1, (0, typeorm_1.InjectRepository)(idea_entity_1.Feedback)),
    __param(2, (0, typeorm_1.InjectRepository)(idea_entity_1.AIDeletion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService,
        pdf_service_1.PdfService])
], IdeasService);
//# sourceMappingURL=ideas.service.js.map