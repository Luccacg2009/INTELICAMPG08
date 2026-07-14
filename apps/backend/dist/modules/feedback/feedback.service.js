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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const idea_entity_1 = require("../ideas/idea.entity");
const idea_entity_2 = require("../ideas/idea.entity");
let FeedbackService = class FeedbackService {
    feedbackRepository;
    ideaRepository;
    constructor(feedbackRepository, ideaRepository) {
        this.feedbackRepository = feedbackRepository;
        this.ideaRepository = ideaRepository;
    }
    async create(ideaId, dto, author) {
        const idea = await this.ideaRepository.findOne({ where: { id: ideaId }, relations: ['author'] });
        if (!idea)
            throw new common_1.NotFoundException('Ideia não encontrada');
        if (idea.authorId === author.id) {
            throw new common_1.ForbiddenException('Não pode dar feedback na própria ideia');
        }
        const existing = await this.feedbackRepository.findOne({ where: { ideaId, authorId: author.id } });
        if (existing) {
            throw new common_1.ForbiddenException('Você já deu feedback para esta ideia');
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
    async findByIdea(ideaId) {
        return this.feedbackRepository.find({
            where: { ideaId },
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByAuthor(authorId) {
        return this.feedbackRepository.find({
            where: { authorId },
            relations: ['idea', 'idea.author'],
            order: { createdAt: 'DESC' },
        });
    }
    async getFeedbackStats(ideaId) {
        const [positive, negative] = await Promise.all([
            this.feedbackRepository.count({ where: { ideaId, type: 'POSITIVE' } }),
            this.feedbackRepository.count({ where: { ideaId, type: 'NEGATIVE' } }),
        ]);
        return { positive, negative };
    }
    async sendToAdmin(ideaId, adminId) {
        const feedbacks = await this.feedbackRepository.find({
            where: { ideaId, sentToAdmin: false },
        });
        for (const f of feedbacks) {
            f.sentToAdmin = true;
        }
        return this.feedbackRepository.save(feedbacks);
    }
    async sendToVertical(ideaId, verticalLeadId) {
        const feedbacks = await this.feedbackRepository.find({
            where: { ideaId, sentToVertical: false },
        });
        for (const f of feedbacks) {
            f.sentToVertical = true;
        }
        return this.feedbackRepository.save(feedbacks);
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(idea_entity_1.Feedback)),
    __param(1, (0, typeorm_1.InjectRepository)(idea_entity_2.Idea)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map