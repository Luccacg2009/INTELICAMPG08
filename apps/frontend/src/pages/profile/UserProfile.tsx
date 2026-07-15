import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Building2, Shield, Eye, EyeOff, Save, Loader2, Camera, Settings, Bell, Palette, Key, LogOut, AlertCircle, Sun, Moon, Monitor, Smartphone, Globe, Wifi, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import { toast } from 'react-hot-toast';
import { UserRole, UserVertical } from '../../types';

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ANALYST: 'Analista',
  WORKER: 'Colaborador',
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

export function UserProfile() {
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance' | 'sessions'>('profile');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    vertical: (user?.vertical as UserVertical) || 'MARKETING',
    avatarUrl: user?.avatarUrl || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    ideaUpdates: true,
    feedbackReceived: true,
    dailyDigest: false,
    weeklyReport: false,
  });
  const [appearance, setAppearance] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    density: 'comfortable' as 'compact' | 'comfortable' | 'spacious',
  });
  const [sessions] = useState<Array<{id: string; device: string; browser: string; location: string; lastActive: string; current: boolean}>>([
    { id: '1', device: 'Este dispositivo', browser: 'Chrome no Linux', location: 'São Paulo, BR', lastActive: 'Agora', current: true },
    { id: '2', device: 'iPhone', browser: 'Safari no iOS', location: 'Rio de Janeiro, BR', lastActive: '2 dias atrás', current: false },
  ]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        vertical: (user.vertical as UserVertical) || 'MARKETING',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/me', {
        name: formData.name,
        vertical: formData.vertical,
        avatarUrl: formData.avatarUrl,
      });
      updateUser({ ...user!, name: formData.name, vertical: formData.vertical, avatarUrl: formData.avatarUrl });
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Senha alterada com sucesso');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'sessions', label: 'Sessões', icon: Smartphone },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações da Conta</h1>
        <p className="text-gray-500 mt-1">Gerencie seu perfil, segurança e preferências</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-64 border-r border-gray-200 bg-gray-50">
              <nav className="p-4 space-y-1" aria-label="Configurações">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    {tab.label}
                  </button>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                </div>
              </nav>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {formData.avatarUrl ? (
                          <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-blue-600">{formData.name?.charAt(0).toUpperCase() || 'U'}</span>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => setFormData({...formData, avatarUrl: event.target?.result as string});
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <Camera className="w-4 h-4 text-white" />
                      </label>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{formData.name || 'Usuário'}</h2>
                      <p className="text-gray-500">{formData.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="info">{roleLabels[user?.role || 'WORKER']}</Badge>
                        <Badge variant="default" className="bg-gray-100 text-gray-700">{verticalLabels[formData.vertical] || formData.vertical}</Badge>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input type="email" value={formData.email} disabled className="bg-gray-50" />
                        <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                      <select value={formData.vertical} onChange={(e) => setFormData({...formData, vertical: e.target.value as UserVertical})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {Object.entries(verticalLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL do Avatar</label>
                      <Input value={formData.avatarUrl} onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} placeholder="https://exemplo.com/avatar.png" />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Key className="w-5 h-5" />Alterar Senha</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            placeholder="Digite sua senha atual"
                          />
                          <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            placeholder="Mínimo 8 caracteres"
                          />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            placeholder="Confirme a nova senha"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" disabled={saving}>{saving ? 'Alterando...' : 'Alterar Senha'}</Button>
                    </form>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5" />Sessões Ativas</h3>
                    {sessions.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Nenhuma outra sessão ativa</p>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map(session => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{session.device} {session.current && <Badge variant="success" className="text-xs ml-2">Atual</Badge>}</p>
                                <p className="text-sm text-gray-500">{session.browser} • {session.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Último acesso: {session.lastActive}</span>
                              {!session.current && <Button variant="ghost" size="sm" className="text-red-600">Encerrar</Button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" />Zona de Perigo</h3>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 mb-4">A exclusão da conta é irreversível. Todos os seus dados serão permanentemente removidos.</p>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => { if (confirm('Tem certeza que deseja excluir sua conta?')) alert('Funcionalidade não implementada') }}>
                        Excluir Minha Conta
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5" />Preferências de Notificação</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Notificações por Email</p>
                        <p className="text-sm text-gray-500">Receber notificações via email</p>
                      </div>
                      <input type="checkbox" checked={notifications.emailEnabled} onChange={(e) => setNotifications({...notifications, emailEnabled: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-[0.7]">
                      <div>
                        <p className="font-medium text-gray-900">Atualizações de Ideias</p>
                        <p className="text-sm text-gray-500">Quando suas ideias forem revisadas</p>
                      </div>
                      <input type="checkbox" checked={notifications.ideaUpdates} onChange={(e) => setNotifications({...notifications, ideaUpdates: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" disabled={!notifications.emailEnabled} />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-[0.7]">
                      <div>
                        <p className="font-medium text-gray-900">Feedbacks Recebidos</p>
                        <p className="text-sm text-gray-500">Quando alguém der feedback nas suas ideias</p>
                      </div>
                      <input type="checkbox" checked={notifications.feedbackReceived} onChange={(e) => setNotifications({...notifications, feedbackReceived: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" disabled={!notifications.emailEnabled} />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-[0.7]">
                      <div>
                        <p className="font-medium text-gray-900">Resumo Diário</p>
                        <p className="text-sm text-gray-500">Resumo das atividades do dia</p>
                      </div>
                      <input type="checkbox" checked={notifications.dailyDigest} onChange={(e) => setNotifications({...notifications, dailyDigest: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" disabled={!notifications.emailEnabled} />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-[0.7]">
                      <div>
                        <p className="font-medium text-gray-900">Relatório Semanal</p>
                        <p className="text-sm text-gray-500">Resumo semanal de métricas</p>
                      </div>
                      <input type="checkbox" checked={notifications.weeklyReport} onChange={(e) => setNotifications({...notifications, weeklyReport: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" disabled={!notifications.emailEnabled} />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Palette className="w-5 h-5" />Aparência</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Claro', icon: <Sun className="w-5 h-5" /> },
                          { value: 'dark', label: 'Escuro', icon: <Moon className="w-5 h-5" /> },
                          { value: 'system', label: 'Sistema', icon: <Monitor className="w-5 h-5" /> },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setAppearance({...appearance, theme: opt.value as any})}
                            className={`p-4 rounded-lg border-2 transition-colors ${appearance.theme === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="flex items-center justify-center gap-2 mb-2">{opt.icon}</div>
                            <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Densidade da Interface</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'compact', label: 'Compacta' },
                          { value: 'comfortable', label: 'Confortável' },
                          { value: 'spacious', label: 'Espaçosa' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setAppearance({...appearance, density: opt.value as any})}
                            className={`p-4 rounded-lg border-2 transition-colors ${appearance.density === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Smartphone className="w-5 h-5" />Sessões Ativas</h3>
                  {sessions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma outra sessão ativa</p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map(session => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{session.device} {session.current && <Badge variant="success" className="text-xs ml-2">Atual</Badge>}</p>
                              <p className="text-sm text-gray-500">{session.browser} • {session.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Último acesso: {session.lastActive}</span>
                            {!session.current && <Button variant="ghost" size="sm" className="text-red-600">Encerrar</Button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}