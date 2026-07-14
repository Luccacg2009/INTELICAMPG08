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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIDeletion = exports.Feedback = exports.Idea = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const user_enums_1 = require("../../common/enums/user.enums");
let Idea = class Idea {
    id;
    title;
    description;
    vertical;
    targetAudience;
    motivation;
    launchLocation;
    status;
    strengths;
    weaknesses;
    developmentWays;
    aiSummary;
    aiStrengths;
    aiWeaknesses;
    aiDevelopment;
    pdfUrl;
    aiGeneratedAt;
    authorId;
    author;
    reviewedById;
    reviewedBy;
    reviewedAt;
    feedbacks;
    aiDeletion;
    createdAt;
    updatedAt;
};
exports.Idea = Idea;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Idea.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Idea.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Idea.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_enums_1.UserVertical }),
    __metadata("design:type", String)
], Idea.prototype, "vertical", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Idea.prototype, "targetAudience", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Idea.prototype, "motivation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Idea.prototype, "launchLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_enums_1.IdeaStatus, default: user_enums_1.IdeaStatus.PENDING_REVIEW }),
    __metadata("design:type", String)
], Idea.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Idea.prototype, "strengths", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Idea.prototype, "weaknesses", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Idea.prototype, "developmentWays", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true, name: 'ai_summary' }),
    __metadata("design:type", String)
], Idea.prototype, "aiSummary", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true, name: 'ai_strengths' }),
    __metadata("design:type", String)
], Idea.prototype, "aiStrengths", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true, name: 'ai_weaknesses' }),
    __metadata("design:type", String)
], Idea.prototype, "aiWeaknesses", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true, name: 'ai_development' }),
    __metadata("design:type", String)
], Idea.prototype, "aiDevelopment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'pdf_url' }),
    __metadata("design:type", String)
], Idea.prototype, "pdfUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'ai_generated_at' }),
    __metadata("design:type", Date)
], Idea.prototype, "aiGeneratedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'author_id' }),
    __metadata("design:type", String)
], Idea.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.ideas, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'author_id' }),
    __metadata("design:type", user_entity_1.User)
], Idea.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'reviewed_by_id' }),
    __metadata("design:type", String)
], Idea.prototype, "reviewedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewed_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Idea.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'reviewed_at' }),
    __metadata("design:type", Date)
], Idea.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Feedback, feedback => feedback.idea),
    __metadata("design:type", Array)
], Idea.prototype, "feedbacks", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => AIDeletion, deletion => deletion.idea),
    __metadata("design:type", AIDeletion)
], Idea.prototype, "aiDeletion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Idea.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Idea.prototype, "updatedAt", void 0);
exports.Idea = Idea = __decorate([
    (0, typeorm_1.Entity)('ideas'),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['vertical']),
    (0, typeorm_1.Index)(['authorId'])
], Idea);
let Feedback = class Feedback {
    id;
    ideaId;
    idea;
    authorId;
    author;
    type;
    content;
    marketingSuggestions;
    negativeReason;
    sentToAdmin;
    sentToVertical;
    createdAt;
    updatedAt;
};
exports.Feedback = Feedback;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Feedback.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'idea_id' }),
    __metadata("design:type", String)
], Feedback.prototype, "ideaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Idea, idea => idea.feedbacks, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'idea_id' }),
    __metadata("design:type", Idea)
], Feedback.prototype, "idea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'author_id' }),
    __metadata("design:type", String)
], Feedback.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'author_id' }),
    __metadata("design:type", user_entity_1.User)
], Feedback.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['POSITIVE', 'NEGATIVE'] }),
    __metadata("design:type", String)
], Feedback.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Feedback.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true, name: 'marketing_suggestions' }),
    __metadata("design:type", String)
], Feedback.prototype, "marketingSuggestions", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true, name: 'negative_reason' }),
    __metadata("design:type", String)
], Feedback.prototype, "negativeReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'sent_to_admin' }),
    __metadata("design:type", Boolean)
], Feedback.prototype, "sentToAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'sent_to_vertical' }),
    __metadata("design:type", Boolean)
], Feedback.prototype, "sentToVertical", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Feedback.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Feedback.prototype, "updatedAt", void 0);
exports.Feedback = Feedback = __decorate([
    (0, typeorm_1.Entity)('feedbacks'),
    (0, typeorm_1.Index)(['ideaId']),
    (0, typeorm_1.Index)(['authorId'])
], Feedback);
let AIDeletion = class AIDeletion {
    id;
    ideaId;
    idea;
    requesterId;
    requester;
    reason;
    status;
    reviewedById;
    reviewedBy;
    reviewedAt;
    createdAt;
    updatedAt;
};
exports.AIDeletion = AIDeletion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AIDeletion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, name: 'idea_id' }),
    __metadata("design:type", String)
], AIDeletion.prototype, "ideaId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Idea, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'idea_id' }),
    __metadata("design:type", Idea)
], AIDeletion.prototype, "idea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requester_id' }),
    __metadata("design:type", String)
], AIDeletion.prototype, "requesterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'requester_id' }),
    __metadata("design:type", user_entity_1.User)
], AIDeletion.prototype, "requester", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], AIDeletion.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED'], default: 'PENDING' }),
    __metadata("design:type", String)
], AIDeletion.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'reviewed_by_id' }),
    __metadata("design:type", String)
], AIDeletion.prototype, "reviewedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewed_by_id' }),
    __metadata("design:type", user_entity_1.User)
], AIDeletion.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'reviewed_at' }),
    __metadata("design:type", Date)
], AIDeletion.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AIDeletion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AIDeletion.prototype, "updatedAt", void 0);
exports.AIDeletion = AIDeletion = __decorate([
    (0, typeorm_1.Entity)('ai_deletions'),
    (0, typeorm_1.Index)(['status'])
], AIDeletion);
//# sourceMappingURL=idea.entity.js.map