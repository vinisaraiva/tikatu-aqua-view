import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { ParameterFormDialog } from './ParameterFormDialog';
import { useParameters, useDeleteParameter, type Parameter } from '@/hooks/admin/useParameters';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const columns = [
  { key: 'code' as keyof Parameter, label: 'Código' },
  { key: 'description' as keyof Parameter, label: 'Descrição' },
  { key: 'unit' as keyof Parameter, label: 'Unidade' },
  { 
    key: 'conama_min' as keyof Parameter, 
    label: 'CONAMA Min', 
    render: (parameter: Parameter) => parameter.conama_min ? parameter.conama_min.toString() : '-'
  },
  { 
    key: 'conama_max' as keyof Parameter, 
    label: 'CONAMA Max', 
    render: (parameter: Parameter) => parameter.conama_max ? parameter.conama_max.toString() : '-'
  },
  { key: 'created_at' as keyof Parameter, label: 'Criado em', render: (parameter: Parameter) => new Date(parameter.created_at).toLocaleDateString('pt-BR') }
];

export default function ParametersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [deletingParameter, setDeletingParameter] = useState<Parameter | null>(null);

  const { data: parameters, isLoading } = useParameters();
  const deleteParameter = useDeleteParameter();

  const handleEdit = (parameter: Parameter) => {
    setEditingParameter(parameter);
    setIsFormOpen(true);
  };

  const handleDelete = (parameter: Parameter) => {
    setDeletingParameter(parameter);
  };

  const confirmDelete = () => {
    if (deletingParameter) {
      deleteParameter.mutate(deletingParameter.id);
      setDeletingParameter(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingParameter(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Parâmetros</h1>
          <p className="text-muted-foreground">
            Gerencie os parâmetros de qualidade da água
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Parâmetro
        </Button>
      </div>

      <DataTable
        data={parameters || []}
        columns={columns}
        loading={isLoading}
        searchKey="code"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ParameterFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        parameter={editingParameter}
      />

      <ConfirmDialog
        open={!!deletingParameter}
        onClose={() => setDeletingParameter(null)}
        onConfirm={confirmDelete}
        title="Excluir Parâmetro"
        description={`Tem certeza que deseja excluir o parâmetro "${deletingParameter?.code}"? Esta ação não pode ser desfeita.`}
        loading={deleteParameter.isPending}
      />
    </div>
  );
}