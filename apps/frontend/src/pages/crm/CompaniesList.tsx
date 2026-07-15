import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Loader2, ChevronLeft, ChevronRight, Edit, Trash2, Eye, Mail, Phone, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  revenue?: number;
  employees?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  owner: { id: string; name: string };
  contactsCount: number;
  dealsCount: number;
  totalDealsValue: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyListResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '',
    revenue: '',
    employees: '',
    address: '',
    city: '',
    state: '',
    country: 'Brasil',
    phone: '',
    email: '',
    website: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [page, search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      });
      const response = await api.get<CompanyListResponse>(`/crm/companies?${params}`);
      setCompanies(response.data.data || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      domain: '',
      industry: '',
      size: '',
      revenue: '',
      employees: '',
      address: '',
      city: '',
      state: '',
      country: 'Brasil',
      phone: '',
      email: '',
      website: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      domain: company.domain || '',
      industry: company.industry || '',
      size: company.size || '',
      revenue: company.revenue?.toString() || '',
      employees: company.employees?.toString() || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      country: company.country || 'Brasil',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      description: company.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        name: formData.name,
        domain: formData.domain || undefined,
        industry: formData.industry || undefined,
        size: formData.size || undefined,
        revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
        employees: formData.employees ? parseInt(formData.employees) : undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
      };

      if (editingCompany) {
        await api.put(`/crm/companies/${editingCompany.id}`, data);
        toast.success('Empresa atualizada com sucesso');
      } else {
        await api.post('/crm/companies', data);
        toast.success('Empresa criada com sucesso');
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (company: Company) => {
    if (!window.confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
      return;
    }
    try {
      await api.delete(`/crm/companies/${company.id}`);
      toast.success('Empresa excluída com sucesso');
      fetchCompanies();
    } catch (error) {
      toast.error('Erro ao excluir empresa');
    }
  };

  const sizeOptions = ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'];
  const industryOptions = ['TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'RETAIL', 'MANUFACTURING', 'EDUCATION', 'REAL_ESTATE', 'OTHER'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-500 mt-1">Gerencie empresas do CRM</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Nova Empresa
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar empresas..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando empresas...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma empresa encontrada</h3>
              <p className="text-gray-500">Comece adicionando uma nova empresa</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domínio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porte</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contatos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negócios</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{company.name}</p>
                              <p className="text-xs text-gray-500">{company.owner.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{company.domain || '—'}</td>
                        <td className="px-6 py-4">
                          {company.industry && <Badge variant="info">{company.industry}</Badge>}
                        </td>
                        <td className="px-6 py-4">
                          {company.size && <Badge variant="default">{company.size}</Badge>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{company.contactsCount}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{company.dealsCount}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          R$ {company.totalDealsValue.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(company)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(company)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, total)} de {total} resultados
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCompany ? 'Editar Empresa' : 'Nova Empresa'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domínio</label>
              <Input value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} placeholder="exemplo.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
              <select value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione...</option>
                {industryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
              <select value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione...</option>
                {sizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receita Anual</label>
              <Input type="number" value={formData.revenue} onChange={(e) => setFormData({...formData, revenue: e.target.value})} placeholder="0.00" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Funcionários</label>
              <Input type="number" value={formData.employees} onChange={(e) => setFormData({...formData, employees: e.target.value})} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+55 11 99999-9999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="contato@empresa.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://empresa.com" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
              <Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Rua, número, complemento" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : editingCompany ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}