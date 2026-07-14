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
exports.VerticalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const verticals_service_1 = require("./verticals.service");
const vertical_config_entity_1 = require("./vertical-config.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_enums_1 = require("../../common/enums/user.enums");
let VerticalsController = class VerticalsController {
    verticalsService;
    constructor(verticalsService) {
        this.verticalsService = verticalsService;
    }
    async getVerticals() {
        return this.verticalsService.getVerticals();
    }
    async getVertical(vertical) {
        return this.verticalsService.getVertical(vertical);
    }
    async updateVertical(vertical, data) {
        return this.verticalsService.updateVertical(vertical, data);
    }
    async getValues() {
        return this.verticalsService.getCompanyValues();
    }
    async createValue(data) {
        return this.verticalsService.createValue(data);
    }
    async updateValue(id, data) {
        return this.verticalsService.updateValue(id, data);
    }
    async deleteValue(id) {
        await this.verticalsService.deleteValue(id);
    }
};
exports.VerticalsController = VerticalsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.VERTICAL_LEAD, user_enums_1.UserRole.ANALYST),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as verticais' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [vertical_config_entity_1.VerticalConfig] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerticalsController.prototype, "getVerticals", null);
__decorate([
    (0, common_1.Get)(':vertical'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.VERTICAL_LEAD, user_enums_1.UserRole.ANALYST),
    (0, swagger_1.ApiOperation)({ summary: 'Obter configuração de uma vertical' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: vertical_config_entity_1.VerticalConfig }),
    __param(0, (0, common_1.Param)('vertical')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerticalsController.prototype, "getVertical", null);
__decorate([
    (0, common_1.Put)(':vertical'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar configuração de vertical (apenas Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: vertical_config_entity_1.VerticalConfig }),
    __param(0, (0, common_1.Param)('vertical')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VerticalsController.prototype, "updateVertical", null);
__decorate([
    (0, common_1.Get)('values/all'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.VERTICAL_LEAD, user_enums_1.UserRole.ANALYST),
    (0, swagger_1.ApiOperation)({ summary: 'Listar valores da empresa' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [vertical_config_entity_1.CompanyValue] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerticalsController.prototype, "getValues", null);
__decorate([
    (0, common_1.Post)('values'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo valor da empresa (apenas Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: vertical_config_entity_1.CompanyValue }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VerticalsController.prototype, "createValue", null);
__decorate([
    (0, common_1.Put)('values/:id'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar valor da empresa (apenas Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: vertical_config_entity_1.CompanyValue }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VerticalsController.prototype, "updateValue", null);
__decorate([
    (0, common_1.Delete)('values/:id'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Deletar valor da empresa (apenas Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerticalsController.prototype, "deleteValue", null);
exports.VerticalsController = VerticalsController = __decorate([
    (0, swagger_1.ApiTags)('verticals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('verticals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [verticals_service_1.VerticalsService])
], VerticalsController);
//# sourceMappingURL=verticals.controller.js.map