import { Users, Lightbulb, CheckCircle, FileText, Clock, Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  users: {
    total: number;
    admins: number;
    analysts: number;
    participants: number;
    active: number;
    inactive: number;
  };
  ideas: {
    total: number;
    draft: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    inDevelopment: number;
    launched: number;
    archived: number;
  };
  feedbacks: {
    total: number;
    positive: number;
    negative: number;
  };
  postMortems: {
    total: number;
    published: number;
    draft: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    user: string;
    createdAt: string;
  }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, ideasRes, feedbacksRes, postMortemsRes, activityRes] = await Promise.allSettled([
        api.get('/users/stats'),
        api.get('/ideas/stats'),
        api.get('/feedbacks/stats'),
        api.get('/post-mortems/stats'),
        api.get('/admin/recent-activity'),
      ]);

      setStats({
        users: usersRes.status === 'fulfilled' ? usersRes.value.data : { total: 0, admins: 0, analysts: 0, participants: 0, active: 0, inactive: 0 },
        ideas: ideasRes.status === 'fulfilled' ? ideasRes.value.data : { total: 0, draft: 0, pendingReview: 0, approved: 0, rejected: 0, inDevelopment: 0, launched: 0, archived: 0 },
        feedbacks: feedbacksRes.status === 'fulfilled' ? feedbacksRes.value.data : { total: 0, positive: 0, negative: 0 },
        postMortems: postMortemsRes.status === 'fulfilled' ? postMortemsRes.value.data : { total: 0, published: 0, draft: 0 },
        recentActivity: activityRes.status === 'fulfilled' ? activityRes.value.data : [],
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total de Usuários', value: stats?.users.total || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', subtitle: `${stats?.users.active || 0} ativos` },
    { label: 'Total de Projetos', value: stats?.ideas.total || 0, icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-100', subtitle: `${stats?.ideas.pendingReview || 0} pendentes` },
    { label: 'Projetos Aprovados', value: stats?.ideas.approved || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', subtitle: `${stats?.ideas.launched || 0} lançados` },
    { label: 'Feedbacks', value: stats?.feedbacks.total || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100', subtitle: `${stats?.feedbacks.positive || 0} positivos` },
  ];

  const roleBreakdown = [
    { label: 'Administradores', value: stats?.users.admins || 0, color: 'bg-red-100 text-red-700' },
    { label: 'Analistas', value: stats?.users.analysts || 0, color: 'bg-blue-100 text-blue-700' },
    { label: 'Colaboradores', value: stats?.users.participants || 0, color: 'bg-green-100 text-green-700' },
  ];

  const ideaStatusBreakdown = [
    { label: 'Rascunho', value: stats?.ideas.draft || 0, color: 'bg-gray-100 text-gray-700' },
    { label: 'Em Análise', value: stats?.ideas.pendingReview || 0, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Aprovados', value: stats?.ideas.approved || 0, color: 'bg-green-100 text-green-700' },
    { label: 'Rejeitados', value: stats?.ideas.rejected || 0, color: 'bg-red-100 text-red-700' },
    { label: 'Desenvolvimento', value: stats?.ideas.inDevelopment || 0, color: 'bg-purple-100 text-purple-700' },
    { label: 'Lançados', value: stats?.ideas.launched || 0, color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Arquivados', value: stats?.ideas.archived || 0, color: 'bg-gray-100 text-gray-700' },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-500 mt-1">Visão geral do sistema Marketing Azul</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
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
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários por Role</h3>
            <div className="space-y-3">
              {roleBreakdown.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{role.label}</span>
                  <Badge variant="default" className={role.color}>
                    {role.value}
                  </Badge>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{stats?.users.total || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ideias por Status</h3>
            <div className="space-y-3">
              {ideaStatusBreakdown.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{status.label}</span>
                  <Badge variant="default" className={status.color}>
                    {status.value}
                  </Badge>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{stats?.ideas?.total || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post-Mortems</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Publicados</span>
                <Badge variant="success">{stats?.postMortems.published || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Rascunhos</span>
                <Badge variant="default">{stats?.postMortems.draft || 0}</Badge>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{stats?.postMortems.total || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          {stats?.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma atividade recente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Por {activity.user} • {new Date(activity.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <Badge variant="info" className="text-xs">{activity.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}