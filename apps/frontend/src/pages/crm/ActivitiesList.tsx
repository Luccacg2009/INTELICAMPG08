import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, ChevronLeft, ChevronRight, Edit, Trash2, CheckCircle, Clock, Calendar, User, Target, MessageSquare, Phone, Building2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Activity {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE';
  subject: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  contact?: { id: string; name: string; email: string };
  deal?: { id: string; title: string };
  company?: { id: string; name: string };
  owner: { id: string; name: string };
  createdAt: string;
}

interface ActivityListResponse {
  data: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    type: 'TASK',
    subject: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    contactId: '',
    dealId: '',
    companyId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [page, search, typeFilter, statusFilter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('completed', (statusFilter === 'completed').toString());
      const response = await api.get<ActivityListResponse>(`/crm/activities?${params.toString()}`);
      setActivities(response.data.data || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingActivity(null);
    setFormData({
      type: 'TASK',
      subject: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      contactId: '',
      dealId: '',
      companyId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      type: activity.type,
      subject: activity.subject,
      description: activity.description || '',
      dueDate: activity.dueDate.split('T')[0],
      contactId: activity.contact?.id || '',
      dealId: activity.deal?.id || '',
      companyId: activity.company?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        type: formData.type,
        subject: formData.subject,
        description: formData.description || undefined,
        dueDate: formData.dueDate,
        contactId: formData.contactId || undefined,
        dealId: formData.dealId || undefined,
        companyId: formData.companyId || undefined,
      };

      if (editingActivity) {
        await api.put(`/crm/activities/${editingActivity.id}`, data);
        toast.success('Atividade atualizada com sucesso');
      } else {
        await api.post('/crm/activities', data);
        toast.success('Atividade criada com sucesso');
      }
      setIsModalOpen(false);
      fetchActivities();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar atividade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (activity: Activity) => {
    try {
      await api.put(`/crm/activities/${activity.id}/complete`);
      toast.success(activity.completed ? 'Atividade reaberta' : 'Atividade concluída');
      fetchActivities();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (activity: Activity) => {
    if (!window.confirm(`Tem certeza que deseja excluir a atividade "${activity.subject}"?`)) return;
    try {
      await api.delete(`/crm/activities/${activity.id}`);
      toast.success('Atividade excluída com sucesso');
      fetchActivities();
    } catch (error) {
      toast.error('Erro ao excluir atividade');
    }
  };

  const typeLabels: Record<string, string> = {
    CALL: 'Ligação',
    EMAIL: 'Email',
    MEETING: 'Reunião',
    TASK: 'Tarefa',
    NOTE: 'Nota',
  };

  const typeIcons: Record<Activity['type'], React.ComponentType<{ className?: string }>> = {
    CALL: Phone,
    EMAIL: MessageSquare,
    MEETING: Calendar,
    TASK: CheckCircle,
    NOTE: MessageSquare,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
          <p className="text-gray-500 mt-1">Gerencie tarefas, ligações, reuniões e notas</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Nova Atividade
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar atividades..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]">
                <option value="">Todos os tipos</option>
                <option value="CALL">Ligação</option>
                <option value="EMAIL">Email</option>
                <option value="MEETING">Reunião</option>
                <option value="TASK">Tarefa</option>
                <option value="NOTE">Nota</option>
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]">
                <option value="">Todos os status</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando atividades...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma atividade encontrada</h3>
              <p className="text-gray-500">Comece adicionando uma nova atividade</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {activities.map((activity) => {
                  const ActivityIcon = typeIcons[activity.type];
                  const iconColor = activity.completed ? 'text-green-600' : 'text-yellow-500';
                  const bgColor = activity.completed ? 'bg-green-100' : 'bg-yellow-100';
                  return (
                    <div key={activity.id} className={`flex items-start gap-4 p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors ${activity.completed ? 'opacity-60 bg-gray-50' : ''}`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
                        <ActivityIcon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium text-gray-900 ${activity.completed ? 'line-through text-gray-400' : ''}`}>{activity.subject}</h4>
                          <Badge variant="default">{typeLabels[activity.type]}</Badge>
                          {activity.completed && <Badge variant="success">Concluída</Badge>}
                        </div>
                        {activity.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{activity.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(activity.dueDate).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                            {activity.completed && activity.completedAt && ` (Concluída em ${new Date(activity.completedAt).toLocaleDateString('pt-BR')})`}
                          </span>
                          {activity.contact && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {activity.contact.name}
                            </span>
                          )}
                          {activity.deal && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3.5 h-3.5" />
                              {activity.deal.title}
                            </span>
                          )}
                          {activity.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {activity.company.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {activity.owner.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!activity.completed && (
                          <Button variant="ghost" size="sm" onClick={() => handleComplete(activity)} className="text-green-600 hover:text-green-700" title="Marcar como concluída">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(activity)} className="text-gray-600 hover:text-gray-700" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(activity)} className="text-red-600 hover:text-red-700" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingActivity ? 'Editar Atividade' : 'Nova Atividade'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="TASK">Tarefa</option>
              <option value="CALL">Ligação</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Reunião</option>
              <option value="NOTE">Nota</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assunto *</label>
            <Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required placeholder="Ex: Ligação de follow-up" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento *</label>
            <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contato (opcional)</label>
            <Input value={formData.contactId} onChange={(e) => setFormData({...formData, contactId: e.target.value})} placeholder="ID do contato" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Negócio (opcional)</label>
            <Input value={formData.dealId} onChange={(e) => setFormData({...formData, dealId: e.target.value})} placeholder="ID do negócio" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa (opcional)</label>
            <Input value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} placeholder="ID da empresa" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : editingActivity ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}