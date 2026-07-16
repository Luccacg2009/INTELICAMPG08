import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIConversation } from './ai-conversation.entity';
import { AIMessage } from './ai-message.entity';
import { AIFeedback, AIFeedbackType, AIFeedbackStatus } from './ai-feedback.entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { ConfigService } from '@nestjs/config';
import { ProjectsService } from '../projects/projects.service';
import { UserRole, UserVertical } from '../../common/enums/user.enums';

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
    @InjectRepository(AIFeedback)
    private feedbackRepository: Repository<AIFeedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  /**
   * Process analyst feedback through AI and send to vertical owner + marketing admin
   * Spec item 6: Analistas fazem feedback para IA → IA envia para vertical responsável + admin marketing
   * Good feedback: como marketing pode ajudar a desenvolver
   * Bad feedback: motivo de ser má ideia
   */
  async processAnalystFeedback(
    projectId: string,
    analystId: string,
    type: AIFeedbackType,
    content: string,
  ): Promise<AIFeedback> {
    // Get project details
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['author'],
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');

    // Get analyst info
    const analyst = await this.userRepository.findOne({ where: { id: analystId } });
    if (!analyst) throw new NotFoundException('Analista não encontrado');

    // Get vertical owner (users in same vertical as project with WORKER role)
    const verticalOwner = await this.userRepository.findOne({
      where: { vertical: project.vertical, role: UserRole.WORKER, isActive: true },
    });

    // Get marketing admin
    const marketingAdmin = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN, vertical: UserVertical.MARKETING, isActive: true },
    });

    // Create feedback record
    const feedback = this.feedbackRepository.create({
      projectId,
      analystId,
      type,
      content,
      status: AIFeedbackStatus.PENDING,
    });
    await this.feedbackRepository.save(feedback);

    // Process through AI to structure the response
    const aiProcessedContent = await this.processFeedbackWithAI(project, type, content);

    // Update feedback with AI processed content
    feedback.aiProcessedContent = aiProcessedContent;
    feedback.status = AIFeedbackStatus.PROCESSED;
    feedback.processedAt = new Date();
    await this.feedbackRepository.save(feedback);

    // Notify vertical owner
    if (verticalOwner) {
      await this.notifyFeedbackRecipient(verticalOwner, project, feedback, 'VERTICAL_OWNER');
    }

    // Notify marketing admin
    if (marketingAdmin) {
      await this.notifyFeedbackRecipient(marketingAdmin, project, feedback, 'MARKETING_ADMIN');
    }

    return feedback;
  }

  /**
   * Process feedback content through AI to structure it properly
   */
  private async processFeedbackWithAI(
    project: Project,
    type: AIFeedbackType,
    content: string,
  ): Promise<string> {
    const systemPrompt = `Você é um assistente de IA especializado em marketing para a Azul Linhas Aéreas.
    
    REGRAS OBRIGATÓRIAS:
    1. NÃO CRIE IDEIAS DO ZERO - Apenas analise e estruture o feedback
    2. LINGUAGEM SEMPRE FORMAL - Português brasileiro formal corporativo
    3. NENHUMA INFORMAÇÃO PESSOAL - Sem nomes, e-mails, cargos específicos

    TAREFA: Estruture o feedback do analista em formato adequado para envio ao dono da vertical e admin de marketing.

    ${type === AIFeedbackType.POSITIVE 
      ? `FEEDBACK POSITIVO - Deve conter:
        - Como o marketing pode ajudar a desenvolver este projeto
        - Sugestões de estratégias de marketing
        - Canais recomendados
        - Público-alvo para campanhas
        - Métricas de sucesso sugeridas`
      : `FEEDBACK NEGATIVO - Deve conter:
        - Motivo detalhado de ser uma má ideia
        - Riscos identificados
        - Pontos de falha na proposta
        - Sugestões de melhoria (se aplicável) ou motivo para rejeição`}

    Projeto analisado: ${project.title} (${project.centralIdea})
    Vertical: ${project.vertical}
    Feedback do analista: ${content}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Processe este feedback conforme as regras acima.' },
    ];

    const response = await this.callOpenAI(messages);
    return response.message;
  }

  /**
   * Send notification to feedback recipient (vertical owner or marketing admin)
   */
  private async notifyFeedbackRecipient(
    recipient: User,
    project: Project,
    feedback: AIFeedback,
    recipientType: 'VERTICAL_OWNER' | 'MARKETING_ADMIN',
  ): Promise<void> {
    // Create AI conversation for this feedback notification
    const conversation = this.conversationRepository.create({
      userId: recipient.id,
      projectId: project.id,
      title: `Feedback IA: ${project.title} - ${recipientType === 'VERTICAL_OWNER' ? 'Dono da Vertical' : 'Admin Marketing'}`,
    });
    await this.conversationRepository.save(conversation);

    // Create system message with AI processed feedback
    const message = this.messageRepository.create({
      conversationId: conversation.id,
      userId: recipient.id,
      role: 'assistant',
      content: `
Feedback de Análise IA - ${project.title}

TIPO: ${feedback.type === AIFeedbackType.POSITIVE ? 'POSITIVO' : 'NEGATIVO'}
DESTINATÁRIO: ${recipientType === 'VERTICAL_OWNER' ? 'Responsável pela Vertical' : 'Administrador de Marketing'}

--- CONTEÚDO PROCESSADO PELA IA ---
${feedback.aiProcessedContent}

--- FEEDBACK ORIGINAL DO ANALISTA ---
${feedback.content}

---
Projeto: ${project.title}
Vertical: ${project.vertical}
Analista: ${feedback.analystId}
Data: ${new Date().toLocaleString('pt-BR')}
      `.trim(),
      metadata: { 
        type: 'feedback_notification', 
        feedbackId: feedback.id,
        recipientType 
      },
    });
    await this.messageRepository.save(message);
  }

  /**
   * Get feedback history for a project
   */
  async getProjectFeedback(projectId: string): Promise<AIFeedback[]> {
    return this.feedbackRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      relations: ['analyst'],
    });
  }

  /**
   * Get feedback notifications for a user
   */
  async getUserFeedbackNotifications(userId: string): Promise<AIMessage[]> {
    const conversations = await this.conversationRepository.find({
      where: { userId },
      relations: ['messages'],
    });
    
    const feedbackMessages: AIMessage[] = [];
    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (msg.metadata?.type === 'feedback_notification') {
          feedbackMessages.push(msg);
        }
      }
    }
    
    return feedbackMessages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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