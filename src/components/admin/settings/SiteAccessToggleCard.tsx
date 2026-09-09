import { useState } from 'react';
import { Lock, LockOpen, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppSetting, useUpdateAppSetting } from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';

const SETTING_KEY = 'site_access_enabled';

export const SiteAccessToggleCard = () => {
  const { toast } = useToast();
  const { data: setting, isLoading } = useAppSetting(SETTING_KEY);
  const updateSetting = useUpdateAppSetting();
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);

  const enabled = setting?.value ?? false;

  const confirm = async () => {
    if (pendingValue === null) return;
    const value = pendingValue;
    setPendingValue(null);
    try {
      await updateSetting.mutateAsync({ key: SETTING_KEY, value });
      toast({
        title: value ? 'Tela de senha ativada' : 'Tela de senha desativada',
        description: value
          ? 'Os visitantes precisarão informar a senha para entrar no site.'
          : 'O site está aberto e abre direto, sem pedir senha.',
      });
    } catch (error: any) {
      toast({
        title: 'Não foi possível salvar',
        description: error?.message || 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <Lock className="h-5 w-5" /> : <LockOpen className="h-5 w-5" />}
          Tela de senha do site
        </CardTitle>
        <CardDescription>
          Decida se os visitantes precisam informar uma senha antes de entrar na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="site-access-toggle" className="text-base">
                {enabled ? 'Senha exigida' : 'Acesso liberado'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {enabled
                  ? 'Visitantes são direcionados para a tela de senha.'
                  : 'O site abre direto, sem pedir senha.'}
              </p>
            </div>
            <Switch
              id="site-access-toggle"
              checked={enabled}
              disabled={updateSetting.isPending}
              onCheckedChange={(value) => setPendingValue(value)}
            />
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={pendingValue !== null}
        onOpenChange={(open) => !open && setPendingValue(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingValue ? 'Ativar a tela de senha?' : 'Desativar a tela de senha?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingValue
                ? 'A partir de agora, quem acessar o site precisará informar uma senha válida.'
                : 'Qualquer pessoa com o link poderá acessar a plataforma sem senha.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
