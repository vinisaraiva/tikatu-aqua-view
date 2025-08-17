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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCreateNews, useUpdateNews, type AdminNews } from '@/hooks/admin/useAdminNews';

const newsSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  summary: z.string().min(1, 'Resumo é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  author: z.string().min(1, 'Autor é obrigatório'),
  image_url: z.string().optional(),
  read_time: z.string().min(1, 'Tempo de leitura é obrigatório'),
  is_published: z.boolean(),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormDialogProps {
  open: boolean;
  onClose: () => void;
  news?: AdminNews | null;
}

const categories = [
  'Educação',
  'Tecnologia',
  'Meio Ambiente',
  'Pesquisa',
  'Comunidade',
  'Sustentabilidade'
];

export function NewsFormDialog({ open, onClose, news }: NewsFormDialogProps) {
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: news?.title || '',
      summary: news?.summary || '',
      content: news?.content || '',
      category: news?.category || '',
      author: news?.author || '',
      image_url: news?.image_url || '',
      read_time: news?.read_time || '3 min',
      is_published: news?.is_published ?? false,
    },
  });

  const onSubmit = (data: NewsFormData) => {
    if (news) {
      updateNews.mutate(
        { 
          id: news.id,
          title: data.title,
          summary: data.summary,
          content: data.content,
          category: data.category,
          author: data.author,
          image_url: data.image_url,
          read_time: data.read_time,
          is_published: data.is_published
        },
        {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        }
      );
    } else {
      createNews.mutate({
        title: data.title,
        summary: data.summary,
        content: data.content,
        category: data.category,
        author: data.author,
        image_url: data.image_url,
        read_time: data.read_time,
        is_published: data.is_published
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
            {news ? 'Editar Notícia' : 'Nova Notícia'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da notícia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumo</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Resumo da notícia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conteúdo completo da notícia" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do autor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="read_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de Leitura</FormLabel>
                    <FormControl>
                      <Input placeholder="3 min" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Marque para publicar a notícia imediatamente
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

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createNews.isPending || updateNews.isPending}
              >
                {news ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}