import { useState, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, Filter, Clock, CheckCircle, XCircle, AlertCircle, FileText, Edit, Trash2, Send, Sparkles, Download } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { Project, ProjectStatus, ProjectPriority, ProjectPriorityColor, UserVertical } from '../../types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
};

const priorityColorLabels: Record<ProjectPriorityColor, string> = {
  GREEN: 'Verde (Alta)',
  YELLOW: 'Amarelo (Média)',
  RED: 'Vermelho (Baixa)',
};

const priorityColorMap: Record<ProjectPriority, ProjectPriorityColor> = {
  HIGH: 'GREEN',
  MEDIUM: 'YELLOW',
  LOW: 'RED',
};

const priorityColorVariants: Record<ProjectPriorityColor, 'success' | 'warning' | 'danger'> = {
  GREEN: 'success',
  YELLOW: 'warning',
  RED: 'danger',
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

interface ProjectsListResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

export function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    centralIdea: '',
    targetAudience: '',
    accessPassword: '',
    reason: '',
    budget: '',
    timeline: '',
    priority: 'MEDIUM' as ProjectPriority,
    vertical: 'MARKETING' as UserVertical,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [page, search, statusFilter, verticalFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(verticalFilter && { vertical: verticalFilter }),
      });
      const response = await api.get<ProjectsListResponse>(`/projects?${params}`);
      setProjects(response.data.data || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(Math.ceil((response.data.total || 0) / 10));
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      centralIdea: '',
      targetAudience: '',
      accessPassword: '',
      reason: '',
      budget: '',
      timeline: '',
      priority: 'MEDIUM',
      vertical: 'MARKETING',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      centralIdea: project.centralIdea,
      targetAudience: project.targetAudience,
      accessPassword: '',
      reason: project.reason || '',
      budget: project.budget?.toString() || '',
      timeline: project.timeline || '',
      priority: project.priority,
      vertical: project.vertical,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        centralIdea: formData.centralIdea,
        targetAudience: formData.targetAudience,
        accessPassword: formData.accessPassword,
        reason: formData.reason,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        timeline: formData.timeline || undefined,
        priority: formData.priority,
        vertical: formData.vertical,
      };

      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, data);
        toast.success('Projeto atualizado com sucesso');
      } else {
        await api.post('/projects', data);
        toast.success('Projeto criado com sucesso');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar projeto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Tem certeza que deseja excluir o projeto "${project.title}"?`)) {
      return;
    }
    try {
      await api.delete(`/projects/${project.id}`);
      toast.success('Projeto excluído com sucesso');
      fetchProjects();
    } catch (error) {
      toast.error('Erro ao excluir projeto');
    }
  };

  const handleSubmitForReview = async (project: Project) => {
    try {
      await api.post(`/projects/${project.id}/submit-review`);
      toast.success('Projeto enviado para revisão');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar para revisão');
    }
  };

  const handleGenerateAiSummary = async (project: Project) => {
    try {
      await api.post(`/projects/${project.id}/ai-summary`);
      toast.success('Resumo por IA gerado');
      fetchProjects();
    } catch (error) {
      toast.error('Erro ao gerar resumo por IA');
    }
  };

  const handleDownloadPdf = async (project: Project) => {
    try {
      const response = await api.get(`/projects/${project.id}/pdf`, { responseType: 'blob' });
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

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'PENDING_REVIEW', label: 'Em Análise' },
    { value: 'APPROVED', label: 'Aprovado' },
    { value: 'REJECTED', label: 'Rejeitado' },
    { value: 'IN_DEVELOPMENT', label: 'Em Desenvolvimento' },
    { value: 'LAUNCHED', label: 'Lançado' },
    { value: 'ARCHIVED', label: 'Arquivado' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-500 mt-1">Gerencie projetos de marketing da Azul</p>
        </div>
        <Button onClick={() => navigate('/projects/new')} leftIcon={<Plus className="w-4 h-4" />}>
          Novo Projeto
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar projetos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={verticalFilter}
                onChange={(e) => { setVerticalFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
              >
                <option value="">Todas as verticais</option>
                {Object.entries(verticalLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando projetos...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum projeto encontrado</h3>
              <p className="text-gray-500">Comece criando seu primeiro projeto</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertical</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{project.title}</p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{project.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{verticalLabels[project.vertical] || project.vertical}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={priorityColorVariants[(project.priorityColor as ProjectPriorityColor) || priorityColorMap[project.priority]]}>
                            {priorityLabels[project.priority] || project.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusColors[project.status]}>
                            {statusLabels[project.status] || project.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{project.author?.name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(project)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSubmitForReview(project)}
                              disabled={project.status !== 'DRAFT'}
                              className="text-green-600 hover:text-green-700"
                              title="Enviar para revisão"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGenerateAiSummary(project)}
                              className="text-purple-600 hover:text-purple-700"
                              title="Resumo IA"
                            >
                              <Sparkles className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPdf(project)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Baixar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(project)}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir"
                            >
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
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, total)} de {total} resultados
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Editar Projeto' : 'Novo Projeto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Ex: Campanha de Verão 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vertical *</label>
              <select
                value={formData.vertical}
                onChange={(e) => setFormData({ ...formData, vertical: e.target.value as UserVertical })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Object.entries(verticalLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Descrição breve do projeto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ideia Central *</label>
            <textarea
              value={formData.centralIdea}
              onChange={(e) => setFormData({ ...formData, centralIdea: e.target.value })}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Qual é a ideia central deste projeto?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Público-Alvo *</label>
            <textarea
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Para quem este projeto é direcionado?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha de Acesso *</label>
            <Input
              type="password"
              value={formData.accessPassword}
              onChange={(e) => setFormData({ ...formData, accessPassword: e.target.value })}
              required
              placeholder="Senha para acessar o projeto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (Opcional)</label>
            <Input
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Motivo da vertical estar desenvolvendo o projeto"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
              <Input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <Input
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="Ex: 3 meses"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade (Calculada automaticamente)</label>
              <div className="flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <Badge variant={priorityColorVariants[priorityColorMap[formData.priority as ProjectPriority] || 'YELLOW']}>
                  {priorityColorLabels[priorityColorMap[formData.priority as ProjectPriority] || 'YELLOW']}
                </Badge>
                <span className="text-sm text-gray-600">
                  {priorityLabels[formData.priority as ProjectPriority] || 'Média'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Baseada em benchmarks históricos da vertical selecionada
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editingProject ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
