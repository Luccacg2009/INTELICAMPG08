import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle, CheckCircle, XCircle, Loader2, MessageSquare, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { Idea, ReviewIdeaDto, CreateFeedbackDto, RequestAIDeletionDto } from '../../types';
import toast from 'react-hot-toast';

export function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'>('APPROVED');
  const [reviewForm, setReviewForm] = useState({ strengths: '', weaknesses: '', developmentWays: '' });
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ type: 'POSITIVE' as 'POSITIVE' | 'NEGATIVE', content: '', marketingSuggestions: '', negativeReason: '' });
  const [aiDeletionModal, setAiDeletionModal] = useState(false);
  const [aiDeletionReason, setAiDeletionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchIdea();
  }, [id]);

  const fetchIdea = async () => {
    try {
      const response = await api.get(`/ideas/${id}`);
      setIdea(response.data);
    } catch (error) {
      console.error('Error fetching idea:', error);
      toast.error('Erro ao carregar ideia');
      navigate('/ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!idea) return;
    setSubmitting(true);
    try {
      await api.patch(`/ideas/${id}/review`, {
        status: reviewStatus,
        strengths: reviewForm.strengths,
        weaknesses: reviewForm.weaknesses,
        developmentWays: reviewForm.developmentWays,
      } as ReviewIdeaDto);
      toast.success(`Ideia ${reviewStatus === 'APPROVED' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      setReviewModal(false);
      fetchIdea();
    } catch (error) {
      toast.error('Erro ao revisar ideia');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedback = async () => {
    if (!idea) return;
    setSubmitting(true);
    try {
      await api.post(`/feedbacks/idea/${id}`, feedbackForm as CreateFeedbackDto);
      toast.success('Feedback enviado com sucesso!');
      setFeedbackModal(false);
      fetchIdea();
    } catch (error) {
      toast.error('Erro ao enviar feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiDeletion = async () => {
    if (!idea) return;
    setSubmitting(true);
    try {
      await api.post(`/ideas/${id}/ai-deletion`, { reason: aiDeletionReason } as RequestAIDeletionDto);
      toast.success('Solicitação de exclusão por IA enviada!');
      setAiDeletionModal(false);
      fetchIdea();
    } catch (error) {
      toast.error('Erro ao solicitar exclusão');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!idea) return;
    try {
      const response = await api.get(`/pdf/idea/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ideia-${idea.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar PDF');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!idea) return null;

  const statusConfig = {
    PENDING_REVIEW: { label: 'Aguardando Análise', variant: 'warning' as const },
    UNDER_REVIEW: { label: 'Em Análise', variant: 'info' as const },
    APPROVED: { label: 'Aprovada', variant: 'success' as const },
    REJECTED: { label: 'Rejeitada', variant: 'danger' as const },
    IN_DEVELOPMENT: { label: 'Em Desenvolvimento', variant: 'info' as const },
    LAUNCHED: { label: 'Lançada', variant: 'success' as const },
    ARCHIVED: { label: 'Arquivada', variant: 'gray' as const },
    AI_DELETION_REQUESTED: { label: 'Exclusão por IA Solicitada', variant: 'danger' as const },
    DELETED_BY_AI: { label: 'Excluída por IA', variant: 'gray' as const },
  };

  const currentStatus = statusConfig[idea.status as keyof typeof statusConfig] || { label: idea.status, variant: 'default' as const };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/ideas" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
          <p className="text-gray-500">Ideia submetida por {idea.author.name} • {new Date(idea.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Detalhes da Ideia</CardTitle>
              <Badge variant={currentStatus.variant} dot>{currentStatus.label}</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Descrição</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{idea.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Público-alvo</h3>
                  <p className="text-gray-900">{idea.targetAudience}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Vertical</h3>
                  <Badge variant="info">{idea.vertical}</Badge>
                </div>
              </div>

              {idea.motivation && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Motivação</h3>
                  <p className="text-gray-900">{idea.motivation}</p>
                </div>
              )}

              {idea.launchLocation && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Local de Lançamento</h3>
                  <p className="text-gray-900">{idea.launchLocation}</p>
                </div>
              )}

              {idea.aiSummary && (
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Resumo Executivo (IA)
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 prose prose-sm max-w-none text-gray-900 whitespace-pre-wrap">
                    {idea.aiSummary}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {idea.aiStrengths && (
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Pontos Fortes
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.aiStrengths}</p>
                      </div>
                    )}
                    {idea.aiWeaknesses && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          Pontos Fracos
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.aiWeaknesses}</p>
                      </div>
                    )}
                    {idea.aiDevelopment && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          Formas de Desenvolvimento
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.aiDevelopment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {idea.feedbacks && idea.feedbacks.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Feedbacks ({idea.feedbacks.length})
                  </h3>
                  <div className="space-y-4">
                    {idea.feedbacks.map((feedback) => (
                      <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{feedback.author.name}</span>
                            <Badge variant={feedback.type === 'POSITIVE' ? 'success' : 'danger'}>
                              {feedback.type === 'POSITIVE' ? 'Positivo' : 'Negativo'}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(feedback.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-gray-700">{feedback.content}</p>
                        {feedback.marketingSuggestions && (
                          <p className="mt-2 text-sm text-blue-700"><strong>Sugestões de marketing:</strong> {feedback.marketingSuggestions}</p>
                        )}
                        {feedback.negativeReason && (
                          <p className="mt-2 text-sm text-red-700"><strong>Motivo da rejeição:</strong> {feedback.negativeReason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {idea.status === 'PENDING_REVIEW' && (
                <Button variant="primary" className="w-full" onClick={() => setReviewModal(true)}>
                  <CheckCircle className="w-4 h-4" /> Revisar Ideia
                </Button>
              )}

              {idea.aiSummary && (
                <Button variant="secondary" className="w-full" onClick={handleDownloadPdf}>
                  <Download className="w-4 h-4" /> Baixar PDF
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={() => setFeedbackModal(true)}>
                <MessageSquare className="w-4 h-4" /> Dar Feedback
              </Button>

              {idea.status === 'APPROVED' || idea.status === 'REJECTED' || idea.status === 'PENDING_REVIEW' ? (
                <Button variant="outline" className="w-full" onClick={() => setAiDeletionModal(true)}>
                  <AlertCircle className="w-4 h-4" /> Solicitar Exclusão por IA
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Autor</span>
                <span className="font-medium">{idea.author.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vertical do Autor</span>
                <Badge variant="info">{idea.author.vertical}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Criada em</span>
                <span>{new Date(idea.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              {idea.reviewedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revisada em</span>
                  <span>{new Date(idea.reviewedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              {idea.reviewedBy && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revisada por</span>
                  <span className="font-medium">{idea.reviewedBy.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        title="Revisar Ideia"
        description={`Você está prestes a ${reviewStatus === 'APPROVED' ? 'aprovar' : 'rejeitar'} esta ideia.`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decisão</label>
            <div className="grid grid-cols-3 gap-3">
              {(['APPROVED', 'REJECTED', 'UNDER_REVIEW'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setReviewStatus(status)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    reviewStatus === status
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium capitalize">{status.replace(/_/g, ' ')}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pontos Fortes</label>
            <textarea
              value={reviewForm.strengths}
              onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Liste os pontos fortes da ideia..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pontos Fracos</label>
            <textarea
              value={reviewForm.weaknesses}
              onChange={(e) => setReviewForm({ ...reviewForm, weaknesses: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Liste os pontos fracos ou riscos..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formas de Desenvolvimento</label>
            <textarea
              value={reviewForm.developmentWays}
              onChange={(e) => setReviewForm({ ...reviewForm, developmentWays: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Sugira como a ideia pode ser desenvolvida..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setReviewModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleReview} loading={submitting}>
              {reviewStatus === 'APPROVED' ? 'Aprovar' : reviewStatus === 'REJECTED' ? 'Rejeitar' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModal}
        onClose={() => setFeedbackModal(false)}
        title="Dar Feedback"
        description="Compartilhe sua análise sobre esta ideia."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Feedback</label>
            <div className="grid grid-cols-2 gap-3">
              {(['POSITIVE', 'NEGATIVE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFeedbackForm({ ...feedbackForm, type })}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    feedbackForm.type === type
                      ? type === 'POSITIVE' ? 'border-green-600 bg-green-50 text-green-700' : 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium capitalize">{type === 'POSITIVE' ? 'Positivo' : 'Negativo'}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo do Feedback *</label>
            <textarea
              value={feedbackForm.content}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Descreva sua análise detalhada..."
              required
            />
          </div>

          {feedbackForm.type === 'POSITIVE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sugestões de Marketing</label>
              <textarea
                value={feedbackForm.marketingSuggestions}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, marketingSuggestions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Como o marketing pode ajudar esta ideia? Campanhas, canais, estratégias..."
              />
            </div>
          )}

          {feedbackForm.type === 'NEGATIVE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo da Rejeição *</label>
              <textarea
                value={feedbackForm.negativeReason}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, negativeReason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Explique detalhadamente por que esta é uma má ideia de produto..."
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setFeedbackModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleFeedback} loading={submitting} disabled={!feedbackForm.content || (feedbackForm.type === 'NEGATIVE' && !feedbackForm.negativeReason)}>
              Enviar Feedback
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Deletion Modal */}
      <Modal
        isOpen={aiDeletionModal}
        onClose={() => setAiDeletionModal(false)}
        title="Solicitar Exclusão por IA"
        description="Esta ação solicitará que a IA avalie se a ideia deve ser removida por violar valores da empresa."
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Atenção:</strong> A exclusão por IA é irreversível. A ideia será analisada contra os valores da empresa (Inovação, Sustentabilidade, Ética, Foco no Cliente, Excelência).
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Justificativa *</label>
            <textarea
              value={aiDeletionReason}
              onChange={(e) => setAiDeletionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Explique por que esta ideia deve ser avaliada para exclusão pela IA..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setAiDeletionModal(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleAiDeletion} loading={submitting} disabled={!aiDeletionReason.trim()}>
              Solicitar Exclusão
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}