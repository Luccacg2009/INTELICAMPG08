"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const vertical_config_entity_1 = require("./vertical-config.entity");
const verticals_controller_1 = require("./verticals.controller");
const verticals_service_1 = require("./verticals.service");
let VerticalsModule = class VerticalsModule {
};
exports.VerticalsModule = VerticalsModule;
exports.VerticalsModule = VerticalsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vertical_config_entity_1.VerticalConfig, vertical_config_entity_1.CompanyValue])],
        controllers: [verticals_controller_1.VerticalsController],
        providers: [verticals_service_1.VerticalsService],
        exports: [verticals_service_1.VerticalsService],
    })
], VerticalsModule);
//# sourceMappingURL=verticals.module.js.map