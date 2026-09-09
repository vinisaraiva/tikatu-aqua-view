import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSiteAccess } from '@/hooks/useSiteAccess';

const PUBLIC_ROUTES = ['/forum-economia-do-mar'];

// Interruptor da senha de acesso ao site.
// false = site liberado sem senha. Volte para true para reativar a tela /acesso.
const SITE_ACCESS_ENABLED = false;

interface AccessGateProps {
  children: React.ReactNode;
}

export const AccessGate = ({ children }: AccessGateProps) => {
  const { isAuthorized, loading } = useSiteAccess();
  const location = useLocation();

  if (!SITE_ACCESS_ENABLED || PUBLIC_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/acesso" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
