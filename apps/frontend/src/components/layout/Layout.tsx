import { ReactNode, useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Lightbulb, MessageSquare, Settings, BarChart2, Users, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ANALYST'] },
  { name: 'Minhas Ideias', href: '/dashboard/my-ideas', icon: Lightbulb, roles: ['PARTICIPANT', 'ANALYST', 'ADMIN'] },
  { name: 'Ideias para Análise', href: '/dashboard/ideas', icon: FileText, roles: ['ANALYST', 'ADMIN'] },
  { name: 'Feedbacks', href: '/dashboard/feedbacks', icon: MessageSquare, roles: ['ANALYST', 'ADMIN'] },
];

const adminNavigation = [
  { name: 'Usuários', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Relatórios', href: '/admin/reports', icon: BarChart2, roles: ['ADMIN'] },
  { name: 'Configurações', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const filteredAdminNav = adminNavigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Menu lateral"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Marketing Azul</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" aria-label="Navegação principal">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}

            {filteredAdminNav.length > 0 && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Administração
                  </p>
                </div>
                {filteredAdminNav.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* User footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
              </div>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Menu do usuário"
                aria-expanded={userMenuOpen}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {userMenuOpen && (
              <div className="mt-3 rounded-lg bg-white border border-gray-200 shadow-lg py-1">
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg text-gray-900">Marketing Azul</span>
            <div className="w-10" />
          </div>
        </header>

        <main className="lg:pl-0">{children}</main>
      </div>
    </div>
  );
}