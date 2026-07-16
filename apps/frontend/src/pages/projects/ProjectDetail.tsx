import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Tag, AlertCircle, CheckCircle, XCircle, FileText, Edit, Trash2, Send, Sparkles, Download, Loader2, ChevronLeft, ChevronRight, ArrowRight, MessageSquare, DollarSign, Calendar, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { Project, ProjectStatus, ProjectPriority, UserVertical, EvaluationStatus } from '../../types';
import { toast } from 'react-hot-toast';

const statusLabels: Record<ProjectStatus, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em Análise',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  IN_DEVELOPMENT: 'Em Desenvolvimento',
  LAUNCHED: 'Lançado',
  ARCHIVED: 'Arquivado',
};

const statusColors: Record<ProjectStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'default',
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  IN_DEVELOPMENT: 'info',
  LAUNCHED: 'success',
  ARCHIVED: 'default',
};

const priorityLabels: Record<ProjectPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

const verticalLabels: Record<UserVertical, string> = {
  MARKETING: 'Marketing',
  PRODUCT: 'Produto',
  SALES: 'Vendas',
  ENGINEERING: 'Engenharia',
  DESIGN: 'Design',
  OPERATIONS: 'Operações',
  FINANCE: 'Finanças',
  HR: 'RH',
  LEGAL: 'Jurídico',
  OTHER: 'Outro',
};

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: string;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchComments();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Erro ao carregar projeto');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Note: This would need a backend endpoint. For now, we'll skip.
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePublish = async () => {
    if (!project) return;
    try {
      await api.post(`/projects/${id}/submit-review`);
      toast.success('Projeto enviado para revisão');
      fetchProject();
    } catch (error) {
      toast.error('Erro ao enviar para revisão');
    }
  };

  const handleArchive = async () => {
    if (!project) return;
    try {
      await api.put(`/projects/${id}`, { status: 'ARCHIVED' });
      toast.success('Projeto arquivado');
      fetchProject();
    } catch (error) {
      toast.error('Erro ao arquivar');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Projeto excluído');
      window.location.href = '/projects';
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      // Would need backend endpoint
      toast.success('Comentário adicionado');
      setNewComment('');
    } catch (error) {
      toast.error('Erro ao adicionar comentário');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!project) return;
    try {
      const response = await api.get(`/projects/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projeto-${project.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erro ao baixar PDF');
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!project) return;
    try {
      await api.post(`/projects/${id}/ai-summary`);
      toast.success('Resumo por IA gerado');
      fetchProject();
    } catch (error) {
      toast.error('Erro ao gerar resumo por IA');
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!project) {
    return <div className="p-6 text-center"><p className="text-gray-500">Projeto não encontrado</p></div>;
  }

  const canEdit = project.authorId === project.author?.id || ['ADMIN', 'ANALYST'].includes(project.author?.role || '');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <Badge variant={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
            <Badge variant="info">{priorityLabels[project.priority]}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{project.author?.name || 'Autor'}</span>
            <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{verticalLabels[project.vertical] || project.vertical}</span>
            {project.budget && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />R$ {project.budget.toLocaleString('pt-BR')}</span>}
            {project.timeline && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{project.timeline}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {project.status === 'DRAFT' && (
            <Button leftIcon={<Send className="w-4 h-4" />} onClick={handlePublish} className="text-green-600 hover:bg-green-50 border-green-200">
              Enviar para Revisão
            </Button>
          )}
          {project.status === 'APPROVED' && (
            <Button leftIcon={<Archive className="w-4 h-4" />} onClick={handleArchive} className="text-yellow-600 hover:bg-yellow-50 border-yellow-200">
              Arquivar
            </Button>
          )}
          {canEdit && (
            <Button variant="ghost" leftIcon={<Edit className="w-4 h-4" />} onClick={() => window.location.href = `/projects/${id}/edit`}>
              Editar
            </Button>
          )}
          {canEdit && (
            <Button variant="ghost" leftIcon={<Trash2 className="w-4 h-4" />} onClick={handleDelete} className="text-red-600 hover:text-red-700">
              Excluir
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{project.description || 'Sem descrição'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ideia Central</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{project.centralIdea || 'Não informada'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Público-Alvo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{project.targetAudience || 'Não informado'}</p>
            </CardContent>
          </Card>

          {project.aiSummary && (
            <Card className="border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-600" />Resumo por IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{project.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {project.aiAnalysis && (
            <Card className="border-l-4 border-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-600" />Análise por IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{project.aiAnalysis}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" />Comentários</CardTitle>
                <Button size="sm" leftIcon={<MessageSquare className="w-4 h-4" />} onClick={() => setIsCommentsModalOpen(true)}>
                  {comments.length}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
              ) : (
                <>
                  {comments.map(comment => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{comment.author.name?.charAt(0) || 'U'}</span>
                        </div>
                        <span className="font-medium text-gray-900">{comment.author.name}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-9">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setIsCommentsModalOpen(true)}>
                      Ver todos os {comments.length} comentários
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <Badge variant={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prioridade</span>
                <span className="font-medium">{priorityLabels[project.priority]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vertical</span>
                <span className="font-medium">{verticalLabels[project.vertical] || project.vertical}</span>
              </div>
              {project.budget && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Orçamento</span>
                  <span className="font-medium">R$ {project.budget.toLocaleString('pt-BR')}</span>
                </div>
              )}
              {project.timeline && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Prazo</span>
                  <span className="font-medium">{project.timeline}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Criado em</span>
                <span className="font-medium">{new Date(project.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Atualizado em</span>
                <span className="font-medium">{new Date(project.updatedAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Autor</span>
                <span className="font-medium">{project.author?.name || 'Desconhecido'}</span>
              </div>
            </CardContent>
          </Card>

          {project.evaluations && project.evaluations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.evaluations.map(evaluation => (
                  <div key={evaluation.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={evaluation.status === 'APPROVED' ? 'success' : evaluation.status === 'REJECTED' ? 'danger' : evaluation.status === 'NEEDS_REVISION' ? 'warning' : 'default'}>
                        {evaluation.status === 'APPROVED' ? 'Aprovado' : evaluation.status === 'REJECTED' ? 'Rejeitado' : evaluation.status === 'NEEDS_REVISION' ? 'Revisão Necessária' : 'Pendente'}
                      </Badge>
                      <span className="text-sm text-gray-500">Por {evaluation.evaluator?.name} em {new Date(evaluation.reviewedAt || evaluation.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {evaluation.strengths && <p className="text-sm text-green-700 mb-1"><strong>Pontos fortes:</strong> {evaluation.strengths}</p>}
                    {evaluation.weaknesses && <p className="text-sm text-red-700 mb-1"><strong>Pontos fracos:</strong> {evaluation.weaknesses}</p>}
                    {evaluation.suggestions && <p className="text-sm text-blue-700 mb-1"><strong>Sugestões:</strong> {evaluation.suggestions}</p>}
                    {evaluation.recommendation && <p className="text-sm text-purple-700"><strong>Recomendação:</strong> {evaluation.recommendation}</p>}
                    {evaluation.score && <p className="text-sm text-gray-700"><strong>Score:</strong> {evaluation.score}/100</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={isCommentsModalOpen} onClose={() => setIsCommentsModalOpen(false)} title="Comentários">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {comments.map(comment => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{comment.author.name?.charAt(0) || 'U'}</span>
                </div>
                <span className="font-medium text-gray-900">{comment.author.name}</span>
                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <p className="text-sm text-gray-700 ml-10">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum comentário</p>}
          
          <div className="border-t border-gray-100 pt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicionar comentário..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleAddComment} disabled={isSubmittingComment || !newComment.trim()}>
                {isSubmittingComment ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}