import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateCity, useUpdateCity, type City } from '@/hooks/admin/useCities';
import { Loader2 } from 'lucide-react';

const citySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  state: z.string().min(2, 'Estado deve ter pelo menos 2 caracteres'),
});

type CityFormData = z.infer<typeof citySchema>;

interface CityFormDialogProps {
  city?: City | null;
  open: boolean;
  onClose: () => void;
}

export const CityFormDialog = ({ city, open, onClose }: CityFormDialogProps) => {
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const isEditing = !!city;

  const form = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: '',
      state: '',
    },
  });

  useEffect(() => {
    if (city) {
      form.reset({
        name: city.name,
        state: city.state,
      });
    } else {
      form.reset({
        name: '',
        state: '',
      });
    }
  }, [city, form]);

  const onSubmit = async (data: CityFormData) => {
    try {
      if (isEditing && city) {
        await updateCity.mutateAsync({ id: city.id, ...data });
      } else {
        await createCity.mutateAsync({
          name: data.name,
          state: data.state,
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const loading = createCity.isPending || updateCity.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cidade' : 'Nova Cidade'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite as informações da cidade.' 
              : 'Adicione uma nova cidade ao sistema.'
            }
          </DialogDescription>
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
                    <Input placeholder="Nome da cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input placeholder="Estado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};