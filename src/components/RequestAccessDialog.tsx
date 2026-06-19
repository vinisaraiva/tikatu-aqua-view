import { useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const requestSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(120, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  message: z.string().trim().max(1000, 'Mensagem muito longa').optional(),
});

export const RequestAccessDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setMessage('');
    setError('');
    setDone(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // reset shortly after closing animation
      setTimeout(resetForm, 200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = requestSchema.safeParse({ name, email, message: message || undefined });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('request-access', {
        body: parsed.data,
      });
      if (fnError || !data?.success) {
        setError(data?.message || 'Não foi possível enviar sua solicitação. Tente novamente.');
        return;
      }
      setDone(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-primary hover:underline font-medium"
        >
          Solicite seu acesso
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center text-center space-y-3 py-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <DialogTitle>Solicitação enviada!</DialogTitle>
            <DialogDescription>
              Recebemos seu pedido de acesso. Em breve um administrador irá analisá-lo e enviar sua
              senha de acesso.
            </DialogDescription>
            <Button className="mt-2" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Solicitar acesso</DialogTitle>
              <DialogDescription>
                Informe seus dados. Um administrador irá avaliar e enviar sua senha de acesso.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="request-name">Nome</Label>
                <Input
                  id="request-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-email">Email</Label>
                <Input
                  id="request-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  maxLength={255}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-message">Mensagem (opcional)</Label>
                <Textarea
                  id="request-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  maxLength={1000}
                  rows={3}
                  placeholder="Conte por que deseja acessar a plataforma"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar solicitação
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
