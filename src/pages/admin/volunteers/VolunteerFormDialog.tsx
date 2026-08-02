import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreateVolunteer, useUpdateVolunteer } from '@/hooks/admin/useVolunteers';
import { usePoints } from '@/hooks/admin/usePoints';
import { ApiKeyDisplayDialog } from '@/components/admin/ApiKeyDisplayDialog';
import { VolunteerScheduleEditor, ScheduleValue } from '@/components/admin/volunteers/VolunteerScheduleEditor';
import { MapPin, Star } from 'lucide-react';


const volunteerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  point_ids: z.array(z.number()).min(1, 'Selecione pelo menos um ponto'),
  primary_point_id: z.number().min(1, 'Selecione o ponto principal'),
  type: z.enum(['manual', 'probe']),
  password: z.string().optional(),
  probe_model: z.string().optional(),
  probe_serial: z.string().optional(),
  is_active: z.boolean(),
}).refine((data) => {
  // Senha é obrigatória apenas para voluntários manuais na criação
  if (data.type === 'manual' && (!data.password || data.password.trim() === '')) {
    return false;
  }
  if (data.type === 'manual' && data.password && data.password.length < 4) {
    return false;
  }
  return true;
}, {
  message: 'Senha é obrigatória para voluntários manuais (mínimo 4 caracteres)',
  path: ['password'],
}).refine((data) => {
  // Ponto principal deve estar na lista de pontos selecionados
  return data.point_ids.includes(data.primary_point_id);
}, {
  message: 'O ponto principal deve estar entre os pontos selecionados',
  path: ['primary_point_id'],
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

interface VolunteerFormDialogProps {
  open: boolean;
  onClose: () => void;
  volunteer?: any;
}

export function VolunteerFormDialog({ open, onClose, volunteer }: VolunteerFormDialogProps) {
  const { data: points } = usePoints();
  const createVolunteer = useCreateVolunteer();
  const updateVolunteer = useUpdateVolunteer();
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [createdVolunteer, setCreatedVolunteer] = useState<any>(null);
  const [schedules, setSchedules] = useState<Record<number, ScheduleValue>>({});
  const [scheduleError, setScheduleError] = useState<number[]>([]);



  const form = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      nome: '',
      point_ids: [],
      primary_point_id: 0,
      type: 'manual',
      password: '',
      probe_model: '',
      probe_serial: '',
      is_active: true,
    },
  });

  const watchedPointIds = form.watch('point_ids');
  const watchedType = form.watch('type');

  useEffect(() => {
    if (volunteer) {
      // Extrair point_ids do array de pontos
      const pointIds = volunteer.points?.map((p: any) => p.point_id) || [volunteer.point_id];
      const primaryPointId = volunteer.points?.find((p: any) => p.is_primary)?.point_id || volunteer.point_id;
      
      form.reset({
        nome: volunteer.nome || '',
        point_ids: pointIds,
        primary_point_id: primaryPointId,
        type: volunteer.type || 'manual',
        password: '',
        probe_model: volunteer.probe_model || '',
        probe_serial: volunteer.probe_serial || '',
        is_active: volunteer.is_active,
      });
    } else {
      form.reset({
        nome: '',
        point_ids: [],
        primary_point_id: 0,
        type: 'manual',
        password: '',
        probe_model: '',
        probe_serial: '',
        is_active: true,
      });
    }
  }, [volunteer, form, open]);

  const onSubmit = (data: VolunteerFormData) => {
    if (volunteer) {
      updateVolunteer.mutate(
        { 
          id: volunteer.id, 
          nome: data.nome,
          point_ids: data.point_ids,
          primary_point_id: data.primary_point_id,
          is_active: data.is_active,
          password: data.password,
          probe_model: data.probe_model,
          probe_serial: data.probe_serial
        },
        {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        }
      );
    } else {
      createVolunteer.mutate({ 
        nome: data.nome, 
        point_ids: data.point_ids,
        primary_point_id: data.primary_point_id,
        type: data.type,
        password: data.password,
        probe_model: data.probe_model,
        probe_serial: data.probe_serial
      }, {
        onSuccess: (createdData) => {
          form.reset();
          onClose();
          
          // Se for uma sonda, mostrar o diálogo da API key
          if (data.type === 'probe' && createdData.api_key) {
            setCreatedVolunteer(createdData);
            setShowApiKeyDialog(true);
          }
        },
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handlePointToggle = (pointId: number, checked: boolean) => {
    const currentPoints = form.getValues('point_ids');
    if (checked) {
      const newPoints = [...currentPoints, pointId];
      form.setValue('point_ids', newPoints, { shouldValidate: true });
      // Se é o primeiro ponto, definir como primário
      if (newPoints.length === 1) {
        form.setValue('primary_point_id', pointId, { shouldValidate: true });
      }
    } else {
      const newPoints = currentPoints.filter(id => id !== pointId);
      form.setValue('point_ids', newPoints, { shouldValidate: true });
      // Se removeu o ponto primário, definir o próximo como primário
      if (form.getValues('primary_point_id') === pointId && newPoints.length > 0) {
        form.setValue('primary_point_id', newPoints[0], { shouldValidate: true });
      } else if (newPoints.length === 0) {
        form.setValue('primary_point_id', 0, { shouldValidate: true });
      }
    }
  };

  const handleSetPrimary = (pointId: number) => {
    form.setValue('primary_point_id', pointId, { shouldValidate: true });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {volunteer ? 'Editar Voluntário' : 'Novo Voluntário'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="space-y-4 flex-1 overflow-auto pr-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Voluntário</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do voluntário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Seleção múltipla de pontos */}
                <FormField
                  control={form.control}
                  name="point_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel>Pontos de Coleta</FormLabel>
                      <FormDescription>
                        Selecione os pontos que este voluntário irá monitorar. Clique na estrela para definir o ponto principal.
                      </FormDescription>
                      <ScrollArea className="h-48 rounded-md border p-4">
                        <div className="space-y-2">
                          {points?.map((point) => {
                            const isSelected = watchedPointIds.includes(point.id);
                            const isPrimary = form.watch('primary_point_id') === point.id;
                            
                            return (
                              <div 
                                key={point.id} 
                                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                                  isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handlePointToggle(point.id, checked as boolean)}
                                  />
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <span className="font-medium">{point.name}</span>
                                      <span className="text-muted-foreground text-sm ml-2">
                                        {point.rivers?.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Button
                                    type="button"
                                    variant={isPrimary ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => handleSetPrimary(point.id)}
                                    className="gap-1"
                                  >
                                    <Star className={`h-4 w-4 ${isPrimary ? 'fill-current' : ''}`} />
                                    {isPrimary ? 'Principal' : 'Definir principal'}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      {watchedPointIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {watchedPointIds.map(pointId => {
                            const point = points?.find(p => p.id === pointId);
                            const isPrimary = form.watch('primary_point_id') === pointId;
                            return point ? (
                              <Badge 
                                key={pointId} 
                                variant={isPrimary ? "default" : "secondary"}
                                className="gap-1"
                              >
                                {isPrimary && <Star className="h-3 w-3 fill-current" />}
                                {point.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!volunteer && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">👤 Manual (Voluntário)</SelectItem>
                            <SelectItem value="probe">🔧 Automático (Sonda)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchedType === 'probe' && (
                  <>
                    <FormField
                      control={form.control}
                      name="probe_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo da Sonda</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: AquaTech Pro 2000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="probe_serial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Série</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: AT2000-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {watchedType === 'manual' && !volunteer && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Senha <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Digite a senha (obrigatória)"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchedType === 'probe' && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 text-blue-600">ℹ️</div>
                      <div className="text-sm text-blue-800">
                        <strong>Sondas automáticas</strong> não precisam de senha. 
                        A autenticação é feita através de API key que será gerada automaticamente.
                      </div>
                    </div>
                  </div>
                )}

                {volunteer && volunteer.type === 'manual' && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha (deixe vazio para manter)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite a nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {volunteer && (
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Status Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Ative ou desative este voluntário
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVolunteer.isPending || updateVolunteer.isPending}
                >
                  {volunteer ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {createdVolunteer && (
        <ApiKeyDisplayDialog
          open={showApiKeyDialog}
          onClose={() => {
            setShowApiKeyDialog(false);
            setCreatedVolunteer(null);
          }}
          volunteer={createdVolunteer}
        />
      )}
    </>
  );
}
