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
exports.VerticalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vertical_config_entity_1 = require("./vertical-config.entity");
const vertical_config_entity_2 = require("./vertical-config.entity");
const user_enums_1 = require("../../common/enums/user.enums");
let VerticalsService = class VerticalsService {
    verticalRepository;
    valueRepository;
    constructor(verticalRepository, valueRepository) {
        this.verticalRepository = verticalRepository;
        this.valueRepository = valueRepository;
    }
    async initializeDefaults() {
        const verticals = Object.values(user_enums_1.UserVertical).filter(v => v !== user_enums_1.UserVertical.OTHER);
        for (const vertical of verticals) {
            const exists = await this.verticalRepository.findOne({ where: { vertical } });
            if (!exists) {
                await this.verticalRepository.save(this.verticalRepository.create({
                    vertical,
                    name: vertical.charAt(0) + vertical.slice(1).toLowerCase(),
                    values: [],
                    isActive: true,
                }));
            }
        }
        const defaultValues = [
            { name: 'Inovação', description: 'Busca constante por novas soluções e melhorias' },
            { name: 'Sustentabilidade', description: 'Compromisso com impacto ambiental positivo' },
            { name: 'Ética', description: 'Conduta íntegra e transparente em todas as ações' },
            { name: 'Foco no Cliente', description: 'Decisões baseadas nas necessidades do cliente' },
            { name: 'Excelência', description: 'Busca pela qualidade superior em tudo que fazemos' },
        ];
        for (const val of defaultValues) {
            const exists = await this.valueRepository.findOne({ where: { name: val.name } });
            if (!exists) {
                await this.valueRepository.save(this.valueRepository.create(val));
            }
        }
    }
    async getVerticals() {
        return this.verticalRepository.find({ where: { isActive: true }, order: { name: 'ASC' } });
    }
    async getVertical(vertical) {
        const config = await this.verticalRepository.findOne({ where: { vertical, isActive: true } });
        if (!config)
            throw new common_1.NotFoundException('Vertical não encontrada');
        return config;
    }
    async updateVertical(vertical, data) {
        const config = await this.getVertical(vertical);
        Object.assign(config, data);
        return this.verticalRepository.save(config);
    }
    async getCompanyValues() {
        return this.valueRepository.find({ where: { isActive: true }, order: { name: 'ASC' } });
    }
    async createValue(data) {
        const value = this.valueRepository.create(data);
        return this.valueRepository.save(value);
    }
    async updateValue(id, data) {
        const value = await this.valueRepository.findOne({ where: { id } });
        if (!value)
            throw new common_1.NotFoundException('Valor não encontrado');
        Object.assign(value, data);
        return this.valueRepository.save(value);
    }
    async deleteValue(id) {
        await this.valueRepository.delete(id);
    }
};
exports.VerticalsService = VerticalsService;
exports.VerticalsService = VerticalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vertical_config_entity_1.VerticalConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(vertical_config_entity_2.CompanyValue)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], VerticalsService);
//# sourceMappingURL=verticals.service.js.map