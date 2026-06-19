import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Copy, Check, X } from 'lucide-react';

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  message: string | null;
  status: string;
  site_access_code_id: string | null;
  created_at: string;
}

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
};

const AccessRequestsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [generatedFor, setGeneratedFor] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['access-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AccessRequest[];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (request: AccessRequest) => {
      const { data, error } = await supabase.functions.invoke('approve-access-request', {
        body: { requestId: request.id },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.message || 'Não foi possível gerar a senha.');
      return { password: data.password as string, request };
    },
    onMutate: (request) => setPendingId(request.id),
    onSuccess: ({ password, request }) => {
      setGeneratedPassword(password);
      setGeneratedFor(`${request.name} (${request.email})`);
      setCopied(false);
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
    onSettled: () => setPendingId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('access_requests')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Solicitação rejeitada' });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const handleCopy = async () => {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Solicitações de Acesso</h1>
        <p className="text-muted-foreground">
          Avalie os pedidos de acesso e gere senhas para os usuários.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos recebidos</CardTitle>
          <CardDescription>
            Para liberar o acesso, gere uma senha e envie-a ao usuário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !requests || requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma solicitação recebida ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Mensagem</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => {
                  const status = statusLabel[req.status] || statusLabel.pending;
                  return (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.name}</TableCell>
                      <TableCell>{req.email}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[240px] truncate text-muted-foreground">
                        {req.message || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => generateMutation.mutate(req)}
                              disabled={pendingId === req.id}
                            >
                              {pendingId === req.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <KeyRound className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline ml-1">Gerar senha</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate(req.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!generatedPassword} onOpenChange={(o) => !o && setGeneratedPassword(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Senha de acesso gerada</DialogTitle>
            <DialogDescription>
              Copie a senha abaixo e envie para <strong>{generatedFor}</strong>. Por segurança, ela
              não será exibida novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input readOnly value={generatedPassword ?? ''} className="font-mono" />
            <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button onClick={() => setGeneratedPassword(null)}>Concluir</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessRequestsPage;
