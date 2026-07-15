import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, UserPlus, MoreVertical, UserCheck, UserX, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { User, UserRole, UserVertical } from '../../types';
import { useAuthStore } from '../../store/auth';
import { toast } from 'react-hot-toast';

interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ANALYST: 'Analista',
  PARTICIPANT: 'Participante',
};

const roleColors: Record<UserRole, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  ADMIN: 'danger',
  ANALYST: 'info',
  PARTICIPANT: 'default',
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

export function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'PARTICIPANT' as UserRole,
    vertical: 'MARKETING' as UserVertical,
    password: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, verticalFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(verticalFilter && { vertical: verticalFilter }),
      });
      const response = await api.get<UserListResponse>(`/users?${params}`);
      setUsers(response.data.data || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      role: 'PARTICIPANT',
      vertical: 'MARKETING',
      password: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      vertical: user.vertical as UserVertical || 'MARKETING',
      password: '',
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, {
          name: formData.name,
          role: formData.role,
          vertical: formData.vertical,
          isActive: formData.isActive,
        });
        toast.success('Usuário atualizado com sucesso');
      } else {
        await api.post('/users', {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          vertical: formData.vertical,
          password: formData.password,
        });
        toast.success('Usuário criado com sucesso');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('Você não pode excluir a si mesmo');
      return;
    }
    if (!window.confirm(`Tem certeza que deseja desativar o usuário ${user.name}?`)) {
      return;
    }
    try {
      await api.delete(`/users/${user.id}`);
      toast.success('Usuário desativado com sucesso');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao desativar usuário');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-500 mt-1">Gerencie usuários, roles e permissões do sistema</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou vertical..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
                >
                  <option value="">Todos os roles</option>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select
                  value={verticalFilter}
                  onChange={(e) => { setVerticalFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
                >
                  <option value="">Todas as verticais</option>
                  {Object.entries(verticalLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
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
              <p className="text-gray-500">Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum usuário encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou busque por outros termos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertical</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant={roleColors[user.role]}>
                            {roleLabels[user.role]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{verticalLabels[user.vertical] || user.vertical}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.isActive ? 'success' : 'danger'}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user)}
                              className="text-red-600 hover:text-red-700"
                              title="Desativar"
                              disabled={user.id === currentUser?.id}
                            >
                              <UserX className="w-4 h-4" />
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required={!editingUser}
                disabled={editingUser}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
              <select
                value={formData.vertical}
                onChange={(e) => setFormData({ ...formData, vertical: e.target.value as UserVertical })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.entries(verticalLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Usuário ativo</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}