import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, Lightbulb, BarChart2, Download, Eye, Trash2, Filter } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { Idea, IdeaStatus } from '../../types';
import { toast } from 'react-hot-toast';

interface IdeaListResponse {
  data: Idea[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface IdeaStats {
  total: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  inDevelopment: number;
  launched: number;
  archived: number;
  byVertical: Record<string, number>;
}

const statusLabels: Record<IdeaStatus, string> = {
  PENDING_REVIEW: 'Aguardando Análise',
  UNDER_REVIEW: 'Em Análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  IN_DEVELOPMENT: 'Em Desenvolvimento',
  LAUNCHED: 'Lançada',
  ARCHIVED: 'Arquivada',
  AI_DELETION_REQUESTED: 'Exclusão por IA Solicitada',
  DELETED_BY_AI: 'Excluída por IA',
};

const statusColors: Record<IdeaStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_REVIEW: 'warning',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  IN_DEVELOPMENT: 'info',
  LAUNCHED: 'success',
  ARCHIVED: 'default',
  AI_DELETION_REQUESTED: 'warning',
  DELETED_BY_AI: 'danger',
};

const verticalLabels: Record<string, string> = {
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

export function AdminIdeasOverview() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [stats, setStats] = useState<IdeaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchIdeas();
    fetchStats();
  }, [page, search, statusFilter, verticalFilter]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(verticalFilter && { vertical: verticalFilter }),
      });
      const response = await api.get<IdeaListResponse>(`/ideas?${params}`);
      setIdeas(response.data.data || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Erro ao carregar ideias');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<IdeaStats>('/ideas/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async (idea: Idea) => {
    if (!window.confirm(`Tem certeza que deseja excluir a ideia "${idea.title}"?`)) {
      return;
    }
    try {
      await api.delete(`/ideas/${idea.id}`);
      toast.success('Ideia excluída com sucesso');
      fetchIdeas();
      fetchStats();
    } catch (error) {
      toast.error('Erro ao excluir ideia');
    }
  };

  const handleDownloadPdf = async (idea: Idea) => {
    try {
      const response = await api.get(`/ideas/${idea.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ideia-${idea.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erro ao baixar PDF');
    }
  };

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'PENDING_REVIEW', label: 'Aguardando Análise' },
    { value: 'UNDER_REVIEW', label: 'Em Análise' },
    { value: 'APPROVED', label: 'Aprovada' },
    { value: 'REJECTED', label: 'Rejeitada' },
    { value: 'IN_DEVELOPMENT', label: 'Em Desenvolvimento' },
    { value: 'LAUNCHED', label: 'Lançada' },
    { value: 'ARCHIVED', label: 'Arquivada' },
    { value: 'AI_DELETION_REQUESTED', label: 'Exclusão por IA Solicitada' },
    { value: 'DELETED_BY_AI', label: 'Excluída por IA' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral de Ideias (Admin)</h1>
          <p className="text-gray-500 mt-1">Gerencie todas as ideias da plataforma</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Exportar CSV
          </Button>
          <Button variant="outline" leftIcon={<BarChart2 className="w-4 h-4" />}>
            Relatório
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Ideias</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aguardando Análise</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aprovadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Em Desenvolvimento</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inDevelopment}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por título, descrição ou autor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} leftIcon={<Filter className="w-4 h-4" />}>
                  Filtros
                </Button>
                <Button type="submit" leftIcon={<Search className="w-4 h-4" />}>
                  Buscar
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-gray-100">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px] flex-1"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={verticalFilter}
                  onChange={(e) => { setVerticalFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px] flex-1"
                >
                  <option value="">Todas as verticais</option>
                  {Object.entries(verticalLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando ideias...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="p-8 text-center">
              <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma ideia encontrada</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou busque por outros termos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ideia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertical</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ideas.map((idea) => (
                      <tr key={idea.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <a href={`/ideas/${idea.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {idea.title}
                          </a>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{idea.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{idea.author.name}</div>
                          <div className="text-xs text-gray-500">{idea.author.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{verticalLabels[idea.vertical] || idea.vertical}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusColors[idea.status]}>
                            {statusLabels[idea.status] || idea.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(idea.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPdf(idea)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Baixar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/ideas/${idea.id}`}
                              className="text-gray-600 hover:text-gray-700"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(idea)}
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
    </div>
  );
}