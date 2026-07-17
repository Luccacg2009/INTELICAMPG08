import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Mic, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { api } from '../../services/api';
import { UserVertical } from '../../types';

const verticals: Record<UserVertical, string> = {
  MARKETING: 'Marketing', PRODUCT: 'Produto', SALES: 'Vendas', ENGINEERING: 'Engenharia',
  DESIGN: 'Design', OPERATIONS: 'Operações', FINANCE: 'Finanças', HR: 'RH', LEGAL: 'Jurídico', OTHER: 'Outro',
};

const emptyForm = {
  title: '', description: '', centralIdea: '', targetAudience: '', accessPassword: '',
  reason: '', budget: '', timeline: '', vertical: 'MARKETING' as UserVertical,
};

export function NewProject() {
  const navigate = useNavigate();
  const timerRef = useRef<number>();
  const [form, setForm] = useState(emptyForm);
  const [listening, setListening] = useState(false);
  const [filledByVoice, setFilledByVoice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const simulateVoice = () => {
    if (listening) return;
    setListening(true);
    setFilledByVoice(false);
    timerRef.current = window.setTimeout(() => {
      setForm({
        title: 'Experiência Azul sem filas',
        description: 'Uma jornada digital para reduzir o tempo de espera do passageiro desde o check-in até o embarque.',
        centralIdea: 'Reunir check-in, despacho de bagagem e orientação no aeroporto em uma experiência simples e personalizada pelo aplicativo.',
        targetAudience: 'Passageiros frequentes, famílias e clientes que embarcam nos principais hubs da Azul.',
        accessPassword: 'demo123',
        reason: 'Melhorar a experiência do cliente e aumentar a eficiência operacional nos aeroportos.',
        budget: '280000',
        timeline: '6 meses',
        vertical: 'MARKETING',
      });
      setListening(false);
      setFilledByVoice(true);
      toast.success('Formulário preenchido pela assistente de voz');
    }, 1000);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', { ...form, budget: form.budget ? Number(form.budget) : undefined });
      toast.success('Projeto criado com sucesso');
      navigate('/projects');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar projeto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
        <div><h1 className="text-2xl font-bold text-gray-900">Novo Projeto</h1><p className="text-gray-500 mt-1">Conte sua ideia ou preencha os campos abaixo.</p></div>
      </div>

      <Card className="overflow-hidden border-blue-100">
        <CardContent className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <button type="button" onClick={simulateVoice} disabled={listening}
              className={`relative w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-all ${listening ? 'bg-red-500 scale-105' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'}`}
              aria-label="Simular preenchimento por voz">
              {listening && <><span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40"/><span className="absolute -inset-3 rounded-full border-2 border-red-300 animate-pulse"/></>}
              <Mic className="relative w-8 h-8" />
            </button>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-700 font-semibold"><Sparkles className="w-5 h-5" /> Assistente de voz</div>
              <p className="mt-1 text-gray-700">{listening ? 'Ouvindo e organizando sua ideia...' : filledByVoice ? 'Pronto! Revise os dados preenchidos antes de salvar.' : 'Clique no microfone e conte sua ideia. Nesta demonstração, os campos serão preenchidos automaticamente.'}</p>
              {listening && <div className="flex gap-1 mt-3 justify-center sm:justify-start">{[1,2,3,4,5,6].map((bar) => <span key={bar} className="w-1.5 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: `${bar * 80}ms` }}/>)}</div>}
            </div>
            {filledByVoice && <div className="flex items-center gap-2 text-green-700 font-medium"><Check className="w-5 h-5" /> Preenchido</div>}
          </div>
        </CardContent>
      </Card>

      <Card><CardContent className="p-6"><form onSubmit={submit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <Input label="Título" required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Nome do projeto" />
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Vertical <span className="text-red-500">*</span></label><select required value={form.vertical} onChange={(e) => update('vertical', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">{Object.entries(verticals).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        </div>
        <Textarea label="Descrição" required value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Descreva brevemente o projeto" />
        <Textarea label="Ideia central" required value={form.centralIdea} onChange={(e) => update('centralIdea', e.target.value)} placeholder="Qual é a proposta principal?" />
        <Textarea label="Público-alvo" required value={form.targetAudience} onChange={(e) => update('targetAudience', e.target.value)} placeholder="Para quem é este projeto?" />
        <div className="grid md:grid-cols-2 gap-5"><Input label="Motivo" value={form.reason} onChange={(e) => update('reason', e.target.value)} /><Input label="Senha de acesso" type="password" required value={form.accessPassword} onChange={(e) => update('accessPassword', e.target.value)} /></div>
        <div className="grid md:grid-cols-2 gap-5"><Input label="Orçamento" type="number" min="0" step="0.01" value={form.budget} onChange={(e) => update('budget', e.target.value)} /><Input label="Prazo" value={form.timeline} onChange={(e) => update('timeline', e.target.value)} placeholder="Ex: 6 meses" /></div>
        <div className="flex justify-end gap-3 pt-5 border-t"><Link to="/projects"><Button type="button" variant="outline">Cancelar</Button></Link><Button type="submit" loading={submitting}>Criar projeto</Button></div>
      </form></CardContent></Card>
    </div>
  );
}
