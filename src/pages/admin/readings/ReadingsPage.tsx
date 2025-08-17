import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { ReadingFormDialog } from './ReadingFormDialog';
import { useReadings, useDeleteReading, type Reading } from '@/hooks/admin/useReadings';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const columns = [
  { key: 'points.name', label: 'Ponto', render: (reading: any) => reading.points?.name },
  { key: 'points.rivers.name', label: 'Rio', render: (reading: any) => reading.points?.rivers?.name },
  { key: 'points.rivers.cities.name', label: 'Cidade', render: (reading: any) => reading.points?.rivers?.cities?.name },
  { key: 'iqa_score', label: 'IQA', render: (reading: any) => reading.iqa_score?.toFixed(2) || '-' },
  { key: 'iet_score', label: 'IET', render: (reading: any) => reading.iet_score?.toFixed(2) || '-' },
  { key: 'measured_at', label: 'Data da Medição', render: (reading: any) => new Date(reading.measured_at).toLocaleDateString('pt-BR') },
  { key: 'created_at', label: 'Criado em', render: (reading: any) => new Date(reading.created_at).toLocaleDateString('pt-BR') }
];

export default function ReadingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [deletingReading, setDeletingReading] = useState<Reading | null>(null);

  const { data: readings, isLoading } = useReadings();
  const deleteReading = useDeleteReading();

  const handleEdit = (reading: Reading) => {
    setEditingReading(reading);
    setIsFormOpen(true);
  };

  const handleDelete = (reading: Reading) => {
    setDeletingReading(reading);
  };

  const confirmDelete = () => {
    if (deletingReading) {
      deleteReading.mutate(deletingReading.id);
      setDeletingReading(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingReading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Leituras</h1>
          <p className="text-muted-foreground">
            Gerencie as leituras de qualidade da água
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Leitura
        </Button>
      </div>

      <DataTable
        data={readings || []}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReadingFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        reading={editingReading}
      />

      <ConfirmDialog
        open={!!deletingReading}
        onClose={() => setDeletingReading(null)}
        onConfirm={confirmDelete}
        title="Excluir Leitura"
        description="Tem certeza que deseja excluir esta leitura? Esta ação não pode ser desfeita."
        loading={deleteReading.isPending}
      />
    </div>
  );
}