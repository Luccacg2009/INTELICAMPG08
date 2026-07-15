import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Loader2, Edit, Trash2, Eye, Zap } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { Idea } from '../../types';
import toast from 'react-hot-toast';

export function MyIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await api.get('/ideas/my-ideas');
      setIdeas(response.data.data || response.data.ideas || response.data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Erro ao carregar suas ideias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/ideas/${id}`);
      toast.success('Ideia excluída com sucesso!');
      setDeleteModal(null);
      fetchIdeas();
    } catch (error) {
      toast.error('Erro ao excluir ideia');
    }
  };

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Ideias</h1>
          <p className="text-gray-500 mt-1">Acompanhe o status das suas sugestões de produtos</p>
        </div>
        <Link to="/ideas/new">
          <Button variant="primary"><Lightbulb className="w-4 h-4" /> Nova Ideia</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ideia submetida</h3>
            <p className="text-gray-500 mb-6">Comece a contribuir com suas ideias de produtos para a Empresa Azul</p>
            <Link to="/ideas/new">
              <Button variant="primary"><Lightbulb className="w-4 h-4" /> Criar Minha Primeira Ideia</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => {
            const currentStatus = statusConfig[idea.status as keyof typeof statusConfig] || { label: idea.status, variant: 'default' as const };
            return (
              <Card key={idea.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{idea.title}</h3>
                    <Badge variant={currentStatus.variant} dot>{currentStatus.label}</Badge>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{idea.description}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="info" size="sm">{idea.vertical}</Badge>
                    <span className="text-xs text-gray-500">{new Date(idea.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {idea.aiSummary && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Resumo por IA disponível
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/ideas/${idea.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4" /> Ver Detalhes
                      </Button>
                    </Link>
                    {idea.status === 'PENDING_REVIEW' && (
                      <>
                        <Link to={`/ideas/${idea.id}/edit`} className="flex-1">
                          <Button variant="ghost" size="sm" className="w-full">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ id: idea.id, title: idea.title })}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Excluir Ideia"
        description={`Tem certeza que deseja excluir "${deleteModal?.title}"? Esta ação não pode ser desfeita.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal.id)}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}