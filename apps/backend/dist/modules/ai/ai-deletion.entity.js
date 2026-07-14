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
exports.AIDeletion = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const idea_entity_1 = require("../ideas/idea.entity");
const user_enums_1 = require("../../common/enums/user.enums");
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
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], AIDeletion.prototype, "ideaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => idea_entity_1.Idea, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ideaId' }),
    __metadata("design:type", idea_entity_1.Idea)
], AIDeletion.prototype, "idea", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AIDeletion.prototype, "requesterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'requesterId' }),
    __metadata("design:type", user_entity_1.User)
], AIDeletion.prototype, "requester", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AIDeletion.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_enums_1.AIDeletionStatus, default: user_enums_1.AIDeletionStatus.PENDING }),
    __metadata("design:type", String)
], AIDeletion.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], AIDeletion.prototype, "reviewedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewedById' }),
    __metadata("design:type", Object)
], AIDeletion.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], AIDeletion.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AIDeletion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AIDeletion.prototype, "updatedAt", void 0);
exports.AIDeletion = AIDeletion = __decorate([
    (0, typeorm_1.Entity)('ai_deletions'),
    (0, typeorm_1.Index)(['status'])
], AIDeletion);
//# sourceMappingURL=ai-deletion.entity.js.map