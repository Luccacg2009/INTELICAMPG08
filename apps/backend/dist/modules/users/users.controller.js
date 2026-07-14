"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const users_dto_1 = require("./dto/users.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("./user.entity");
const user_enums_1 = require("../../common/enums/user.enums");
const bcrypt = __importStar(require("bcryptjs"));
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(dto) {
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.usersService.create({
            email: dto.email,
            passwordHash,
            name: dto.name,
            role: dto.role || user_enums_1.UserRole.PARTICIPANT,
            vertical: dto.vertical || user_enums_1.UserVertical.MARKETING,
        });
        return this.toResponse(user);
    }
    async findAll() {
        const users = await this.usersService.findAll();
        return users.map(this.toResponse);
    }
    async getAnalysts() {
        const users = await this.usersService.getAnalysts();
        return users.map(this.toResponse);
    }
    async findByVertical(vertical) {
        const users = await this.usersService.findByVertical(vertical);
        return users.map(this.toResponse);
    }
    async getProfile(user) {
        return this.toResponse(user);
    }
    async findOne(id) {
        const user = await this.usersService.findById(id);
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        return this.toResponse(user);
    }
    async update(id, dto) {
        const user = await this.usersService.update(id, dto);
        return this.toResponse(user);
    }
    async remove(id) {
        await this.usersService.deactivate(id);
    }
    toResponse(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            vertical: user.vertical,
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo usuário (apenas admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: users_dto_1.UserResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os usuários (apenas admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [users_dto_1.UserResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('analysts'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Listar analistas ativos' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [users_dto_1.UserResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAnalysts", null);
__decorate([
    (0, common_1.Get)('vertical/:vertical'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Listar usuários por vertical' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [users_dto_1.UserResponseDto] }),
    __param(0, (0, common_1.Param)('vertical')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findByVertical", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter perfil do usuário logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Obter usuário por ID (apenas admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar usuário (apenas admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: users_dto_1.UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Desativar usuário (apenas admin)' }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map