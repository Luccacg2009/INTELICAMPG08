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
exports.IdeasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ideas_service_1 = require("./ideas.service");
const idea_dto_1 = require("./dto/idea.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../users/user.entity");
const user_enums_1 = require("../../common/enums/user.enums");
let IdeasController = class IdeasController {
    ideasService;
    constructor(ideasService) {
        this.ideasService = ideasService;
    }
    async create(dto, user) {
        return this.ideasService.create(dto, user.id);
    }
    async findAll(query) {
        return this.ideasService.findAll(query);
    }
    async findMyIdeas(user) {
        return this.ideasService.findByAuthor(user.id);
    }
    async findByVertical(vertical) {
        return this.ideasService.findByVertical(vertical);
    }
    async findOne(id, user) {
        const idea = await this.ideasService.findById(id);
        if (idea.authorId !== user.id && user.role !== user_enums_1.UserRole.ANALYST && user.role !== user_enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Não autorizado a ver esta ideia');
        }
        return idea;
    }
    async update(id, dto, user) {
        return this.ideasService.update(id, dto, user.id, user.role);
    }
    async review(id, dto, user) {
        return this.ideasService.review(id, dto, user.id);
    }
    async generateAiSummary(id) {
        const idea = await this.ideasService.findById(id);
        await this.ideasService['generateAiSummary'](idea);
        return this.ideasService.findById(id);
    }
    async requestAiDeletion(id, dto, user) {
        return this.ideasService.requestAiDeletion(id, dto, user.id);
    }
    async reviewAiDeletion(id, dto, user) {
        return this.ideasService.reviewAiDeletion(id, dto.status, user.id);
    }
    async downloadPdf(id, res, user) {
        const pdfBuffer = await this.ideasService.generatePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ideia-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    }
    async remove(id, user) {
        await this.ideasService.delete(id, user.id, user.role);
    }
};
exports.IdeasController = IdeasController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.PARTICIPANT, user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova ideia de produto' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ideia criada com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [idea_dto_1.CreateIdeaDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as ideias (analistas e admins)' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [idea_dto_1.IdeaListQueryDto]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-ideas'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.PARTICIPANT, user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Listar minhas ideias' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "findMyIdeas", null);
__decorate([
    (0, common_1.Get)('vertical/:vertical'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Listar ideias por vertical' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('vertical')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "findByVertical", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.PARTICIPANT, user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes de uma ideia' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.PARTICIPANT, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar ideia (apenas se pendente)' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, idea_dto_1.UpdateIdeaDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Revisar ideia (aprovar/rejeitar) - Analistas e Admins' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, idea_dto_1.ReviewIdeaDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "review", null);
__decorate([
    (0, common_1.Post)(':id/ai-summary'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar/Atualizar resumo por IA' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "generateAiSummary", null);
__decorate([
    (0, common_1.Post)(':id/ai-deletion'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar exclusão da ideia pela IA (apenas Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, idea_dto_1.RequestAIDeletionDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "requestAiDeletion", null);
__decorate([
    (0, common_1.Patch)(':id/ai-deletion/review'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Aprovar/Rejeitar exclusão por IA (apenas Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "reviewAiDeletion", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ANALYST, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Baixar PDF da ideia' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF gerado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.PARTICIPANT, user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir ideia (autor ou admin)' }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], IdeasController.prototype, "remove", null);
exports.IdeasController = IdeasController = __decorate([
    (0, swagger_1.ApiTags)('ideas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ideas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ideas_service_1.IdeasService])
], IdeasController);
//# sourceMappingURL=ideas.controller.js.map