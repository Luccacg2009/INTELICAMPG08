import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/auth';
import { api } from '../../services/api';
import { Lightbulb, Eye, EyeOff, Loader2, Shield, LineChart, User } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  {
    role: 'Administrador',
    description: 'Marketing • acesso total',
    email: 'admin@azul.com',
    password: 'azul789',
    icon: Shield,
    classes: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    role: 'Analista de Marketing',
    description: 'Avalia ideias e envia feedback',
    email: 'analista@azul.com',
    password: 'azul456',
    icon: LineChart,
    classes: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    role: 'Colaborador',
    description: 'Submete ideias de projeto',
    email: 'trabalhador@azul.com',
    password: 'azul123',
    icon: User,
    classes: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
];

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const doLogin = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data;
    setAuth(user, accessToken, refreshToken);
    toast.success(`Bem-vindo(a), ${user.name}!`);
    navigate('/projects');
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      await doLogin(data.email, data.password);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setQuickLoading(email);
    try {
      await doLogin(email, password);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setQuickLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Marketing Azul</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="mt-2 text-gray-600">Faça login para acessar sua conta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>Entrar</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Acesso rápido (demo)</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const loading = quickLoading === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => quickLogin(acc.email, acc.password)}
                    disabled={quickLoading !== null || isSubmitting}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border bg-white transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed ${acc.classes}`}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${acc.iconBg}`}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold">Entrar como {acc.role}</span>
                      <span className="block text-xs text-gray-500 truncate">{acc.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}