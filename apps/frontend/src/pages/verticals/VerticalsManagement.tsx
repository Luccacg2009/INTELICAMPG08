import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, ChevronLeft, ChevronRight, Edit, Trash2, BarChart2, Target, Settings, Eye, MoreVertical, Zap, Award, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { VerticalConfig, CompanyValue, VerticalBenchmark, MarketBenchmark, UserVertical } from '../../types';

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

export function VerticalsManagement() {
  const [activeTab, setActiveTab] = useState<'config' | 'values' | 'benchmarks' | 'market'>('config');
  const [verticals, setVerticals] = useState<VerticalConfig[]>([]);
  const [values, setValues] = useState<CompanyValue[]>([]);
  const [benchmarks, setBenchmarks] = useState<VerticalBenchmark[]>([]);
  const [marketBenchmarks, setMarketBenchmarks] = useState<MarketBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<UserVertical>('MARKETING');

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedVertical]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'config') {
        const res = await api.get('/verticals');
        setVerticals(res.data);
      } else if (activeTab === 'values') {
        const res = await api.get('/verticals/values/all');
        setValues(res.data);
      } else if (activeTab === 'benchmarks') {
        const res = await api.get(`/verticals/benchmarks?vertical=${selectedVertical}`);
        setBenchmarks(res.data || []);
      } else if (activeTab === 'market') {
        const res = await api.get(`/verticals/market-benchmarks/all?vertical=${selectedVertical}`);
        setMarketBenchmarks(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching verticals:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (activeTab === 'config') {
      setEditingItem(null);
      setFormData({
        vertical: '',
        name: '',
        description: '',
        values: [],
        isActive: true,
      });
    } else if (activeTab === 'values') {
      setEditingItem(null);
      setFormData({ name: '', description: '', isActive: true });
    } else if (activeTab === 'benchmarks') {
      setEditingItem(null);
      setFormData({
        vertical: selectedVertical,
        period: new Date().toISOString().split('T')[0],
        metrics: {},
      });
    } else if (activeTab === 'market') {
      setEditingItem(null);
      setFormData({
        vertical: selectedVertical,
        competitorName: '',
        period: new Date().toISOString().split('T')[0],
        metrics: {},
      });
    }
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: any, type: string) => {
    const names: Record<string, string> = { config: 'vertical', values: 'valor', benchmarks: 'benchmark', market: 'benchmark de mercado' };
    if (!window.confirm(`Tem certeza que deseja excluir este ${names[type]}?`)) return;
    try {
      if (type === 'config') {
        await api.put(`/verticals/${item.vertical}`, { ...item, isActive: false });
      } else if (type === 'values') {
        await api.delete(`/verticals/values/${item.id}`);
      } else if (type === 'benchmarks') {
        await api.delete(`/verticals/benchmarks/${item.id}`);
      } else if (type === 'market') {
        await api.delete(`/verticals/market-benchmarks/${item.id}`);
      }
      toast.success(`${names[type].charAt(0).toUpperCase() + names[type].slice(1)} excluído`);
      fetchData();
    } catch (error) {
      toast.error(`Erro ao excluir ${names[type]}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'config') {
        if (editingItem) {
          await api.put(`/verticals/${editingItem.vertical}`, formData);
          toast.success('Vertical atualizada');
        } else {
          await api.post('/verticals', formData);
          toast.success('Vertical criada');
        }
      } else if (activeTab === 'values') {
        if (editingItem) {
          await api.put(`/verticals/values/${editingItem.id}`, formData);
          toast.success('Valor atualizado');
        } else {
          await api.post('/verticals/values', formData);
          toast.success('Valor criado');
        }
      } else if (activeTab === 'benchmarks') {
        if (editingItem) {
          await api.put(`/verticals/benchmarks/${editingItem.id}`, formData);
          toast.success('Benchmark atualizado');
        } else {
          await api.post('/verticals/benchmarks', formData);
          toast.success('Benchmark criado');
        }
      } else if (activeTab === 'market') {
        if (editingItem) {
          await api.put(`/verticals/market-benchmarks/${editingItem.id}`, formData);
          toast.success('Benchmark de mercado atualizado');
        } else {
          await api.post('/verticals/market-benchmarks', formData);
          toast.success('Benchmark de mercado criado');
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'config', label: 'Configuração', icon: Settings },
    { id: 'values', label: 'Valores da Empresa', icon: Award },
    { id: 'benchmarks', label: 'Benchmarks Internos', icon: BarChart2 },
    { id: 'market', label: 'Benchmarks de Mercado', icon: TrendingUp },
  ];

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Verticais</h1>
          <p className="text-gray-500 mt-1">Configure verticais, valores, benchmarks e metas</p>
        </div>
        <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
          {activeTab === 'config' ? 'Nova Vertical' : activeTab === 'values' ? 'Novo Valor' : activeTab === 'benchmarks' ? 'Novo Benchmark' : 'Novo Competidor'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'benchmarks' || activeTab === 'market' ? (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Vertical:</label>
                <select
                  value={selectedVertical}
                  onChange={(e) => { setSelectedVertical(e.target.value as UserVertical); fetchData(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(verticalLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div className="p-6">
            {activeTab === 'config' && (
              <div className="space-y-4">
                {verticals.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma vertical configurada</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {verticals.map(v => (
                      <Card key={v.vertical} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{verticalLabels[v.vertical] || v.vertical}</h3>
                            <p className="text-sm text-gray-500">{v.name}</p>
                          </div>
                          <Badge variant={v.isActive ? 'success' : 'danger'}>{v.isActive ? 'Ativa' : 'Inativa'}</Badge>
                        </div>
                        {v.description && <p className="text-sm text-gray-600 mb-3">{v.description}</p>}
                        {v.values && v.values.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {v.values.slice(0, 5).map(val => (
                              <span key={val} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{val}</span>
                            ))}
                            {v.values.length > 5 && <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">+{v.values.length - 5}</span>}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(v)} className="text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(v, 'config')} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'values' && (
              <div className="space-y-4">
                {values.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum valor definido</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {values.map(v => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{v.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{v.description}</td>
                            <td className="px-6 py-4"><Badge variant={v.isActive ? 'success' : 'danger'}>{v.isActive ? 'Ativo' : 'Inativo'}</Badge></td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(v)} className="text-blue-600"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(v, 'values')} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'benchmarks' && (
              <div className="space-y-4">
                {benchmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum benchmark para {verticalLabels[selectedVertical]}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Métricas</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {benchmarks.map(b => (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{new Date(b.period).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{Object.entries(b.metrics || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}</td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(b)} className="text-blue-600"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(b, 'benchmarks')} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-4">
                {marketBenchmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum benchmark de mercado para {verticalLabels[selectedVertical]}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concorrente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Métricas</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {marketBenchmarks.map(b => (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{b.competitorName}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.period).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{Object.entries(b.metrics || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}</td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(b)} className="text-blue-600"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(b, 'market')} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Editar ${activeTab === 'config' ? 'Vertical' : activeTab === 'values' ? 'Valor' : activeTab === 'benchmarks' ? 'Benchmark' : 'Competidor'}` : `Nova ${activeTab === 'config' ? 'Vertical' : activeTab === 'values' ? 'Valor' : activeTab === 'benchmarks' ? 'Benchmark' : 'Competidor'}`}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          {activeTab === 'config' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vertical *</label>
                <select value={formData.vertical} onChange={(e) => setFormData({...formData, vertical: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required disabled={editingItem}>
                  <option value="">Selecione...</option>
                  {Object.entries(verticalLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valores (um por linha)</label>
                <textarea value={formData.values?.join('\n') || ''} onChange={(e) => setFormData({...formData, values: e.target.value.split('\n').filter(v => v.trim())})} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Ativa</label>
              </div>
            </>
          )}

          {activeTab === 'values' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Ativo</label>
              </div>
            </>
          )}

          {activeTab === 'benchmarks' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                <select value={formData.vertical} onChange={(e) => setFormData({...formData, vertical: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                  {Object.entries(verticalLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período *</label>
                <Input type="date" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Métricas (JSON)</label>
                <textarea value={JSON.stringify(formData.metrics || {}, null, 2)} onChange={(e) => { try { setFormData({...formData, metrics: JSON.parse(e.target.value)}); } catch {} }} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" placeholder='{"metric1": 100, "metric2": 200}' />
              </div>
            </>
          )}

          {activeTab === 'market' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                <select value={formData.vertical} onChange={(e) => setFormData({...formData, vertical: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                  {Object.entries(verticalLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Concorrente *</label>
                <Input value={formData.competitorName} onChange={(e) => setFormData({...formData, competitorName: e.target.value})} required placeholder="Ex: Competidor X" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período *</label>
                <Input type="date" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Métricas (JSON)</label>
                <textarea value={JSON.stringify(formData.metrics || {}, null, 2)} onChange={(e) => { try { setFormData({...formData, metrics: JSON.parse(e.target.value)}); } catch {} }} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" placeholder='{"market_share": 15, "revenue": 5000000}' />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : editingItem ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}