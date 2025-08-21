import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { VolunteerFormDialog } from './VolunteerFormDialog';
import { useVolunteers, useDeleteVolunteer } from '@/hooks/admin/useVolunteers';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const columns = [
  { key: 'code', label: 'Código' },
  { key: 'nome', label: 'Nome', render: (volunteer: any) => volunteer.nome || '-' },
  { key: 'point_name', label: 'Ponto', render: (volunteer: any) => volunteer.point_name },
  { key: 'river_name', label: 'Rio', render: (volunteer: any) => volunteer.river_name },
  { key: 'city_name', label: 'Cidade', render: (volunteer: any) => volunteer.city_name },
  { key: 'state', label: 'Estado', render: (volunteer: any) => volunteer.state },
  { key: 'is_active', label: 'Status', render: (volunteer: any) => volunteer.is_active ? 'Ativo' : 'Inativo' },
  { key: 'created_at', label: 'Criado em', render: (volunteer: any) => new Date(volunteer.created_at).toLocaleDateString('pt-BR') }
];

export default function VolunteersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<any>(null);
  const [deletingVolunteer, setDeletingVolunteer] = useState<any>(null);

  const { data: volunteers, isLoading } = useVolunteers();
  const deleteVolunteer = useDeleteVolunteer();

  const handleEdit = (volunteer: any) => {
    setEditingVolunteer(volunteer);
    setIsFormOpen(true);
  };

  const handleDelete = (volunteer: any) => {
    setDeletingVolunteer(volunteer);
  };

  const confirmDelete = () => {
    if (deletingVolunteer) {
      deleteVolunteer.mutate(deletingVolunteer.id);
      setDeletingVolunteer(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingVolunteer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Voluntários</h1>
          <p className="text-muted-foreground">
            Gerencie os voluntários do sistema de monitoramento
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Voluntário
        </Button>
      </div>

      <DataTable
        data={volunteers || []}
        columns={columns}
        loading={isLoading}
        searchKey="code"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <VolunteerFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        volunteer={editingVolunteer}
      />

      <ConfirmDialog
        open={!!deletingVolunteer}
        onClose={() => setDeletingVolunteer(null)}
        onConfirm={confirmDelete}
        title="Excluir Voluntário"
        description={`Tem certeza que deseja excluir o voluntário "${deletingVolunteer?.code}"? Esta ação não pode ser desfeita.`}
        loading={deleteVolunteer.isPending}
      />
    </div>
  );
}