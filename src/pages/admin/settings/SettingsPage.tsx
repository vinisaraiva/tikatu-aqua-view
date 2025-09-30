import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppSetting, useUpdateAppSetting } from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings } from 'lucide-react';

export const SettingsPage = () => {
  const { data: educationSetting, isLoading } = useAppSetting('show_education_menu');
  const updateSetting = useUpdateAppSetting();
  const { toast } = useToast();

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
    </div>
  );
};