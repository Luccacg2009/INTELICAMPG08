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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const feedback_service_1 = require("./feedback.service");
const feedback_dto_1 = require("./dto/feedback.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../users/user.entity");
const user_enums_1 = require("../../common/enums/user.enums");
let FeedbackController = class FeedbackController {
    feedbackService;
    constructor(feedbackService) {
        this.feedbackService = feedbackService;
    }
    async createFeedback(ideaId, dto, user) {
        return this.feedbackService.create(ideaId, dto, user);
    }
    async getFeedbacksByIdea(ideaId) {
        return this.feedbackService.findByIdea(ideaId);
    }
    async getMyFeedbacks(user) {
        return this.feedbackService.findByAuthor(user.id);
    }
    async getStats(ideaId) {
        return this.feedbackService.getFeedbackStats(ideaId);
    }
    async sendToAdmin(ideaId, user) {
        return this.feedbackService.sendToAdmin(ideaId, user.id);
    }
    async sendToVertical(ideaId, user) {
        return this.feedbackService.sendToVertical(ideaId, user.id);
    }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, common_1.Post)('idea/:ideaId'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST),
    (0, swagger_1.ApiOperation)({ summary: 'Dar feedback em uma ideia (apenas Analistas)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: feedback_dto_1.FeedbackResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Não autorizado ou já deu feedback' }),
    __param(0, (0, common_1.Param)('ideaId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, feedback_dto_1.CreateFeedbackDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "createFeedback", null);
__decorate([
    (0, common_1.Get)('idea/:ideaId'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Listar feedbacks de uma ideia' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [feedback_dto_1.FeedbackResponseDto] }),
    __param(0, (0, common_1.Param)('ideaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "getFeedbacksByIdea", null);
__decorate([
    (0, common_1.Get)('my-feedbacks'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST),
    (0, swagger_1.ApiOperation)({ summary: 'Listar meus feedbacks' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [feedback_dto_1.FeedbackResponseDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "getMyFeedbacks", null);
__decorate([
    (0, common_1.Get)('idea/:ideaId/stats'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Estatísticas de feedback de uma ideia' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('ideaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('idea/:ideaId/send-to-admin'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar feedbacks para administrador' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('ideaId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "sendToAdmin", null);
__decorate([
    (0, common_1.Post)('idea/:ideaId/send-to-vertical'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar feedbacks para vertical responsável' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('ideaId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], FeedbackController.prototype, "sendToVertical", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, swagger_1.ApiTags)('feedback'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [feedback_service_1.FeedbackService])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map