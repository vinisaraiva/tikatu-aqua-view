import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { ReadingFormDialog } from './ReadingFormDialog';
import { useReadings, useDeleteReading, type Reading } from '@/hooks/admin/useReadings';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const getConamaStatus = (value: number | null, min: number | null, max: number | null) => {
  if (value === null) return 'not-measured';
  if (min === null && max === null) return 'normal';
  if (min !== null && value < min) return 'critical';
  if (max !== null && value > max) return 'critical';
  return 'normal';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'critical':
      return <Badge variant="destructive">Crítico</Badge>;
    case 'attention':
      return <Badge variant="secondary">Atenção</Badge>;
    case 'not-measured':
      return <Badge variant="outline" className="text-muted-foreground">Não medido</Badge>;
    default:
      return <Badge variant="default">Normal</Badge>;
  }
};

function ReadingRow({ reading, onEdit, onDelete }: { 
  reading: Reading; 
  onEdit: (reading: Reading) => void;
  onDelete: (reading: Reading) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <TableRow className="cursor-pointer hover:bg-muted/50">
          <TableCell className="w-[200px]">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate">{reading.points?.name}</span>
            </div>
          </TableCell>
          <TableCell className="w-[150px]">
            <span className="truncate block">{reading.points?.rivers?.name}</span>
          </TableCell>
          <TableCell className="w-[120px]">
            <span className="truncate block">{reading.points?.rivers?.cities?.name}</span>
          </TableCell>
          <TableCell className="w-[180px]">
            <div className="text-sm">
              <div>{new Date(reading.measured_at).toLocaleDateString('pt-BR')}</div>
              <div className="text-muted-foreground">{new Date(reading.measured_at).toLocaleTimeString('pt-BR')}</div>
            </div>
          </TableCell>
          <TableCell className="w-[80px] text-center">
            <span className="font-mono text-sm">{reading.iqa_score?.toFixed(2) || '-'}</span>
          </TableCell>
          <TableCell className="w-[80px] text-center">
            <span className="font-mono text-sm">{reading.iet_score?.toFixed(2) || '-'}</span>
          </TableCell>
          <TableCell className="w-[100px] text-center">
            {reading.collection_type === 'automatic' ? (
              <Badge variant="secondary">🔧 Auto</Badge>
            ) : (
              <Badge variant="outline">👤 Manual</Badge>
            )}
          </TableCell>
          <TableCell className="w-[120px]">
            <div className="flex gap-1 justify-center">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(reading); }}>
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(reading); }}>
                Excluir
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/20">
            <div className="space-y-4 p-4">
              {/* Todos os Parâmetros */}
              {reading.reading_values && reading.reading_values.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Parâmetros de Qualidade da Água:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {reading.reading_values.map((rv, index) => {
                      const status = getConamaStatus(
                        rv.value,
                        rv.parameter.conama_min,
                        rv.parameter.conama_max
                      );
                      const isMeasured = rv.value !== null;
                      
                      return (
                        <div key={index} className={`bg-background p-3 rounded-lg border ${!isMeasured ? 'opacity-60 bg-muted/20' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{rv.parameter.code}</span>
                            {getStatusBadge(status)}
                          </div>
                          <div className={`text-lg font-bold ${!isMeasured ? 'text-muted-foreground' : ''}`}>
                            {isMeasured ? `${rv.value} ${rv.parameter.unit}` : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {rv.parameter.description}
                          </div>
                          {(rv.parameter.conama_min !== null || rv.parameter.conama_max !== null) && (
                            <div className="text-xs text-muted-foreground mt-1">
                              CONAMA: {rv.parameter.conama_min || '-'} - {rv.parameter.conama_max || '-'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fatores Ambientais */}
              <div>
                <h4 className="font-semibold mb-2">Fatores Ambientais:</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Cor alterada:</span>
                    <Badge variant={reading.cor_alterada ? "destructive" : "default"}>
                      {reading.cor_alterada ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Cheiro alterado:</span>
                    <Badge variant={reading.cheiro_alterado ? "destructive" : "default"}>
                      {reading.cheiro_alterado ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Chuva 48h:</span>
                    <Badge variant={reading.chuva_48h ? "secondary" : "default"}>
                      {reading.chuva_48h ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Resíduos visíveis:</span>
                    <Badge variant={reading.residuos_visiveis ? "destructive" : "default"}>
                      {reading.residuos_visiveis ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Volume reduzido:</span>
                    <Badge variant={reading.volume_reduzido ? "destructive" : "default"}>
                      {reading.volume_reduzido ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ReadingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [deletingReading, setDeletingReading] = useState<Reading | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: readings, isLoading } = useReadings();
  const deleteReading = useDeleteReading();

  const filteredReadings = readings?.filter((reading) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      reading.points?.name.toLowerCase().includes(searchLower) ||
      reading.points?.rivers?.name.toLowerCase().includes(searchLower) ||
      reading.points?.rivers?.cities?.name.toLowerCase().includes(searchLower)
    );
  });

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Leituras</h1>
            <p className="text-muted-foreground">
              Gerencie as leituras de qualidade da água do sistema
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nova Leitura
          </Button>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Leituras</h1>
          <p className="text-muted-foreground">
            Gerencie as leituras de qualidade da água do sistema
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Leitura
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por ponto, rio ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Ponto</TableHead>
              <TableHead className="w-[150px]">Rio</TableHead>
              <TableHead className="w-[120px]">Cidade</TableHead>
              <TableHead className="w-[180px]">Data da Medição</TableHead>
              <TableHead className="w-[80px] text-center">IQA</TableHead>
              <TableHead className="w-[80px] text-center">IET</TableHead>
              <TableHead className="w-[100px] text-center">Tipo</TableHead>
              <TableHead className="w-[120px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReadings && filteredReadings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Nenhuma leitura encontrada para o termo buscado' : 'Nenhuma leitura encontrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredReadings?.map((reading) => (
                <ReadingRow
                  key={reading.id}
                  reading={reading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
        description={`Tem certeza que deseja excluir esta leitura? Esta ação não pode ser desfeita.`}
        loading={deleteReading.isPending}
      />
    </div>
  );
}