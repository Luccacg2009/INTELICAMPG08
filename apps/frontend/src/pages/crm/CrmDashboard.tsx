import { useState, useEffect } from 'react';
import { Users, Building2, Target, DollarSign, Plus, Search, Loader2, ChevronLeft, ChevronRight, Filter, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalCompanies: number;
  totalContacts: number;
  totalDeals: number;
  totalValue: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  activitiesThisWeek: number;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  company: { name: string };
  contact: { name: string };
  owner: { name: string };
  expectedCloseDate: string;
  probability: number;
}

export function CrmDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [statsRes, dealsRes] = await Promise.allSettled([
        api.get('/crm/dashboard'),
        api.get('/crm/deals?limit=5&sort=createdAt&order=desc'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
      if (dealsRes.status === 'fulfilled') {
        setRecentDeals(dealsRes.value.data.data || dealsRes.value.data);
      }
    } catch (error) {
      console.error('Error fetching CRM dashboard:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Empresas', value: stats?.totalCompanies || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Contatos', value: stats?.totalContacts || 0, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Negócios Ativos', value: stats?.openDeals || 0, icon: Target, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Valor Total', value: stats?.totalValue ? `R$ ${(stats.totalValue / 1000).toFixed(1)}k` : 'R$ 0', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral do pipeline de vendas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Plus className="w-4 h-4" />}>Nova Empresa</Button>
          <Button leftIcon={<Plus className="w-4 h-4" />}>Novo Negócio</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Negócios Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum negócio encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negócio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estágio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{deal.title}</p>
                          <p className="text-sm text-gray-500">{deal.contact.name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{deal.company.name}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">R$ {deal.value.toLocaleString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{deal.stage}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Taxa de Conversão</span>
                  <span className="font-medium text-gray-900">{stats && stats.totalDeals > 0 ? ((stats.wonDeals / stats.totalDeals) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: stats && stats.totalDeals > 0 ? `${(stats.wonDeals / stats.totalDeals) * 100}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Negócios Ganhos</span>
                  <span className="font-medium text-green-600">{stats?.wonDeals || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: stats && stats.totalDeals > 0 ? `${(stats.wonDeals / stats.totalDeals) * 100}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Negócios Perdidos</span>
                  <span className="font-medium text-red-600">{stats?.lostDeals || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: stats && stats.totalDeals > 0 ? `${(stats.lostDeals / stats.totalDeals) * 100}%` : '0%' }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Atividades esta semana</span>
                  <span className="font-medium text-gray-900">{stats?.activitiesThisWeek || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}