import { useState, useEffect } from 'react';
import { Target, Plus, Search, Loader2, ChevronLeft, ChevronRight, Edit, Trash2, DollarSign, Calendar, User, Building2, Filter, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  company: { id: string; name: string };
  contact: { id: string; name: string };
  owner: { id: string; name: string };
  pipeline: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface DealListResponse {
  data: Deal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Pipeline {
  id: string;
  name: string;
  stages: Array<{ id: string; name: string; order: number; color: string }>;
}

export function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [companies, setCompanies] = useState<Array<{id: string; name: string}>>([]);
  const [contacts, setContacts] = useState<Array<{id: string; name: string; email: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    stage: '',
    probability: 50,
    expectedCloseDate: '',
    companyId: '',
    contactId: '',
    pipelineId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');

  useEffect(() => {
    fetchDeals();
    fetchPipelines();
    fetchCompanies();
    fetchContacts();
  }, [page, search, stageFilter, pipelineFilter]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: viewMode === 'kanban' ? '100' : '10',
        ...(search && { search }),
        ...(stageFilter && { stage: stageFilter }),
        ...(pipelineFilter && { pipelineId: pipelineFilter }),
      });
      const response = await api.get<DealListResponse>(`/crm/deals?${params}`);
      setDeals(response.data.data || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Erro ao carregar negócios');
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      const response = await api.get('/crm/pipelines');
      setPipelines(response.data);
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/crm/companies?limit=100');
      const data = response.data.data || response.data;
      setCompanies(data.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await api.get('/crm/contacts?limit=100');
      const data = response.data.data || response.data;
      setContacts(data.map((c: any) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email })));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const openCreateModal = () => {
    const defaultPipeline = pipelines[0]?.id || '';
    const defaultStage = pipelines[0]?.stages[0]?.id || '';
    setEditingDeal(null);
    setFormData({
      title: '',
      description: '',
      value: '',
      stage: defaultStage,
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      companyId: '',
      contactId: '',
      pipelineId: defaultPipeline,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || '',
      value: deal.value.toString(),
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate.split('T')[0],
      companyId: deal.company.id,
      contactId: deal.contact.id,
      pipelineId: deal.pipeline.id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        title: formData.title,
        description: formData.description || undefined,
        value: parseFloat(formData.value),
        stage: formData.stage,
        probability: formData.probability,
        expectedCloseDate: formData.expectedCloseDate,
        companyId: formData.companyId || undefined,
        contactId: formData.contactId || undefined,
        pipelineId: formData.pipelineId || undefined,
      };

      if (editingDeal) {
        await api.put(`/crm/deals/${editingDeal.id}`, data);
        toast.success('Negócio atualizado com sucesso');
      } else {
        await api.post('/crm/deals', data);
        toast.success('Negócio criado com sucesso');
      }
      setIsModalOpen(false);
      fetchDeals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar negócio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (deal: Deal) => {
    if (!window.confirm(`Tem certeza que deseja excluir o negócio "${deal.title}"?`)) return;
    try {
      await api.delete(`/crm/deals/${deal.id}`);
      toast.success('Negócio excluído com sucesso');
      fetchDeals();
    } catch (error) {
      toast.error('Erro ao excluir negócio');
    }
  };

  const moveDeal = async (deal: Deal, newStage: string) => {
    try {
      await api.put(`/crm/deals/${deal.id}`, { stage: newStage });
      fetchDeals();
    } catch (error) {
      toast.error('Erro ao mover negócio');
    }
  };

  if (viewMode === 'kanban') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline de Negócios</h1>
            <p className="text-gray-500 mt-1">Gerencie seus negócios em visualização Kanban</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />} onClick={() => setViewMode('table')}>
              Tabela
            </Button>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
              Novo Negócio
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : pipelines.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum pipeline configurado. Crie um pipeline nas configurações.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipelines.flatMap(pipeline =>
              pipeline.stages
                .sort((a, b) => a.order - b.order)
                .map(stage => {
                  const stageDeals = deals.filter(d => d.stage === stage.id && d.pipeline.id === pipeline.id);
                  const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                  return (
                    <div key={`${pipeline.id}-${stage.id}`} className="min-w-[320px] max-w-[320px] flex-shrink-0">
                      <div className="bg-gray-50 rounded-lg p-4 h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                          </div>
                          <span className="text-sm text-gray-500">{stageDeals.length}</span>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                          {stageDeals.map(deal => (
                            <div
                              key={deal.id}
                              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => openEditModal(deal)}
                            >
                              <h4 className="font-medium text-gray-900 mb-1">{deal.title}</h4>
                              <p className="text-sm text-gray-500 mb-2">{deal.company.name}</p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-green-600">R$ {deal.value.toLocaleString('pt-BR')}</span>
                                <span className="text-gray-400">{deal.probability}%</span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                <span>{deal.contact.name}</span>
                                <span>{new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                          ))}
                          {stageDeals.length === 0 && (
                            <div className="text-center py-4 text-gray-400 text-sm">
                              Arraste um negócio para cá
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-900">
                            R$ {totalValue.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    );
  }

  // Table view
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Negócios</h1>
          <p className="text-gray-500 mt-1">Lista de todos os negócios</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />} onClick={() => setViewMode('kanban')}>
            Kanban
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
            Novo Negócio
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar negócios..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <select value={pipelineFilter} onChange={(e) => { setPipelineFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]">
              <option value="">Todos os pipelines</option>
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]">
              <option value="">Todos os estágios</option>
              {pipelines.flatMap(p => p.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando negócios...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum negócio encontrado</h3>
              <p className="text-gray-500">Comece criando um novo negócio</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negócio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estágio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prob.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechamento</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deals.map(deal => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{deal.title}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{deal.company.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{deal.contact.name}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">R$ {deal.value.toLocaleString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{pipelines.flatMap(p => p.stages).find(s => s.id === deal.stage)?.name || deal.stage}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{deal.probability}%</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(deal)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(deal)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDeal ? 'Editar Negócio' : 'Novo Negócio'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <Input type="number" step="0.01" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} required placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Probabilidade (%)</label>
              <Input type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value) || 0})} className="w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista de Fechamento *</label>
              <Input type="date" value={formData.expectedCloseDate} onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline</label>
              <select value={formData.pipelineId} onChange={(e) => setFormData({...formData, pipelineId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estágio *</label>
              <select value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {pipelines.flatMap(p => p.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione (opcional)</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
            <select value={formData.contactId} onChange={(e) => setFormData({...formData, contactId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Selecione (opcional)</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : editingDeal ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}