import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock } from 'lucide-react';
import { useSiteAccess } from '@/hooks/useSiteAccess';
import { RequestAccessDialog } from '@/components/RequestAccessDialog';

const passwordSchema = z
  .string()
  .min(1, 'Informe a senha')
  .max(200, 'Senha muito longa');

const SiteAccess = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthorized, loading, login } = useSiteAccess();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthorized) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const result = await login(parsed.data);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Senha incorreta');
      setPassword('');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background image (same as Index hero) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/6c1c5451-5d11-445d-ac6a-b3c2450303b6.png')`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/70"
        aria-hidden="true"
      />

      <Card className="relative z-10 w-full max-w-md backdrop-blur-sm bg-card/95 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/lovable-uploads/d62bdfd0-6fc8-4075-ac93-580e7557f424.png"
              alt="Tikatu"
              className="h-16 w-auto"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Acesso restrito
            </CardTitle>
            <CardDescription>
              Esta plataforma está em fase de avaliação. Informe a senha de acesso para continuar.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="site-password">Senha</Label>
              <Input
                id="site-password"
                name="site-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                autoFocus
                autoComplete="current-password"
                maxLength={200}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não tem acesso? <RequestAccessDialog />
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAccess;
