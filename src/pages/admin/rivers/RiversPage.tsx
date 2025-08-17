import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { RiverFormDialog } from './RiverFormDialog';
import { useRivers, useDeleteRiver, type River } from '@/hooks/admin/useRivers';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'cities.name', label: 'Cidade', render: (river: any) => river.cities?.name },
  { key: 'cities.state', label: 'Estado', render: (river: any) => river.cities?.state },
  { key: 'created_at', label: 'Criado em', render: (river: any) => new Date(river.created_at).toLocaleDateString('pt-BR') }
];

export default function RiversPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRiver, setEditingRiver] = useState<River | null>(null);
  const [deletingRiver, setDeletingRiver] = useState<River | null>(null);

  const { data: rivers, isLoading } = useRivers();
  const deleteRiver = useDeleteRiver();

  const handleEdit = (river: River) => {
    setEditingRiver(river);
    setIsFormOpen(true);
  };

  const handleDelete = (river: River) => {
    setDeletingRiver(river);
  };

  const confirmDelete = () => {
    if (deletingRiver) {
      deleteRiver.mutate(deletingRiver.id);
      setDeletingRiver(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRiver(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Rios</h1>
          <p className="text-muted-foreground">
            Gerencie os rios do sistema de monitoramento
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Rio
        </Button>
      </div>

      <DataTable
        data={rivers || []}
        columns={columns}
        loading={isLoading}
        searchKey="name"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <RiverFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        river={editingRiver}
      />

      <ConfirmDialog
        open={!!deletingRiver}
        onClose={() => setDeletingRiver(null)}
        onConfirm={confirmDelete}
        title="Excluir Rio"
        description={`Tem certeza que deseja excluir o rio "${deletingRiver?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleteRiver.isPending}
      />
    </div>
  );
}