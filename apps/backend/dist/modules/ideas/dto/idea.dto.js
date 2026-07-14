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
exports.IdeaResponseDto = exports.IdeaListQueryDto = exports.ReviewAIDeletionDto = exports.RequestAIDeletionDto = exports.ReviewIdeaDto = exports.UpdateIdeaDto = exports.CreateIdeaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const user_enums_1 = require("../../../common/enums/user.enums");
class CreateIdeaDto {
    title;
    description;
    vertical;
    targetAudience;
    motivation;
    launchLocation;
}
exports.CreateIdeaDto = CreateIdeaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'App de Delivery Sustentável' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Aplicativo que conecta restaurantes com embalagens ecológicas...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_enums_1.UserVertical, example: user_enums_1.UserVertical.MARKETING }),
    (0, class_validator_1.IsEnum)(user_enums_1.UserVertical),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "vertical", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Restaurantes conscientes e consumidores eco-friendly' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Identifiquei demanda crescente por sustentabilidade...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "motivation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'São Paulo - SP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "launchLocation", void 0);
class UpdateIdeaDto {
    title;
    description;
    vertical;
    targetAudience;
    motivation;
    launchLocation;
}
exports.UpdateIdeaDto = UpdateIdeaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateIdeaDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    __metadata("design:type", String)
], UpdateIdeaDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: user_enums_1.UserVertical }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_enums_1.UserVertical),
    __metadata("design:type", String)
], UpdateIdeaDto.prototype, "vertical", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], UpdateIdeaDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateIdeaDto.prototype, "motivation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateIdeaDto.prototype, "launchLocation", void 0);
class ReviewIdeaDto {
    status;
    strengths;
    weaknesses;
    developmentWays;
}
exports.ReviewIdeaDto = ReviewIdeaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_enums_1.IdeaStatus, example: user_enums_1.IdeaStatus.APPROVED }),
    (0, class_validator_1.IsEnum)(user_enums_1.IdeaStatus),
    (0, class_validator_1.IsIn)([user_enums_1.IdeaStatus.APPROVED, user_enums_1.IdeaStatus.REJECTED, user_enums_1.IdeaStatus.UNDER_REVIEW]),
    __metadata("design:type", String)
], ReviewIdeaDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewIdeaDto.prototype, "strengths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewIdeaDto.prototype, "weaknesses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewIdeaDto.prototype, "developmentWays", void 0);
class RequestAIDeletionDto {
    reason;
}
exports.RequestAIDeletionDto = RequestAIDeletionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ideia viola política de sustentabilidade da empresa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], RequestAIDeletionDto.prototype, "reason", void 0);
class ReviewAIDeletionDto {
    status;
}
exports.ReviewAIDeletionDto = ReviewAIDeletionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['APPROVED', 'REJECTED'] }),
    (0, class_validator_1.IsIn)(['APPROVED', 'REJECTED']),
    __metadata("design:type", String)
], ReviewAIDeletionDto.prototype, "status", void 0);
class IdeaListQueryDto {
    status;
    vertical;
    authorId;
    page;
    limit;
}
exports.IdeaListQueryDto = IdeaListQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdeaListQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdeaListQueryDto.prototype, "vertical", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdeaListQueryDto.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdeaListQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IdeaListQueryDto.prototype, "limit", void 0);
class IdeaResponseDto {
    id;
    title;
    description;
    vertical;
    targetAudience;
    motivation;
    launchLocation;
    status;
    authorId;
    authorName;
    authorVertical;
    strengths;
    weaknesses;
    developmentWays;
    aiSummary;
    aiStrengths;
    aiWeaknesses;
    aiDevelopment;
    pdfUrl;
    createdAt;
    updatedAt;
    reviewedAt;
    reviewedByName;
}
exports.IdeaResponseDto = IdeaResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_enums_1.UserVertical }),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "vertical", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "motivation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "launchLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_enums_1.IdeaStatus }),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "authorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "authorVertical", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "strengths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "weaknesses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "developmentWays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "aiSummary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "aiStrengths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "aiWeaknesses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "aiDevelopment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "pdfUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], IdeaResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], IdeaResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], IdeaResponseDto.prototype, "reviewedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], IdeaResponseDto.prototype, "reviewedByName", void 0);
//# sourceMappingURL=idea.dto.js.map