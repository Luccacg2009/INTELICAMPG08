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
exports.FeedbackResponseDto = exports.CreateFeedbackDto = exports.FeedbackType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["POSITIVE"] = "POSITIVE";
    FeedbackType["NEGATIVE"] = "NEGATIVE";
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
class CreateFeedbackDto {
    type;
    content;
    marketingSuggestions;
    negativeReason;
}
exports.CreateFeedbackDto = CreateFeedbackDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FeedbackType, example: FeedbackType.POSITIVE }),
    (0, class_validator_1.IsEnum)(FeedbackType),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A ideia tem grande potencial de mercado...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sugiro campanha no Instagram...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "marketingSuggestions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Não atende público-alvo...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "negativeReason", void 0);
class FeedbackResponseDto {
    id;
    ideaId;
    ideaTitle;
    authorId;
    authorName;
    type;
    content;
    marketingSuggestions;
    negativeReason;
    sentToAdmin;
    sentToVertical;
    createdAt;
}
exports.FeedbackResponseDto = FeedbackResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "ideaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "ideaTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "authorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FeedbackType }),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "marketingSuggestions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], FeedbackResponseDto.prototype, "negativeReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], FeedbackResponseDto.prototype, "sentToAdmin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], FeedbackResponseDto.prototype, "sentToVertical", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], FeedbackResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=feedback.dto.js.map