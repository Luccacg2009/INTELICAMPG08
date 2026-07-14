import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

export interface IdeaSummary {
  summary: string;
  strengths: string;
  weaknesses: string;
  developmentWays: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;
  private promptTemplate: string;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
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
- Valores da empresa: Inovação, Sustentabilidade, Ética, Foco no Cliente, Excelência

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

  async generateSummary(ideaData: {
    title: string;
    vertical: string;
    description: string;
    targetAudience: string;
    motivation?: string;
    launchLocation?: string;
    authorName: string;
  }): Promise<IdeaSummary> {
    const prompt = this.promptTemplate
      .replace('{title}', ideaData.title)
      .replace('{vertical}', ideaData.vertical)
      .replace('{description}', ideaData.description)
      .replace('{targetAudience}', ideaData.targetAudience)
      .replace('{motivation}', ideaData.motivation || 'Não informado')
      .replace('{launchLocation}', ideaData.launchLocation || 'Não informado')
      .replace('{authorName}', ideaData.authorName);

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
      if (!response) throw new BadRequestException('Resposta vazia da IA');

      const parsed = JSON.parse(response);
      
      if (parsed.violatesValues) {
        throw new BadRequestException(`Ideia viola valores da empresa: ${parsed.violationReason}`);
      }

      return {
        summary: parsed.summary,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        developmentWays: parsed.developmentWays,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Resposta inválida da IA');
      }
      throw error;
    }
  }

  async checkCompanyValues(ideaData: any): Promise<{ violates: boolean; reason?: string }> {
    const prompt = `
Verifique se a seguinte ideia fere algum dos valores da empresa azul:
Valores: Inovação, Sustentabilidade, Ética, Foco no Cliente, Excelência

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
}