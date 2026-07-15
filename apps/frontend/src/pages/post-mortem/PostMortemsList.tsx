import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, ChevronLeft, ChevronRight, Edit, Trash2, Eye, Calendar, MessageSquare, Zap, Filter, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { PostMortem, PostMortemStatus } from '../../types';

const statusLabels: Record<PostMortemStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

const statusColors: Record<PostMortemStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
};

const typeLabels: Record<string, string> = {
  INCIDENT: 'Incidente',
  PROJECT: 'Projeto',
  PROCESS: 'Processo',
  OTHER: 'Outro',
};

export function PostMortemsList() {
  const [postMortems, setPostMortems] = useState<PostMortem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostMortem, setEditingPostMortem] = useState<PostMortem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'INCIDENT' as string,
    status: 'DRAFT' as PostMortemStatus,
    description: '',
    timeline: '',
    rootCause: '',
    lessonsLearned: '',
    actionItems: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPostMortems();
  }, [page, search, statusFilter, typeFilter]);

  const fetchPostMortems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      });
      const response = await api.get(`/post-mortems?${params}`);
      setPostMortems(response.data.data || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching post-mortems:', error);
      toast.error('Erro ao carregar post-mortems');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPostMortem(null);
    setFormData({
      title: '',
      type: 'INCIDENT',
      status: 'DRAFT',
      description: '',
      timeline: '',
      rootCause: '',
      lessonsLearned: '',
      actionItems: '',
      tags: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pm: PostMortem) => {
    setEditingPostMortem(pm);
    setFormData({
      title: pm.title,
      type: pm.type,
      status: pm.status,
      description: pm.description || '',
      timeline: pm.timeline || '',
      rootCause: pm.rootCause || '',
      lessonsLearned: pm.lessonsLearned || '',
      actionItems: pm.actionItems || '',
      tags: pm.tags?.join(', ') || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        title: formData.title,
        type: formData.type,
        status: formData.status,
        description: formData.description,
        timeline: formData.timeline,
        rootCause: formData.rootCause,
        lessonsLearned: formData.lessonsLearned,
        actionItems: formData.actionItems,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (editingPostMortem) {
        await api.put(`/post-mortems/${editingPostMortem.id}`, data);
        toast.success('Post-mortem atualizado com sucesso');
      } else {
        await api.post('/post-mortems', data);
        toast.success('Post-mortem criado com sucesso');
      }
      setIsModalOpen(false);
      fetchPostMortems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar post-mortem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pm: PostMortem) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${pm.title}"?`)) return;
    try {
      await api.delete(`/post-mortems/${pm.id}`);
      toast.success('Post-mortem excluído com sucesso');
      fetchPostMortems();
    } catch (error) {
      toast.error('Erro ao excluir post-mortem');
    }
  };

  const handlePublish = async (pm: PostMortem) => {
    try {
      await api.put(`/post-mortems/${pm.id}`, { status: 'PUBLISHED' });
      toast.success('Post-mortem publicado');
      fetchPostMortems();
    } catch (error) {
      toast.error('Erro ao publicar');
    }
  };

  const handleArchive = async (pm: PostMortem) => {
    try {
      await api.put(`/post-mortems/${pm.id}`, { status: 'ARCHIVED' });
      toast.success('Post-mortem arquivado');
      fetchPostMortems();
    } catch (error) {
      toast.error('Erro ao arquivar');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post-Mortems</h1>
          <p className="text-gray-500 mt-1">Lições aprendidas e análise de incidentes</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Novo Post-Mortem
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar post-mortems..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px]"
              >
                <option value="">Todos os status</option>
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px]"
              >
                <option value="">Todos os tipos</option>
                <option value="INCIDENT">Incidente</option>
                <option value="PROJECT">Projeto</option>
                <option value="PROCESS">Processo</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando post-mortems...</p>
            </div>
          ) : postMortems.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum post-mortem encontrado</h3>
              <p className="text-gray-500">Comece criando seu primeiro post-mortem</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {postMortems.map(pm => (
                  <div key={pm.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{pm.title}</h3>
                          <Badge variant={statusColors[pm.status]}>{statusLabels[pm.status]}</Badge>
                          <Badge variant="info">{typeLabels[pm.type] || pm.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{pm.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(pm.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {pm.author?.name || 'Autor'}
                          </span>
                          {pm.tags && pm.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5" />
                              {pm.tags.slice(0, 3).join(', ')}
                              {pm.tags.length > 3 && <span>+{pm.tags.length - 3}</span>}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/post-mortems/${pm.id}`} className="text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(pm)} className="text-gray-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {pm.status === 'DRAFT' && (
                          <Button variant="ghost" size="sm" onClick={() => handlePublish(pm)} className="text-green-600">
                            <Zap className="w-4 h-4" />
                          </Button>
                        )}
                        {pm.status === 'PUBLISHED' && (
                          <Button variant="ghost" size="sm" onClick={() => handleArchive(pm)} className="text-yellow-600">
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(pm)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, total)} de {total} resultados
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPostMortem ? 'Editar Post-Mortem' : 'Novo Post-Mortem'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Ex: Incidente de indisponibilidade da API" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="INCIDENT">Incidente</option>
                <option value="PROJECT">Projeto</option>
                <option value="PROCESS">Processo</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as PostMortemStatus})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Resumo do que aconteceu..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline dos Eventos</label>
            <textarea value={formData.timeline} onChange={(e) => setFormData({...formData, timeline: e.target.value})} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cronologia detalhada dos eventos (data/hora - descrição)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Causa Raiz</label>
            <textarea value={formData.rootCause} onChange={(e) => setFormData({...formData, rootCause: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Análise da causa raiz (ex: 5 Porquês)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lições Aprendidas</label>
            <textarea value={formData.lessonsLearned} onChange={(e) => setFormData({...formData, lessonsLearned: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="O que aprendemos com este incidente/projeto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Itens de Ação</label>
            <textarea value={formData.actionItems} onChange={(e) => setFormData({...formData, actionItems: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ações preventivas/corretivas (um por linha)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <Input value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="incidente, api, disponibilidade, preventivo" />
            <p className="text-xs text-gray-500 mt-1">Separe por vírgula</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : editingPostMortem ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { User, Tag, Archive, FileText } from 'lucide-react';