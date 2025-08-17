import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { NewsFormDialog } from './NewsFormDialog';
import { useAdminNews, useDeleteNews, type AdminNews } from '@/hooks/admin/useAdminNews';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const columns = [
  { key: 'title' as keyof AdminNews, label: 'Título' },
  { key: 'category' as keyof AdminNews, label: 'Categoria' },
  { key: 'author' as keyof AdminNews, label: 'Autor' },
  { key: 'read_time' as keyof AdminNews, label: 'Tempo de Leitura' },
  { 
    key: 'is_published' as keyof AdminNews, 
    label: 'Status', 
    render: (news: AdminNews) => news.is_published ? 'Publicado' : 'Rascunho'
  },
  { key: 'created_at' as keyof AdminNews, label: 'Criado em', render: (news: AdminNews) => new Date(news.created_at).toLocaleDateString('pt-BR') }
];

export default function NewsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<AdminNews | null>(null);
  const [deletingNews, setDeletingNews] = useState<AdminNews | null>(null);

  const { data: news, isLoading } = useAdminNews();
  const deleteNews = useDeleteNews();

  const handleEdit = (newsItem: AdminNews) => {
    setEditingNews(newsItem);
    setIsFormOpen(true);
  };

  const handleDelete = (newsItem: AdminNews) => {
    setDeletingNews(newsItem);
  };

  const confirmDelete = () => {
    if (deletingNews) {
      deleteNews.mutate(deletingNews.id);
      setDeletingNews(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingNews(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Notícias</h1>
          <p className="text-muted-foreground">
            Gerencie as notícias do sistema
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Notícia
        </Button>
      </div>

      <DataTable
        data={news || []}
        columns={columns}
        loading={isLoading}
        searchKey="title"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <NewsFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        news={editingNews}
      />

      <ConfirmDialog
        open={!!deletingNews}
        onClose={() => setDeletingNews(null)}
        onConfirm={confirmDelete}
        title="Excluir Notícia"
        description={`Tem certeza que deseja excluir a notícia "${deletingNews?.title}"? Esta ação não pode ser desfeita.`}
        loading={deleteNews.isPending}
      />
    </div>
  );
}