import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Star, MapPin } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { VolunteerFormDialog } from './VolunteerFormDialog';
import { useVolunteers, useDeleteVolunteer, VolunteerPoint } from '@/hooks/admin/useVolunteers';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ApiKeyActions } from '@/components/admin/ApiKeyActions';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ForceAppUpdateCard } from '@/components/admin/volunteers/ForceAppUpdateCard';

const PointsBadges = ({ points }: { points: VolunteerPoint[] }) => {
  if (!points || points.length === 0) return <span className="text-muted-foreground">-</span>;
  
  const primaryPoint = points.find(p => p.is_primary);
  const otherPoints = points.filter(p => !p.is_primary);
  
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1 max-w-xs">
        {primaryPoint && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="default" className="gap-1 text-xs">
                <Star className="h-3 w-3 fill-current" />
                {primaryPoint.point_name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p><strong>Ponto Principal</strong></p>
              <p>{primaryPoint.river_name} - {primaryPoint.city_name}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {otherPoints.length > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                +{otherPoints.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p><strong>Outros pontos:</strong></p>
              {otherPoints.map((p, i) => (
                <p key={i}>{p.point_name} ({p.river_name})</p>
              ))}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

const columns = [
  { key: 'code', label: 'Código' },
  { key: 'type', label: 'Tipo', render: (volunteer: any) => 
    volunteer.type === 'probe' ? '🔧 Automático' : '👤 Manual'
  },
  { key: 'nome', label: 'Nome', render: (volunteer: any) => volunteer.nome || '-' },
  { key: 'api_key', label: 'API Key', render: (volunteer: any) => {
    if (volunteer.type !== 'probe' || !volunteer.api_key) return '-';
    const masked = volunteer.api_key.substring(0, 6) + '...' + volunteer.api_key.substring(volunteer.api_key.length - 6);
    return <code className="text-xs bg-muted px-2 py-1 rounded">{masked}</code>;
  }},
  { key: 'points', label: 'Pontos', render: (volunteer: any) => <PointsBadges points={volunteer.points} /> },
  { key: 'is_active', label: 'Status', render: (volunteer: any) => volunteer.is_active ? 'Ativo' : 'Inativo' },
  { key: 'last_communication', label: 'Última Comunicação', render: (volunteer: any) => 
    volunteer.type === 'probe' && volunteer.last_communication 
      ? new Date(volunteer.last_communication).toLocaleString('pt-BR')
      : volunteer.type === 'probe' ? 'Nunca' : '-'
  },
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

      <ForceAppUpdateCard />

      <DataTable
        data={volunteers || []}
        columns={columns}
        loading={isLoading}
        searchKey="code"
        onEdit={handleEdit}
        onDelete={handleDelete}
        customActions={(volunteer) => <ApiKeyActions volunteer={volunteer} />}
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