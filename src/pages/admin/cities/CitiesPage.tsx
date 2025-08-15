import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import { CityFormDialog } from './CityFormDialog';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useCities, useDeleteCity, type City } from '@/hooks/admin/useCities';
import { Plus } from 'lucide-react';

const CitiesPage = () => {
  const { data: cities = [], isLoading } = useCities();
  const deleteCity = useDeleteCity();
  
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const columns = [
    { key: 'name' as keyof City, label: 'Nome' },
    { key: 'state' as keyof City, label: 'Estado' },
    { 
      key: 'created_at' as keyof City, 
      label: 'Criado em',
      render: (city: City) => new Date(city.created_at).toLocaleDateString('pt-BR')
    },
    { key: 'actions' as keyof City, label: 'Ações' },
  ];

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setIsFormOpen(true);
  };

  const handleDelete = (city: City) => {
    setDeletingCity(city);
  };

  const confirmDelete = () => {
    if (deletingCity) {
      deleteCity.mutate(deletingCity.id);
      setDeletingCity(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCity(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cidades</h1>
          <p className="text-muted-foreground">
            Gerencie as cidades do sistema
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Cidade
        </Button>
      </div>

      <DataTable
        data={cities}
        columns={columns}
        searchKey="name"
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading}
      />

      <CityFormDialog
        city={editingCity}
        open={isFormOpen}
        onClose={handleFormClose}
      />

      <ConfirmDialog
        open={!!deletingCity}
        onClose={() => setDeletingCity(null)}
        onConfirm={confirmDelete}
        title="Excluir Cidade"
        description={`Tem certeza que deseja excluir a cidade "${deletingCity?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleteCity.isPending}
      />
    </div>
  );
};

export default CitiesPage;