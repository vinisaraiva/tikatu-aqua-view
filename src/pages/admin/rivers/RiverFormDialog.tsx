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
import { useCreateRiver, useUpdateRiver, type River } from '@/hooks/admin/useRivers';
import { useCities } from '@/hooks/admin/useCities';

const riverSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  city_id: z.number().min(1, 'Cidade é obrigatória'),
});

type RiverFormData = z.infer<typeof riverSchema>;

interface RiverFormDialogProps {
  open: boolean;
  onClose: () => void;
  river?: River | null;
}

export function RiverFormDialog({ open, onClose, river }: RiverFormDialogProps) {
  const { data: cities } = useCities();
  const createRiver = useCreateRiver();
  const updateRiver = useUpdateRiver();

  const form = useForm<RiverFormData>({
    resolver: zodResolver(riverSchema),
    defaultValues: {
      name: '',
      city_id: 0,
    },
  });

  useEffect(() => {
    if (river) {
      form.reset({
        name: river.name,
        city_id: river.city_id,
      });
    } else {
      form.reset({
        name: '',
        city_id: 0,
      });
    }
  }, [river, form]);

  const onSubmit = (data: RiverFormData) => {
    if (river) {
      updateRiver.mutate(
        { id: river.id, name: data.name, city_id: data.city_id },
        {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        }
      );
    } else {
      createRiver.mutate({ name: data.name, city_id: data.city_id }, {
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
            {river ? 'Editar Rio' : 'Novo Rio'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do rio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma cidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name} - {city.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createRiver.isPending || updateRiver.isPending}
              >
                {river ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}