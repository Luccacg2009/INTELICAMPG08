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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("./user.entity");
const refresh_token_entity_1 = require("./refresh-token.entity");
const user_enums_1 = require("../../common/enums/user.enums");
let UsersService = class UsersService {
    userRepository;
    refreshTokenRepository;
    constructor(userRepository, refreshTokenRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }
    async create(dto) {
        const userData = {
            email: dto.email,
            passwordHash: dto.passwordHash,
            name: dto.name,
            role: (dto.role || user_enums_1.UserRole.PARTICIPANT),
            vertical: (dto.vertical || user_enums_1.UserVertical.MARKETING),
        };
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
    async findById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async findAll() {
        return this.userRepository.find({ order: { createdAt: 'DESC' } });
    }
    async findByVertical(vertical) {
        return this.userRepository.find({ where: { vertical }, order: { name: 'ASC' } });
    }
    async updateRefreshToken(userId, refreshToken) {
        const existing = await this.refreshTokenRepository.findOne({ where: { userId } });
        if (existing) {
            await this.refreshTokenRepository.remove(existing);
        }
        if (refreshToken) {
            const hashed = await bcrypt.hash(refreshToken, 10);
            const token = this.refreshTokenRepository.create({
                token: hashed,
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            await this.refreshTokenRepository.save(token);
        }
    }
    async updateLastLogin(userId) {
        await this.userRepository.update(userId, { lastLoginAt: new Date() });
    }
    async update(userId, data) {
        await this.userRepository.update(userId, data);
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        return user;
    }
    async deactivate(userId) {
        await this.userRepository.update(userId, { isActive: false });
    }
    async validateRefreshToken(userId, refreshToken) {
        const tokenRecord = await this.refreshTokenRepository.findOne({ where: { userId } });
        if (!tokenRecord)
            return false;
        return bcrypt.compare(refreshToken, tokenRecord.token);
    }
    async getAnalysts() {
        return this.userRepository.find({ where: { role: user_enums_1.UserRole.ANALYST }, order: { name: 'ASC' } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map