import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Loader2, Smartphone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Atualização do app Tikatu Coleta.
 *
 * DOIS CAMPOS, DOIS PAPÉIS DIFERENTES — a confusão entre eles causou um bug:
 *
 *   reload_token  "recarreguem agora". Mudar o valor faz cada aparelho recarregar
 *                 UMA vez na próxima abertura. É o que este botão deve usar.
 *
 *   min_version   "a versão X é o mínimo aceitável". Só faz sentido receber a
 *                 versão que foi REALMENTE publicada.
 *
 * O bug: a versão anterior deste card incrementava o patch de `min_version` a
 * cada clique (1.0.1 -> 1.0.2 -> ...). Chegou a 1.0.13 enquanto a versão no ar
 * era 1.0.4. Como a comparação é numérica por segmento, 1.0.4 < 1.0.13, então
 * TODO voluntário se considerava desatualizado e recarregava a cada sessão —
 * para sempre, porque nunca existiria um build 1.0.13.
 *
 * A causa de fundo: até a v1.1.0 o app lia apenas `min_version` e ignorava
 * `reload_token`, então o botão não surtia efeito e incrementar a versão virou
 * a saída encontrada. O app v1.2.0 passou a ler os dois campos.
 */

const FORMATO_VERSAO = /^\d+\.\d+\.\d+$/;

/** Compara versões semânticas segmento a segmento. Mesma lógica do app. */
function versaoMenor(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x < y) return true;
    if (x > y) return false;
  }
  return false;
}

export const ForceAppUpdateCard = () => {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salvandoVersao, setSalvandoVersao] = useState(false);

  const [minVersion, setMinVersion] = useState<string>('');
  const [reloadToken, setReloadToken] = useState<string>('');
  const [novaVersao, setNovaVersao] = useState<string>('');

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from('app_config')
      .select('min_version, reload_token')
      .eq('id', 1)
      .single();
    if (data) {
      setMinVersion(String(data.min_version ?? ''));
      setReloadToken(String(data.reload_token ?? ''));
      setNovaVersao(String(data.min_version ?? ''));
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /**
   * Forçar atualização = incrementar `reload_token`.
   * NUNCA mexer em `min_version` aqui.
   */
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data, error: readErr } = await supabase
        .from('app_config')
        .select('reload_token')
        .eq('id', 1)
        .single();
      if (readErr) throw readErr;

      const atual = parseInt(String(data?.reload_token ?? '0'), 10) || 0;
      const proximo = String(atual + 1);

      const { error: updErr } = await supabase
        .from('app_config')
        .update({ reload_token: proximo, updated_at: new Date().toISOString() })
        .eq('id', 1);
      if (updErr) throw updErr;

      setReloadToken(proximo);
      toast({
        title: 'Atualização enviada',
        description:
          'Os aparelhos recarregarão uma vez na próxima abertura do app, sem perder o login.',
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

  /** Define a versão mínima. O valor é digitado — nunca incrementado sozinho. */
  const salvarVersaoMinima = async () => {
    const valor = novaVersao.trim();
    if (!FORMATO_VERSAO.test(valor)) {
      toast({
        title: 'Versão inválida',
        description: 'Use o formato x.y.z, por exemplo 1.2.0.',
        variant: 'destructive',
      });
      return;
    }

    setSalvandoVersao(true);
    try {
      const { error } = await supabase
        .from('app_config')
        .update({ min_version: valor, updated_at: new Date().toISOString() })
        .eq('id', 1);
      if (error) throw error;

      setMinVersion(valor);
      toast({
        title: 'Versão mínima definida',
        description: `Agora é ${valor}. Quem estiver abaixo disso recarrega na próxima abertura.`,
      });
    } catch (err: any) {
      toast({
        title: 'Falha ao salvar',
        description: err?.message ?? 'Erro desconhecido.',
        variant: 'destructive',
      });
    } finally {
      setSalvandoVersao(false);
    }
  };

  // A versão publicada do app está no package.json do repositório tikatu-coleta.
  // Como a plataforma não tem como consultá-la, o aviso abaixo é informativo:
  // ele lembra o gestor de conferir se o número bate com o que está no ar.
  const versaoAlta = Boolean(minVersion) && versaoMenor('1.2.0', minVersion);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Atualização do aplicativo
          </CardTitle>
          <CardDescription>
            Faz os aparelhos dos voluntários carregarem a versão mais recente do
            app Tikatu Coleta na próxima abertura, sem que precisem refazer login.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
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
            <p className="mt-2 text-xs text-muted-foreground">
              Use sempre que publicar uma versão nova. Não altera a versão mínima.
            </p>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="min-version" className="text-sm">
              Versão mínima exigida
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="min-version"
                value={novaVersao}
                onChange={(e) => setNovaVersao(e.target.value)}
                placeholder="1.2.0"
                className="max-w-[140px]"
                disabled={salvandoVersao}
              />
              <Button
                variant="outline"
                onClick={salvarVersaoMinima}
                disabled={salvandoVersao || novaVersao.trim() === minVersion}
              >
                {salvandoVersao && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Informe exatamente a versão que já está publicada. Um número acima
              do que está no ar deixa todos os aparelhos recarregando atrás de uma
              versão que não existe.
            </p>
          </div>

          {versaoAlta && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A versão mínima está em <strong>{minVersion}</strong>. Confirme se
                essa versão foi mesmo publicada — se não foi, todos os voluntários
                estão recarregando o app a cada abertura sem nunca alcançá-la.
              </AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground">
            Estado atual — versão mínima: <strong>{minVersion || '—'}</strong> ·
            gatilho de recarga: <strong>{reloadToken || '—'}</strong>
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !loading && setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Forçar atualização do app"
        description="Deseja forçar a atualização do app de TODOS os voluntários? Eles receberão a versão mais recente na próxima vez que abrirem o app, sem perder o login."
        loading={loading}
      />
    </>
  );
};
