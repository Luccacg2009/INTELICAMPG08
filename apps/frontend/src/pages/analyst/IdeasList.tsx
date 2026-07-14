import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Idea, IdeaListQuery } from '../../types/api';

export function IdeasList() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const filters: IdeaListQuery = {
    search: search || undefined,
    status: statusFilter || undefined,
    vertical: verticalFilter || undefined,
    page,
    limit: 10,
  };

  useEffect(() => {
    fetchIdeas();
  }, [filters]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ideas', { params: filters });
      setIdeas(response.data.data || response.data.ideas || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
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
  ];

  const verticalOptions = [
    { value: '', label: 'Todas as verticais' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'PRODUCT', label: 'Produto' },
    { value: 'SALES', label: 'Vendas' },
    { value: 'ENGINEERING', label: 'Engenharia' },
    { value: 'DESIGN', label: 'Design' },
    { value: 'OPERATIONS', label: 'Operações' },
    { value: 'FINANCE', label: 'Finanças' },
    { value: 'HR', label: 'RH' },
    { value: 'LEGAL', label: 'Jurídico' },
    { value: 'OTHER', label: 'Outro' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ideias para Análise</h1>
          <p className="text-gray-500 mt-1">Gerencie e analise as ideias submetidas</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, descrição ou autor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={verticalFilter}
                  onChange={(e) => setVerticalFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
                >
                  {verticalOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
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
                          <Link to={`/ideas/${idea.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {idea.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{idea.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{idea.author.name}</div>
                          <div className="text-xs text-gray-500">{idea.author.vertical}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{idea.vertical}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              idea.status === 'PENDING_REVIEW' ? 'warning' :
                              idea.status === 'APPROVED' ? 'success' :
                              idea.status === 'REJECTED' ? 'danger' :
                              idea.status === 'UNDER_REVIEW' ? 'info' :
                              'default'
                            }
                          >
                            {idea.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(idea.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/ideas/${idea.id}`}>
                            <Button variant="ghost" size="sm">Analisar</Button>
                          </Link>
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