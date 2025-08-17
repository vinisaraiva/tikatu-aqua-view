import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateParameter, useUpdateParameter, type Parameter } from '@/hooks/admin/useParameters';

const parameterSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório').max(10, 'Código muito longo'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  conama_min: z.number().optional(),
  conama_max: z.number().optional(),
});

type ParameterFormData = z.infer<typeof parameterSchema>;

interface ParameterFormDialogProps {
  open: boolean;
  onClose: () => void;
  parameter?: Parameter | null;
}

export function ParameterFormDialog({ open, onClose, parameter }: ParameterFormDialogProps) {
  const createParameter = useCreateParameter();
  const updateParameter = useUpdateParameter();

  const form = useForm<ParameterFormData>({
    resolver: zodResolver(parameterSchema),
    defaultValues: {
      code: parameter?.code || '',
      description: parameter?.description || '',
      unit: parameter?.unit || '',
      conama_min: parameter?.conama_min || undefined,
      conama_max: parameter?.conama_max || undefined,
    },
  });

  const onSubmit = (data: ParameterFormData) => {
    if (parameter) {
      updateParameter.mutate(
        { 
          id: parameter.id, 
          code: data.code, 
          description: data.description, 
          unit: data.unit, 
          conama_min: data.conama_min, 
          conama_max: data.conama_max 
        },
        {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        }
      );
    } else {
      createParameter.mutate({ 
        code: data.code, 
        description: data.description, 
        unit: data.unit, 
        conama_min: data.conama_min, 
        conama_max: data.conama_max 
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
            {parameter ? 'Editar Parâmetro' : 'Novo Parâmetro'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="pH, OD, DBO..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Potencial Hidrogeniônico..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <FormControl>
                    <Input placeholder="mg/L, °C, NTU..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conama_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CONAMA Mínimo (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conama_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CONAMA Máximo (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createParameter.isPending || updateParameter.isPending}
              >
                {parameter ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}