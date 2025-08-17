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
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateReading, useUpdateReading, type Reading } from '@/hooks/admin/useReadings';
import { usePoints } from '@/hooks/admin/usePoints';

const readingSchema = z.object({
  point_id: z.number().min(1, 'Ponto é obrigatório'),
  measured_at: z.string().min(1, 'Data da medição é obrigatória'),
  iqa_score: z.number().optional(),
  iet_score: z.number().optional(),
  cor_alterada: z.boolean().optional(),
  cheiro_alterado: z.boolean().optional(),
  chuva_48h: z.boolean().optional(),
  residuos_visiveis: z.boolean().optional(),
  volume_reduzido: z.boolean().optional(),
});

type ReadingFormData = z.infer<typeof readingSchema>;

interface ReadingFormDialogProps {
  open: boolean;
  onClose: () => void;
  reading?: Reading | null;
}

export function ReadingFormDialog({ open, onClose, reading }: ReadingFormDialogProps) {
  const { data: points } = usePoints();
  const createReading = useCreateReading();
  const updateReading = useUpdateReading();

  const form = useForm<ReadingFormData>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      point_id: 0,
      measured_at: '',
      iqa_score: undefined,
      iet_score: undefined,
      cor_alterada: false,
      cheiro_alterado: false,
      chuva_48h: false,
      residuos_visiveis: false,
      volume_reduzido: false,
    },
  });

  useEffect(() => {
    if (reading) {
      form.reset({
        point_id: reading.point_id,
        measured_at: new Date(reading.measured_at).toISOString().slice(0, 16),
        iqa_score: reading.iqa_score,
        iet_score: reading.iet_score,
        cor_alterada: reading.cor_alterada,
        cheiro_alterado: reading.cheiro_alterado,
        chuva_48h: reading.chuva_48h,
        residuos_visiveis: reading.residuos_visiveis,
        volume_reduzido: reading.volume_reduzido,
      });
    } else {
      form.reset({
        point_id: 0,
        measured_at: '',
        iqa_score: undefined,
        iet_score: undefined,
        cor_alterada: false,
        cheiro_alterado: false,
        chuva_48h: false,
        residuos_visiveis: false,
        volume_reduzido: false,
      });
    }
  }, [reading, form]);

  const onSubmit = (data: ReadingFormData) => {
    if (reading) {
      updateReading.mutate(
        { 
          id: reading.id,
          point_id: data.point_id,
          measured_at: data.measured_at,
          iqa_score: data.iqa_score,
          iet_score: data.iet_score,
          cor_alterada: data.cor_alterada,
          cheiro_alterado: data.cheiro_alterado,
          chuva_48h: data.chuva_48h,
          residuos_visiveis: data.residuos_visiveis,
          volume_reduzido: data.volume_reduzido,
        },
        {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        }
      );
    } else {
      createReading.mutate({
        point_id: data.point_id,
        measured_at: data.measured_at,
        iqa_score: data.iqa_score,
        iet_score: data.iet_score,
        cor_alterada: data.cor_alterada,
        cheiro_alterado: data.cheiro_alterado,
        chuva_48h: data.chuva_48h,
        residuos_visiveis: data.residuos_visiveis,
        volume_reduzido: data.volume_reduzido,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reading ? 'Editar Leitura' : 'Nova Leitura'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="measured_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Hora da Medição</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="iqa_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontuação IQA (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0-100"
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
                name="iet_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontuação IET (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0-100"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fatores Ambientais</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cor_alterada"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cor alterada</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cheiro_alterado"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cheiro alterado</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chuva_48h"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Chuva nas últimas 48h</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="residuos_visiveis"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Resíduos visíveis</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volume_reduzido"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Volume reduzido</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createReading.isPending || updateReading.isPending}
              >
                {reading ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}