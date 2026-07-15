import { Lightbulb, MessageSquare, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { api } from '../../services/api';
import { useEffect, useState } from 'react';
import { Idea } from '../../types';

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalIdeas: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    myFeedbacks: 0,
  });
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentIdeas();
  }, []);

  const fetchStats = async () => {
    try {
      const [ideasRes, feedbacksRes] = await Promise.all([
        api.get('/ideas', { params: { limit: 100 } }),
        api.get('/feedbacks/my-feedbacks'),
      ]);
      const ideas = ideasRes.data.data || ideasRes.data.ideas || ideasRes.data;
      setStats({
        totalIdeas: ideas.length,
        pendingReview: ideas.filter((i: Idea) => i.status === 'PENDING_REVIEW').length,
        approved: ideas.filter((i: Idea) => i.status === 'APPROVED').length,
        rejected: ideas.filter((i: Idea) => i.status === 'REJECTED').length,
        myFeedbacks: feedbacksRes.data.data?.length || feedbacksRes.data.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentIdeas = async () => {
    try {
      const response = await api.get('/ideas', { params: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' } });
      setRecentIdeas(response.data.data || response.data.ideas || response.data);
    } catch (error) {
      console.error('Error fetching recent ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total de Ideias', value: stats.totalIdeas, icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Aguardando Análise', value: stats.pendingReview, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Aprovadas', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Rejeitadas', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard do Analista</h1>
          <p className="text-gray-500 mt-1">Bem-vindo, {user?.name}! Acompanhe as ideias para análise.</p>
        </div>
        <Link to="/ideas/new">
          <Button variant="primary"><Lightbulb className="w-4 h-4" /> Nova Ideia</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ideias Recentes para Análise</CardTitle>
            <Link to="/ideas" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Carregando...</div>
            ) : recentIdeas.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Nenhuma ideia encontrada</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentIdeas.map((idea) => (
                  <Link to={`/ideas/${idea.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{idea.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{idea.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="info">{idea.vertical}</Badge>
                          <Badge variant={idea.status === 'PENDING_REVIEW' ? 'warning' : idea.status === 'APPROVED' ? 'success' : 'danger'}>
                            {idea.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/ideas" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Lightbulb className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="font-medium text-gray-900">Ver todas as ideias</p>
                  <p className="text-sm text-gray-500">Lista completa de ideias submetidas</p>
                </div>
              </div>
            </Link>
            <Link to="/feedbacks" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><MessageSquare className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="font-medium text-gray-900">Meus Feedbacks</p>
                  <p className="text-sm text-gray-500">{stats.myFeedbacks} feedbacks enviados</p>
                </div>
              </div>
            </Link>
            <Link to="/ideas/new" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><Lightbulb className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="font-medium text-gray-900">Submeter nova ideia</p>
                  <p className="text-sm text-gray-500">Contribua com sua ideia de produto</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}