import { useState, useEffect } from 'react';
import { Users, Plus, Search, Loader2, ChevronLeft, ChevronRight, Edit, Trash2, Mail, Phone, Building2, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  company: { id: string; name: string };
  owner: { id: string; name: string };
  dealsCount: number;
  createdAt: string;
}

interface ContactListResponse {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Array<{id: string; name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    companyId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, [page, search, companyFilter]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(companyFilter && { companyId: companyFilter }),
      });
      const response = await api.get<ContactListResponse>(`/crm/contacts?${params}`);
      setContacts(response.data.data || response.data);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/crm/companies?limit=100');
      const data = response.data.data || response.data;
      setCompanies(data.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const openCreateModal = () => {
    setEditingContact(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', position: '', companyId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || '',
      position: contact.position || '',
      companyId: contact.company.id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        position: formData.position || undefined,
        companyId: formData.companyId || undefined,
      };

      if (editingContact) {
        await api.put(`/crm/contacts/${editingContact.id}`, data);
        toast.success('Contato atualizado com sucesso');
      } else {
        await api.post('/crm/contacts', data);
        toast.success('Contato criado com sucesso');
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar contato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contact: Contact) => {
    if (!window.confirm(`Tem certeza que deseja excluir o contato "${contact.firstName} ${contact.lastName}"?`)) return;
    try {
      await api.delete(`/crm/contacts/${contact.id}`);
      toast.success('Contato excluído com sucesso');
      fetchContacts();
    } catch (error) {
      toast.error('Erro ao excluir contato');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-500 mt-1">Gerencie contatos do CRM</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Novo Contato
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar contatos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <select
              value={companyFilter}
              onChange={(e) => { setCompanyFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
            >
              <option value="">Todas as empresas</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando contatos...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum contato encontrado</h3>
              <p className="text-gray-500">Comece adicionando um novo contato</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negócios</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {contact.firstName[0]}{contact.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</p>
                              <p className="text-xs text-gray-500">Responsável: {contact.owner.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{contact.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{contact.phone || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{contact.position || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{contact.company.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{contact.dealsCount}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(contact)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(contact)} className="text-red-600 hover:text-red-700">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingContact ? 'Editar Contato' : 'Novo Contato'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome *</label>
              <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+55 11 99999-9999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <Input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} placeholder="Gerente de Marketing" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Selecione uma empresa (opcional)</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : editingContact ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}