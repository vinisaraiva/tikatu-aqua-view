import { useState } from 'react';
import { RefreshCw, Loader2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ForceAppUpdateCard = () => {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const bumpVersion = (v: string): string => {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec((v ?? '').trim());
    if (!match) return '1.0.1';
    const [, major, minor, patch] = match;
    return `${major}.${minor}.${parseInt(patch, 10) + 1}`;
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data, error: readErr } = await supabase
        .from('app_config')
        .select('min_version')
        .eq('id', 1)
        .single();
      if (readErr) throw readErr;

      const next = bumpVersion(String(data?.min_version ?? ''));
      const { error: updErr } = await supabase
        .from('app_config')
        .update({
          min_version: next,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);
      if (updErr) throw updErr;

      toast({
        title: 'Atualização enviada',
        description: `Nova versão mínima publicada: ${next}. Aparelhos com versão inferior recarregarão sem perder o login.`,
      });
      setConfirmOpen(false);
    } catch (err: any) {
      toast({
        title: 'Falha ao enviar',
        description: err?.message ?? 'Erro desconhecido.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Atualização do aplicativo
          </CardTitle>
          <CardDescription>
            Publica uma nova versão mínima do app Tikatu Coleta. Aparelhos com
            versão inferior recarregarão na próxima abertura, sem que os
            voluntários precisem refazer login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            variant="default"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Forçar atualização do app (todos)
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !loading && setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Forçar atualização do app"
        description="Deseja forçar a atualização do app de TODOS os voluntários? Eles receberão a versão mais recente na próxima vez que abrirem o app."
        loading={loading}
      />
    </>
  );
};
