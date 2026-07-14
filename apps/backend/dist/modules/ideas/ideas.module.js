"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ideas_controller_1 = require("./ideas.controller");
const ideas_service_1 = require("./ideas.service");
const idea_entity_1 = require("./idea.entity");
const idea_entity_2 = require("./idea.entity");
const idea_entity_3 = require("./idea.entity");
const users_module_1 = require("../users/users.module");
const ai_module_1 = require("../ai/ai.module");
const pdf_module_1 = require("../pdf/pdf.module");
let IdeasModule = class IdeasModule {
};
exports.IdeasModule = IdeasModule;
exports.IdeasModule = IdeasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([idea_entity_1.Idea, idea_entity_2.Feedback, idea_entity_3.AIDeletion]),
            users_module_1.UsersModule,
            ai_module_1.AiModule,
            pdf_module_1.PdfModule,
        ],
        controllers: [ideas_controller_1.IdeasController],
        providers: [ideas_service_1.IdeasService],
        exports: [ideas_service_1.IdeasService],
    })
], IdeasModule);
//# sourceMappingURL=ideas.module.js.map