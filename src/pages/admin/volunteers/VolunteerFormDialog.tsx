import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
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
import { useCreateVolunteer, useUpdateVolunteer } from '@/hooks/admin/useVolunteers';
import { usePoints } from '@/hooks/admin/usePoints';

const volunteerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  point_id: z.number().min(1, 'Ponto é obrigatório'),
  type: z.enum(['manual', 'probe']),
  password: z.string().min(4, 'Senha deve ter pelo menos 4 caracteres').optional(),
  probe_model: z.string().optional(),
  probe_serial: z.string().optional(),
  is_active: z.boolean(),
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

  const form = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      nome: '',
      point_id: 0,
      type: 'manual',
      password: '',
      probe_model: '',
      probe_serial: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (volunteer) {
      form.reset({
        nome: volunteer.nome || '',
        point_id: volunteer.point_id,
        type: volunteer.type || 'manual',
        password: '',
        probe_model: volunteer.probe_model || '',
        probe_serial: volunteer.probe_serial || '',
        is_active: volunteer.is_active,
      });
    } else {
      form.reset({
        nome: '',
        point_id: 0,
        type: 'manual',
        password: '',
        probe_model: '',
        probe_serial: '',
        is_active: true,
      });
    }
  }, [volunteer, form]);

  const onSubmit = (data: VolunteerFormData) => {
    if (volunteer) {
      updateVolunteer.mutate(
        { 
          id: volunteer.id, 
          nome: data.nome,
          point_id: data.point_id,
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
      if (data.type === 'manual' && !data.password) {
        form.setError('password', { message: 'Senha é obrigatória para novos voluntários manuais' });
        return;
      }
      createVolunteer.mutate({ 
        nome: data.nome, 
        point_id: data.point_id, 
        type: data.type,
        password: data.password,
        probe_model: data.probe_model,
        probe_serial: data.probe_serial
      }, {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {volunteer ? 'Editar Voluntário' : 'Novo Voluntário'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="point_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ponto de Coleta</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um ponto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {points?.map((point) => (
                        <SelectItem key={point.id} value={point.id.toString()}>
                          {point.name} - {point.rivers?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            {form.watch('type') === 'probe' && (
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

            {form.watch('type') === 'manual' && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {volunteer ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite a senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            <div className="flex justify-end space-x-2">
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
  );
}