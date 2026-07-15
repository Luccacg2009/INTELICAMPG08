import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Zap, Archive, Calendar, User, Tag, MessageSquare, Plus, Loader2, CheckCircle, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { PostMortem, PostMortemStatus, Comment } from '../../types';

const statusLabels: Record<PostMortemStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

const statusColors: Record<PostMortemStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
};

export function PostMortemDetail() {
  const { id } = useParams<{ id: string }>();
  const [postMortem, setPostMortem] = useState<PostMortem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPostMortem();
      fetchComments();
    }
  }, [id]);

  const fetchPostMortem = async () => {
    try {
      const response = await api.get(`/post-mortems/${id}`);
      setPostMortem(response.data);
    } catch (error) {
      console.error('Error fetching post-mortem:', error);
      toast.error('Erro ao carregar post-mortem');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/post-mortems/${id}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePublish = async () => {
    if (!postMortem) return;
    try {
      await api.put(`/post-mortems/${id}`, { status: 'PUBLISHED' });
      toast.success('Post-mortem publicado');
      setPostMortem({ ...postMortem, status: 'PUBLISHED' });
    } catch (error) {
      toast.error('Erro ao publicar');
    }
  };

  const handleArchive = async () => {
    if (!postMortem) return;
    try {
      await api.put(`/post-mortems/${id}`, { status: 'ARCHIVED' });
      toast.success('Post-mortem arquivado');
      setPostMortem({ ...postMortem, status: 'ARCHIVED' });
    } catch (error) {
      toast.error('Erro ao arquivar');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este post-mortem?')) return;
    try {
      await api.delete(`/post-mortems/${id}`);
      toast.success('Post-mortem excluído');
      window.location.href = '/post-mortems';
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.post(`/post-mortems/${id}/comments`, { content: newComment });
      toast.success('Comentário adicionado');
      setNewComment('');
      fetchComments();
    } catch (error) {
      toast.error('Erro ao adicionar comentário');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!postMortem) {
    return <div className="p-6 text-center"><p className="text-gray-500">Post-mortem não encontrado</p></div>;
  }

  const canEdit = postMortem.authorId === postMortem.author?.id || ['ADMIN', 'ANALYST'].includes(postMortem.author?.role || '');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/post-mortems" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{postMortem.title}</h1>
            <Badge variant={statusColors[postMortem.status]}>{statusLabels[postMortem.status]}</Badge>
            <Badge variant="info">{postMortem.type}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(postMortem.createdAt).toLocaleDateString('pt-BR')}</span>
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{postMortem.author?.name || 'Autor'}</span>
            {postMortem.tags && postMortem.tags.length > 0 && (
              <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{postMortem.tags.join(', ')}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {postMortem.status === 'DRAFT' && (
            <Button leftIcon={<Zap className="w-4 h-4" />} onClick={handlePublish} className="text-green-600 hover:bg-green-50 border-green-200">
              Publicar
            </Button>
          )}
          {postMortem.status === 'PUBLISHED' && (
            <Button leftIcon={<Archive className="w-4 h-4" />} onClick={handleArchive} className="text-yellow-600 hover:bg-yellow-50 border-yellow-200">
              Arquivar
            </Button>
          )}
          {canEdit && (
            <Button variant="ghost" leftIcon={<Edit className="w-4 h-4" />} onClick={() => window.location.href = `/post-mortems/${id}/edit`}>
              Editar
            </Button>
          )}
          {canEdit && (
            <Button variant="ghost" leftIcon={<Trash2 className="w-4 h-4" />} onClick={handleDelete} className="text-red-600 hover:text-red-700">
              Excluir
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{postMortem.description || 'Sem descrição'}</p>
            </CardContent>
          </Card>

          {postMortem.timeline && (
            <Card>
              <CardHeader>
                <CardTitle>Linha do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{postMortem.timeline}</p>
              </CardContent>
            </Card>
          )}

          {postMortem.rootCause && (
            <Card className="border-l-4 border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-red-600" />Causa Raiz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{postMortem.rootCause}</p>
              </CardContent>
            </Card>
          )}

          {postMortem.lessonsLearned && (
            <Card className="border-l-4 border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-green-600" />Lições Aprendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{postMortem.lessonsLearned}</p>
              </CardContent>
            </Card>
          )}

          {postMortem.actionItems && (
            <Card className="border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-600" />Ações Corretivas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{postMortem.actionItems}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comentários</CardTitle>
                <Button size="sm" leftIcon={<MessageSquare className="w-4 h-4" />} onClick={() => setIsCommentsModalOpen(true)}>
                  {comments.length}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
              ) : (
                <>
                  {comments.slice(0, 5).map(comment => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{comment.author?.name?.charAt(0) || 'U'}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{comment.author?.name || 'Usuário'}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-9">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setIsCommentsModalOpen(true)}>
                      Ver todos os {comments.length} comentários
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <Badge variant={statusColors[postMortem.status]}>{statusLabels[postMortem.status]}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tipo</span>
                <span className="font-medium">{postMortem.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Criado em</span>
                <span className="font-medium">{new Date(postMortem.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Atualizado em</span>
                <span className="font-medium">{new Date(postMortem.updatedAt).toLocaleString('pt-BR')}</span>
              </div>
              {postMortem.tags && postMortem.tags.length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">Tags</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {postMortem.tags.map(tag => (
                      <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={isCommentsModalOpen} onClose={() => setIsCommentsModalOpen(false)} title="Comentários">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {comments.map(comment => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{comment.author?.name?.charAt(0) || 'U'}</span>
                </div>
                <span className="font-medium text-gray-900">{comment.author?.name || 'Usuário'}</span>
                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <p className="text-sm text-gray-700 ml-10">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum comentário</p>}
          
          <div className="border-t border-gray-100 pt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicionar comentário..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleAddComment} disabled={isSubmittingComment || !newComment.trim()}>
                {isSubmittingComment ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}