import { useState } from 'react';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  KeyRound,
  Loader2,
  Copy,
  Plus,
  Ban,
  RotateCcw,
  Trash2,
  CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSiteAccessCodes, SiteAccessCode } from '@/hooks/admin/useSiteAccessCodes';

const labelSchema = z
  .string()
  .trim()
  .min(1, 'Informe um nome ou identificação')
  .max(100, 'Máximo de 100 caracteres');

const getStatus = (code: SiteAccessCode): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
  if (!code.is_active) return { label: 'Revogado', variant: 'destructive' };
  if (code.expires_at && new Date(code.expires_at).getTime() < Date.now()) {
    return { label: 'Expirado', variant: 'secondary' };
  }
  return { label: 'Ativo', variant: 'default' };
};

export const SiteAccessCodesCard = () => {
  const { toast } = useToast();
  const { query, createCode, revokeCode, reactivateCode, deleteCode } = useSiteAccessCodes();

  const [label, setLabel] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [generatedLabel, setGeneratedLabel] = useState('');
  const [toDelete, setToDelete] = useState<SiteAccessCode | null>(null);

  const handleGenerate = async () => {
    const parsed = labelSchema.safeParse(label);
    if (!parsed.success) {
      toast({
        title: 'Dados inválidos',
        description: parsed.error.issues[0].message,
        variant: 'destructive',
      });
      return;
    }

    try {
      const { password } = await createCode.mutateAsync({
        label: parsed.data,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
      });
      setGeneratedPassword(password);
      setGeneratedLabel(parsed.data);
      setLabel('');
      setExpiresAt(undefined);
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a senha. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast({ title: 'Copiado!', description: 'Senha copiada para a área de transferência.' });
    }
  };

  const handleRevoke = async (code: SiteAccessCode) => {
    try {
      if (code.is_active) {
        await revokeCode.mutateAsync(code.id);
        toast({ title: 'Acesso revogado', description: `"${code.label}" não pode mais acessar o site.` });
      } else {
        await reactivateCode.mutateAsync(code.id);
        toast({ title: 'Acesso reativado', description: `"${code.label}" pode acessar o site novamente.` });
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar o acesso.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCode.mutateAsync(toDelete.id);
      toast({ title: 'Excluído', description: `Acesso "${toDelete.label}" removido.` });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir o acesso.', variant: 'destructive' });
    } finally {
      setToDelete(null);
    }
  };

  const codes = query.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Acessos ao Site
        </CardTitle>
        <CardDescription>
          Gere senhas individuais para cada pessoa acessar o site. A senha é exibida
          apenas uma vez — copie e compartilhe com segurança.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de geração */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="access-label">Nome / Identificação</Label>
            <Input
              id="access-label"
              placeholder="Ex.: João Silva"
              value={label}
              maxLength={100}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Expiração (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-[180px] justify-start text-left font-normal',
                    !expiresAt && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, 'PPP', { locale: ptBR }) : 'Sem expiração'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={setExpiresAt}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
                {expiresAt && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setExpiresAt(undefined)}
                    >
                      Limpar data
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleGenerate} disabled={createCode.isPending}>
            {createCode.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Gerar senha
          </Button>
        </div>

        {/* Tabela de acessos */}
        {query.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
            Nenhuma senha de acesso gerada ainda.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Último acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => {
                  const status = getStatus(code);
                  return (
                    <TableRow key={code.id}>
                      <TableCell className="font-medium">{code.label}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {code.expires_at
                          ? format(new Date(code.expires_at), 'dd/MM/yyyy', { locale: ptBR })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {code.last_access_at
                          ? format(new Date(code.last_access_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevoke(code)}
                            title={code.is_active ? 'Revogar acesso' : 'Reativar acesso'}
                          >
                            {code.is_active ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setToDelete(code)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Diálogo com a senha gerada (exibida uma única vez) */}
      <Dialog
        open={!!generatedPassword}
        onOpenChange={(open) => !open && setGeneratedPassword(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Senha gerada para {generatedLabel}</DialogTitle>
            <DialogDescription>
              ⚠️ Esta é a única vez que a senha será exibida. Copie e compartilhe com a pessoa
              de forma segura.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted p-3 rounded border font-mono text-lg tracking-wider text-center break-all">
              {generatedPassword}
            </div>
            <Button variant="outline" size="icon" onClick={copyPassword}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setGeneratedPassword(null)}>Concluído</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir acesso"
        description={`Tem certeza que deseja excluir o acesso "${toDelete?.label}"? Esta ação não pode ser desfeita.`}
        loading={deleteCode.isPending}
      />
    </Card>
  );
};
