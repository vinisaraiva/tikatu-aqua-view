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

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data, error: readErr } = await supabase
        .from('app_config')
        .select('reload_token')
        .eq('id', 1)
        .single();
      if (readErr) throw readErr;

      const current = parseInt(String(data?.reload_token ?? '0'), 10) || 0;
      const { error: updErr } = await supabase
        .from('app_config')
        .update({
          reload_token: String(current + 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);
      if (updErr) throw updErr;

      toast({
        title: 'Atualização enviada',
        description:
          'Os aparelhos dos voluntários recarregarão o app na próxima abertura.',
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
            Força os aparelhos dos voluntários a carregarem a versão mais recente
            do app Tikatu Coleta, sem que precisem refazer login. O efeito ocorre
            na próxima vez que cada aparelho abrir o app.
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
