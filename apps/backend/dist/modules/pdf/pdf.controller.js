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
exports.PdfController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pdf_service_1 = require("./pdf.service");
const ideas_service_1 = require("../ideas/ideas.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../users/user.entity");
let PdfController = class PdfController {
    pdfService;
    ideasService;
    constructor(pdfService, ideasService) {
        this.pdfService = pdfService;
        this.ideasService = ideasService;
    }
    async generateIdeaPdf(id, res, user) {
        const idea = await this.ideasService.findById(id);
        if (!idea.aiSummary || !idea.aiStrengths || !idea.aiWeaknesses || !idea.aiDevelopment) {
            return res.status(400).json({ message: 'Resumo por IA não disponível para esta ideia' });
        }
        const pdfBuffer = await this.pdfService.generateIdeaPdf({
            idea,
            author: idea.author,
            summary: idea.aiSummary,
            strengths: idea.aiStrengths,
            weaknesses: idea.aiWeaknesses,
            developmentWays: idea.aiDevelopment,
        });
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ideia-${idea.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    }
};
exports.PdfController = PdfController;
__decorate([
    (0, common_1.Get)('idea/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar e baixar PDF da ideia' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF gerado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ideia não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "generateIdeaPdf", null);
exports.PdfController = PdfController = __decorate([
    (0, swagger_1.ApiTags)('pdf'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('pdf'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pdf_service_1.PdfService,
        ideas_service_1.IdeasService])
], PdfController);
//# sourceMappingURL=pdf.controller.js.map