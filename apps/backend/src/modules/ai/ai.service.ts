import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIConversation } from './ai-conversation.entity';
import { AIMessage } from './ai-message.entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { ConfigService } from '@nestjs/config';
import { ProjectsService } from '../projects/projects.service';

interface AIResponse {
  message: string;
  tokensUsed: number;
}

@Injectable()
export class AIService {
  constructor(
    @InjectRepository(AIConversation)
    private conversationRepository: Repository<AIConversation>,
    @InjectRepository(AIMessage)
    private messageRepository: Repository<AIMessage>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private configService: ConfigService,
    @Inject(forwardRef(() => ProjectsService))
    private projectsService: ProjectsService,
  ) {}

  async sendMessage(userId: string, content: string, conversationId?: string, projectId?: string): Promise<{ conversation: AIConversation; userMessage: AIMessage; aiMessage: AIMessage }> {
    let conversation: AIConversation;

    if (conversationId) {
      const found = await this.conversationRepository.findOne({ 
        where: { id: conversationId },
        relations: ['user'],
      });
      if (!found) throw new NotFoundException('Conversa não encontrada');
      if (found.userId !== userId) throw new ForbiddenException('Acesso negado');
      conversation = found;
    } else {
      conversation = this.conversationRepository.create({
        userId,
        projectId,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
      });
      conversation = await this.conversationRepository.save(conversation);
    }

    const userMessage = this.messageRepository.create({
      conversationId: conversation.id,
      userId,
      role: 'user',
      content,
    });
    await this.messageRepository.save(userMessage);

    const history = await this.getConversationHistory(conversation.id, 10);
    const aiResponse = await this.generateAIResponse(content, history, projectId);

    const aiMessage = this.messageRepository.create({
      conversationId: conversation.id,
      userId,
      role: 'assistant',
      content: aiResponse.message,
      metadata: { tokensUsed: aiResponse.tokensUsed },
    });
    await this.messageRepository.save(aiMessage);

    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    return { conversation, userMessage, aiMessage };
  }

  async getConversations(userId: string): Promise<AIConversation[]> {
    return this.conversationRepository.find({
      where: { userId, isActive: true },
      order: { updatedAt: 'DESC' },
      relations: ['project'],
    });
  }

  async getConversationMessages(conversationId: string, userId: string): Promise<AIMessage[]> {
    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    if (conversation.userId !== userId) throw new ForbiddenException('Acesso negado');

    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    if (conversation.userId !== userId) throw new ForbiddenException('Acesso negado');

    await this.conversationRepository.remove(conversation);
  }

  async analyzeProject(prompt: string): Promise<{ summary: string; fullAnalysis: string; strengths: string; weaknesses: string; suggestions: string }> {
    // Mock response for development - replace with OpenAI call when API key is available
    return {
      summary: 'Análise do projeto realizada com sucesso. O projeto demonstra potencial para a Azul Linhas Aéreas.',
      fullAnalysis: `Análise completa do projeto:\n\n${prompt}\n\n---ANÁLISE---\nEste projeto está alinhado com os objetivos da Azul de expandir conectividade e melhorar experiência do cliente.`,
      strengths: '• Alinhamento com a marca Azul\n• Público-alvo bem definido\n• Potencial de ROI positivo',
      weaknesses: '• Necessita detalhamento do orçamento\n• Cronograma poderia ser mais específico',
      suggestions: '• Adicionar métricas de sucesso claras\n• Definir marcos de entrega\n• Incluir plano de mitigação de riscos',
    };
  }

  private async getConversationHistory(conversationId: string, limit: number): Promise<AIMessage[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async generateAIResponse(userMessage: string, history: AIMessage[], projectId?: string): Promise<AIResponse> {
    const systemPrompt = this.getSystemPrompt(projectId);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.reverse().map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    return this.callOpenAI(messages);
  }

  private getSystemPrompt(projectId?: string): string {
    let prompt = `Você é um assistente de IA especializado em marketing e comunicação para a Azul Linhas Aéreas.

    REGRAS OBRIGATÓRIAS (NÃO VIOLAR):
    1. NÃO CRIE IDEIAS DO ZERO - Um dos lemas da Azul baseia-se no trabalho e atendimento humano. A IA apenas analisa, resume e sugere melhorias para ideias JÁ PROPOSTAS por humanos. Não proponha novos produtos, campanhas ou conceitos originais.
    2. LINGUAGEM SEMPRE FORMAL - Use português brasileiro formal e corporativo. Proíbe-se gírias, coloquialismos, abreviações informais ou tom casual.
    3. NENHUMA INFORMAÇÃO PESSOAL - Nunca inclua nomes, e-mails, cargos, telefones ou dados identificáveis de colaboradores. Referencie apenas cargos genéricos (ex: "o analista", "a equipe de marketing") se necessário.

    Diretrizes de atuação:
    - Responda exclusivamente em português brasileiro formal
    - Seja profissional, analítico e alinhado à marca Azul
    - Foque em análise de viabilidade, resumo executivo, pontos fortes/fracos e sugestões de desenvolvimento para ideias EXISTENTES
    - Conheça a marca Azul: "A empresa aérea que mais conecta o Brasil"
    - Foque em: experiência do cliente, conectividade, inovação, sustentabilidade
    - Estruture respostas em: Resumo Executivo, Análise de Viabilidade, Pontos Fortes, Pontos Fracos, Sugestões de Desenvolvimento`;
    
    if (projectId) {
      prompt += `\n\nVocê está analisando um projeto específico já proposto. NÃO crie novas ideias - apenas analise a proposta existente.`;
    }
    
    return prompt;
  }

  private async callOpenAI(messages: { role: string; content: string }[]): Promise<AIResponse> {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (!apiKey) {
      return {
        message: 'Resposta simulada da IA. Configure OPENAI_API_KEY para respostas reais.',
        tokensUsed: 0,
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data: any = await response.json();
      return {
        message: data.choices[0]?.message?.content || 'Erro ao gerar resposta',
        tokensUsed: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        message: 'Erro ao conectar com a IA. Tente novamente mais tarde.',
        tokensUsed: 0,
      };
    }
  }
}