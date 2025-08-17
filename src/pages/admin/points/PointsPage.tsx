import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { PointFormDialog } from './PointFormDialog';
import { usePoints, useDeletePoint, type Point } from '@/hooks/admin/usePoints';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'rivers.name', label: 'Rio', render: (point: any) => point.rivers?.name },
  { key: 'rivers.cities.name', label: 'Cidade', render: (point: any) => point.rivers?.cities?.name },
  { key: 'rivers.cities.state', label: 'Estado', render: (point: any) => point.rivers?.cities?.state },
  { key: 'latitude', label: 'Latitude', render: (point: any) => point.latitude?.toFixed(6) },
  { key: 'longitude', label: 'Longitude', render: (point: any) => point.longitude?.toFixed(6) },
  { key: 'created_at', label: 'Criado em', render: (point: any) => new Date(point.created_at).toLocaleDateString('pt-BR') }
];

export default function PointsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);
  const [deletingPoint, setDeletingPoint] = useState<Point | null>(null);

  const { data: points, isLoading } = usePoints();
  const deletePoint = useDeletePoint();

  const handleEdit = (point: Point) => {
    setEditingPoint(point);
    setIsFormOpen(true);
  };

  const handleDelete = (point: Point) => {
    setDeletingPoint(point);
  };

  const confirmDelete = () => {
    if (deletingPoint) {
      deletePoint.mutate(deletingPoint.id);
      setDeletingPoint(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPoint(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Pontos</h1>
          <p className="text-muted-foreground">
            Gerencie os pontos de coleta do sistema de monitoramento
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ponto
        </Button>
      </div>

      <DataTable
        data={points || []}
        columns={columns}
        loading={isLoading}
        searchKey="name"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PointFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        point={editingPoint}
      />

      <ConfirmDialog
        open={!!deletingPoint}
        onClose={() => setDeletingPoint(null)}
        onConfirm={confirmDelete}
        title="Excluir Ponto"
        description={`Tem certeza que deseja excluir o ponto "${deletingPoint?.name}"? Esta ação não pode ser desfeita.`}
        loading={deletePoint.isPending}
      />
    </div>
  );
}