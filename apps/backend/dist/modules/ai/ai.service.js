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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
const verticals_service_1 = require("../verticals/verticals.service");
let AiService = class AiService {
    configService;
    verticalsService;
    openai;
    promptTemplate;
    constructor(configService, verticalsService) {
        this.configService = configService;
        this.verticalsService = verticalsService;
        this.openai = new openai_1.OpenAI({
            apiKey: this.configService.get('OPENAI_API_KEY'),
        });
        this.promptTemplate = `
Você é um analista sênior de produtos da empresa azul. Sua tarefa é criar um resumo executivo formal e estruturado da ideia de produto abaixo.

DADOS DA IDEIA:
- Título: {title}
- Vertical responsável: {vertical}
- Ideia central: {description}
- Público-alvo: {targetAudience}
- Motivação: {motivation}
- Local de lançamento: {launchLocation}
- Autor: {authorName}
- Valores da empresa: {companyValues}

INSTRUÇÕES:
1. Use vocabulário formal e corporativo
2. NÃO crie um produto do zero - apenas analise a ideia apresentada
3. Identifique pontos fortes, pontos fracos e formas de desenvolvimento
4. Verifique se a ideia fere os valores da empresa
5. Retorne APENAS um JSON válido com os campos: summary, strengths, weaknesses, developmentWays, violatesValues (boolean), violationReason (string, opcional)
6. O campo summary deve ser um resumo detalhado de 3-5 parágrafos
7. Os campos strengths, weaknesses, developmentWays devem ser listas em formato texto (bullet points)

RETORNO ESPERADO:
{
  "summary": "string",
  "strengths": "string",
  "weaknesses": "string", 
  "developmentWays": "string",
  "violatesValues": false,
  "violationReason": "string ou null"
}
`;
    }
    async getCompanyValues() {
        const values = await this.verticalsService.getCompanyValues();
        return values.map(v => v.name).join(', ');
    }
    async generateSummary(ideaData) {
        const companyValues = await this.getCompanyValues();
        const prompt = this.promptTemplate
            .replace('{title}', ideaData.title)
            .replace('{vertical}', ideaData.vertical)
            .replace('{description}', ideaData.description)
            .replace('{targetAudience}', ideaData.targetAudience)
            .replace('{motivation}', ideaData.motivation || 'Não informado')
            .replace('{launchLocation}', ideaData.launchLocation || 'Não informado')
            .replace('{authorName}', ideaData.authorName)
            .replace('{companyValues}', companyValues);
        try {
            const completion = await this.openai.chat.completions.create({
                model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: 'Você é um analista sênior de produtos. Responda APENAS com JSON válido.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 3000,
                response_format: { type: 'json_object' },
            });
            const response = completion.choices[0]?.message?.content;
            if (!response)
                throw new common_1.BadRequestException('Resposta vazia da IA');
            const parsed = JSON.parse(response);
            if (parsed.violatesValues) {
                throw new common_1.BadRequestException(`Ideia viola valores da empresa: ${parsed.violationReason}`);
            }
            return {
                summary: parsed.summary,
                strengths: parsed.strengths,
                weaknesses: parsed.weaknesses,
                developmentWays: parsed.developmentWays,
            };
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw new common_1.BadRequestException('Resposta inválida da IA');
            }
            throw error;
        }
    }
    async checkCompanyValues(ideaData) {
        const companyValues = await this.getCompanyValues();
        const prompt = `
Verifique se a seguinte ideia fere algum dos valores da empresa azul:
Valores: ${companyValues}

Ideia: ${ideaData.title}
Descrição: ${ideaData.description}
Vertical: ${ideaData.vertical}

Responda APENAS com JSON: {"violates": boolean, "reason": "string ou null"}
`;
        const completion = await this.openai.chat.completions.create({
            model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });
        return JSON.parse(completion.choices[0]?.message?.content || '{"violates": false, "reason": null}');
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        verticals_service_1.VerticalsService])
], AiService);
//# sourceMappingURL=ai.service.js.map