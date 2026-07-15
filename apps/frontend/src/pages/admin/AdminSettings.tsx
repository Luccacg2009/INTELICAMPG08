import { useState } from 'react';
import { Save, Loader2, Eye, EyeOff, Palette, Shield, Plug, Wrench, Bell, Globe, Paintbrush, Key, Users, Lock, Mail, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface SystemSettings {
  general: {
    platformName: string;
    baseUrl: string;
    defaultLanguage: string;
    timezone: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    ideaCreated: boolean;
    ideaReviewed: boolean;
    feedbackReceived: boolean;
    dailyDigest: boolean;
  };
  security: {
    passwordMinLength: number;
    require2FA: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    primaryColor: string;
    logoUrl: string;
  };
  integrations: {
    openaiEnabled: boolean;
    openaiModel: string;
    sendgridEnabled: boolean;
    sendgridApiKey: string;
    webhookEnabled: boolean;
    webhookUrl: string;
    webhookSecret: string;
    webhookEvents: string[];
  };
}

type TabType = 'general' | 'notifications' | 'security' | 'appearance' | 'integrations';

const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', label: 'Geral', icon: Wrench },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'integrations', label: 'Integrações', icon: Plug },
];

const defaultSettings: SystemSettings = {
  general: {
    platformName: 'Marketing Azul',
    baseUrl: window.location.origin,
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    maintenanceMode: false,
    allowRegistration: true,
  },
  notifications: {
    emailEnabled: true,
    slackEnabled: false,
    ideaCreated: true,
    ideaReviewed: true,
    feedbackReceived: true,
    dailyDigest: false,
  },
  security: {
    passwordMinLength: 8,
    require2FA: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  },
  appearance: {
    theme: 'system',
    primaryColor: '#2563eb',
    logoUrl: '',
  },
  integrations: {
    openaiEnabled: true,
    openaiModel: 'gpt-4',
    sendgridEnabled: false,
    sendgridApiKey: '',
    webhookEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    webhookEvents: [],
  },
};

function handleChange<T>(settings: SystemSettings, section: keyof SystemSettings, key: string, value: any): SystemSettings {
  return {
    ...settings,
    [section]: {
      ...settings[section],
      [key]: value,
    },
  };
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSendgridKey, setShowSendgridKey] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await api.get<SystemSettings>('/admin/settings');
      setSettings({ ...defaultSettings, ...response.data });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // We don't have the backend endpoint yet, so just use defaults

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.patch('/admin/settings', settings);
      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-500 mt-1">Gerencie as configurações globais da plataforma</p>
          </div>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-500 mt-1">Gerencie as configurações globais da plataforma</p>
        </div>
        <Button onClick={handleSave} disabled={saving} leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-48 border-r border-gray-200">
              <nav className="p-4 space-y-1" aria-label="Configurações">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {activeTab === 'general' && (
                <div className="space-y-6 max-w-2xl">
                  <h2 className="text-lg font-semibold text-gray-900">Configurações Gerais</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Plataforma</label>
                      <Input
                        value={settings.general.platformName}
                        onChange={(e) => setSettings(handleChange(settings, 'general', 'platformName', e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL Base</label>
                      <Input
                        value={settings.general.baseUrl}
                        onChange={(e) => setSettings(handleChange(settings, 'general', 'baseUrl', e.target.value))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Idioma Padrão</label>
                        <select
                          value={settings.general.defaultLanguage}
                          onChange={(e) => setSettings(handleChange(settings, 'general', 'defaultLanguage', e.target.value))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es-ES">Español</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => setSettings(handleChange(settings, 'general', 'timezone', e.target.value))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                          <option value="America/New_York">Nova York (UTC-5)</option>
                          <option value="Europe/London">Londres (UTC+0)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => setSettings(handleChange(settings, 'general', 'maintenanceMode', e.target.checked))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="maintenanceMode" className="text-sm text-gray-700">Modo de Manutenção</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="allowRegistration"
                        checked={settings.general.allowRegistration}
                        onChange={(e) => setSettings(handleChange(settings, 'general', 'allowRegistration', e.target.checked))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="allowRegistration" className="text-sm text-gray-700">Permitir Registro Público</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 max-w-2xl">
                  <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="emailEnabled"
                        checked={settings.notifications.emailEnabled}
                        onChange={(e) => setSettings(handleChange(settings, 'notifications', 'emailEnabled', e.target.checked))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="emailEnabled" className="text-sm text-gray-700">Habilitar Notificações por Email</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="slackEnabled"
                        checked={settings.notifications.slackEnabled}
                        onChange={(e) => setSettings(handleChange(settings, 'notifications', 'slackEnabled', e.target.checked))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="slackEnabled" className="text-sm text-gray-700">Integração com Slack</label>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-3">Notificar quando:</p>
                      <div className="space-y-2">
                        {[
                          { key: 'ideaCreated', label: 'Nova ideia criada' },
                          { key: 'ideaReviewed', label: 'Ideia revisada' },
                          { key: 'feedbackReceived', label: 'Feedback recebido' },
                          { key: 'dailyDigest', label: 'Resumo diário' },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications[key as keyof typeof settings.notifications]}
                              onChange={(e) => setSettings(handleChange(settings, 'notifications', key, e.target.checked))}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6 max-w-2xl">
                  <h2 className="text-lg font-semibold text-gray-900">Segurança</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho Mínimo da Senha</label>
                      <Input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => setSettings(handleChange(settings, 'security', 'passwordMinLength', parseInt(e.target.value) || 8))}
                        min={6}
                        max={32}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="require2FA"
                        checked={settings.security.require2FA}
                        onChange={(e) => setSettings(handleChange(settings, 'security', 'require2FA', e.target.checked))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="require2FA" className="text-sm text-gray-700">Exigir autenticação de dois fatores (2FA)</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Sessão (minutos)</label>
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings(handleChange(settings, 'security', 'sessionTimeout', parseInt(e.target.value) || 60))}
                        min={15}
                        max={1440}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de Tentativas de Login</label>
                      <Input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => setSettings(handleChange(settings, 'security', 'maxLoginAttempts', parseInt(e.target.value) || 5))}
                        min={3}
                        max={20}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6 max-w-2xl">
                  <h2 className="text-lg font-semibold text-gray-900">Aparência</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                      <select
                        value={settings.appearance.theme}
                        onChange={(e) => setSettings(handleChange(settings, 'appearance', 'theme', e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                        <option value="system">Sistema</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={settings.appearance.primaryColor}
                          onChange={(e) => setSettings(handleChange(settings, 'appearance', 'primaryColor', e.target.value))}
                          className="w-20 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={settings.appearance.primaryColor}
                          onChange={(e) => setSettings(handleChange(settings, 'appearance', 'primaryColor', e.target.value))}
                          className="w-40 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL do Logo</label>
                      <Input
                        value={settings.appearance.logoUrl}
                        onChange={(e) => setSettings(handleChange(settings, 'appearance', 'logoUrl', e.target.value))}
                        placeholder="https://exemplo.com/logo.png"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6 max-w-2xl">
                  <h2 className="text-lg font-semibold text-gray-900">Integrações</h2>
                  <div className="space-y-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">OpenAI</h3>
                        <input
                          type="checkbox"
                          checked={settings.integrations.openaiEnabled}
                          onChange={(e) => setSettings(handleChange(settings, 'integrations', 'openaiEnabled', e.target.checked))}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                        <select
                          value={settings.integrations.openaiModel}
                          onChange={(e) => setSettings(handleChange(settings, 'integrations', 'openaiModel', e.target.value))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">SendGrid (Email)</h3>
                        <input
                          type="checkbox"
                          checked={settings.integrations.sendgridEnabled}
                          onChange={(e) => setSettings(handleChange(settings, 'integrations', 'sendgridEnabled', e.target.checked))}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                        <div className="relative">
                          <Input
                            type={showSendgridKey ? 'text' : 'password'}
                            value={settings.integrations.sendgridApiKey}
                            onChange={(e) => setSettings(handleChange(settings, 'integrations', 'sendgridApiKey', e.target.value))}
                            placeholder="SG.xxxxxxxxxxxx"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSendgridKey(!showSendgridKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showSendgridKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-4">Webhooks</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          id="webhookEnabled"
                          checked={settings.integrations.webhookEnabled}
                          onChange={(e) => setSettings(handleChange(settings, 'integrations', 'webhookEnabled', e.target.checked))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="webhookEnabled" className="text-sm text-gray-700">Habilitar Webhooks</label>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL do Webhook</label>
                          <Input
                            value={settings.integrations.webhookUrl}
                            onChange={(e) => setSettings(handleChange(settings, 'integrations', 'webhookUrl', e.target.value))}
                            placeholder="https://seu-sistema.com/webhook"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Secret (para validação)</label>
                          <Input
                            type="password"
                            value={settings.integrations.webhookSecret}
                            onChange={(e) => setSettings(handleChange(settings, 'integrations', 'webhookSecret', e.target.value))}
                            placeholder="Secret para validar assinatura"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Eventos</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'idea.created',
                              'idea.updated',
                              'idea.reviewed',
                              'feedback.created',
                              'user.created',
                              'postmortem.created',
                            ].map((event) => (
                              <label key={event} className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.integrations.webhookEvents.includes(event)}
                                  onChange={(e) => {
                                    const events = [...settings.integrations.webhookEvents];
                                    if (e.target.checked) {
                                      events.push(event);
                                    } else {
                                      const idx = events.indexOf(event);
                                      if (idx > -1) events.splice(idx, 1);
                                    }
                                    setSettings(handleChange(settings, 'integrations', 'webhookEvents', events));
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{event}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}