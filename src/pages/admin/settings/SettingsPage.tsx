import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppSetting, useUpdateAppSetting } from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Map, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMapCache } from '@/hooks/useMapCache';

export const SettingsPage = () => {
  const { data: educationSetting, isLoading } = useAppSetting('show_education_menu');
  const { data: mapCache } = useMapCache();
  const updateSetting = useUpdateAppSetting();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingCache, setIsUpdatingCache] = useState(false);

  const handleEducationToggle = async (checked: boolean) => {
    try {
      await updateSetting.mutateAsync({
        key: 'show_education_menu',
        value: checked,
      });
      toast({
        title: 'Configuração atualizada',
        description: `Link da área educacional ${checked ? 'ativado' : 'desativado'} no menu.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar configuração.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMapCache = async () => {
    setIsUpdatingCache(true);
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      // Call edge function to generate cache
      const { data, error } = await supabase.functions.invoke('generate-map-cache', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // Save cache data to public folder via a download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'map-cache.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Invalidate cache query to force reload
      queryClient.invalidateQueries({ queryKey: ['map-cache'] });

      toast({
        title: 'Cache atualizado',
        description: `Cache do mapa foi gerado com sucesso. ${data.totalPoints} pontos, ${data.totalRivers} rios, ${data.totalCities} cidades. Salve o arquivo baixado em public/data/map-cache.json.`,
      });
    } catch (error: any) {
      console.error('Error updating map cache:', error);
      toast({
        title: 'Erro ao atualizar cache',
        description: error.message || 'Falha ao gerar cache do mapa.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingCache(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Menu Principal</CardTitle>
          <CardDescription>
            Configure quais links aparecem no menu principal do site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="education-menu"
              checked={educationSetting?.value ?? true}
              onCheckedChange={handleEducationToggle}
              disabled={updateSetting.isPending}
            />
            <Label htmlFor="education-menu" className="cursor-pointer">
              Mostrar link "Educação" no menu
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Quando ativado, o link para a área educacional aparece no menu principal.
            Desative para ocultar esta seção quando não estiver em uso.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Cache do Mapa
          </CardTitle>
          <CardDescription>
            Gerencie o cache de localizações para o mapa inicial da página Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              O cache armazena todos os pontos de coleta e rios cadastrados para carregamento 
              rápido do mapa. Atualize manualmente após adicionar novos pontos ou rios.
            </p>
            
            {mapCache && mapCache.totalPoints > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pontos</p>
                    <p className="font-semibold text-lg">{mapCache.totalPoints}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rios</p>
                    <p className="font-semibold text-lg">{mapCache.totalRivers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cidades</p>
                    <p className="font-semibold text-lg">{mapCache.totalCities}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Última atualização: {format(new Date(mapCache.lastUpdated), "PPp", { locale: ptBR })}
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleUpdateMapCache}
            disabled={isUpdatingCache}
            className="w-full"
          >
            {isUpdatingCache ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando cache...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar Cache do Mapa
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Após clicar em atualizar, um arquivo JSON será baixado. Salve-o em{' '}
            <code className="bg-muted px-1 py-0.5 rounded">public/data/map-cache.json</code>
            {' '}para que o cache seja atualizado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};