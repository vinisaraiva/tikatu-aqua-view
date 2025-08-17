import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
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
import { useCreatePoint, useUpdatePoint, type Point } from '@/hooks/admin/usePoints';
import { useCities } from '@/hooks/admin/useCities';
import { useRivers } from '@/hooks/admin/useRivers';

const pointSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  river_id: z.number().min(1, 'Rio é obrigatório'),
  latitude: z.number().min(-90).max(90, 'Latitude deve estar entre -90 e 90'),
  longitude: z.number().min(-180).max(180, 'Longitude deve estar entre -180 e 180'),
});

type PointFormData = z.infer<typeof pointSchema>;

interface PointFormDialogProps {
  open: boolean;
  onClose: () => void;
  point?: Point | null;
}

export function PointFormDialog({ open, onClose, point }: PointFormDialogProps) {
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  
  const { data: cities } = useCities();
  const { data: rivers } = useRivers();
  const createPoint = useCreatePoint();
  const updatePoint = useUpdatePoint();

  const form = useForm<PointFormData>({
    resolver: zodResolver(pointSchema),
    defaultValues: {
      name: '',
      river_id: 0,
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    if (point) {
      form.reset({
        name: point.name,
        river_id: point.river_id,
        latitude: point.latitude,
        longitude: point.longitude,
      });
      // Set the city filter based on the selected river
      const selectedRiver = rivers?.find(r => r.id === point.river_id);
      if (selectedRiver) {
        setSelectedCityId(selectedRiver.city_id);
      }
    } else {
      form.reset({
        name: '',
        river_id: 0,
        latitude: 0,
        longitude: 0,
      });
      setSelectedCityId(null);
    }
  }, [point, form, rivers]);

  // Filter rivers by selected city
  const filteredRivers = rivers?.filter(river => 
    selectedCityId ? river.city_id === selectedCityId : true
  );

  const onSubmit = (data: PointFormData) => {
    if (point) {
      updatePoint.mutate(
        { 
          id: point.id, 
          name: data.name, 
          river_id: data.river_id, 
          latitude: data.latitude, 
          longitude: data.longitude 
        },
        {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        }
      );
    } else {
      createPoint.mutate({ 
        name: data.name, 
        river_id: data.river_id, 
        latitude: data.latitude, 
        longitude: data.longitude 
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
    setSelectedCityId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {point ? 'Editar Ponto' : 'Novo Ponto'}
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
                    <Input placeholder="Nome do ponto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="text-sm font-medium">Cidade (Filtro)</label>
              <Select
                value={selectedCityId?.toString() || ''}
                onValueChange={(value) => setSelectedCityId(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade para filtrar" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name} - {city.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="river_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rio</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um rio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredRivers?.map((river) => (
                        <SelectItem key={river.id} value={river.id.toString()}>
                          {river.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="-14.123456" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="-39.123456" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                disabled={createPoint.isPending || updatePoint.isPending}
              >
                {point ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}