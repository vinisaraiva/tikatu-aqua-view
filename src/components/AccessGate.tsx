import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSiteAccess } from '@/hooks/useSiteAccess';
import { useAppSetting } from '@/hooks/useAppSettings';

const PUBLIC_ROUTES = ['/forum-economia-do-mar'];

interface AccessGateProps {
  children: React.ReactNode;
}

export const AccessGate = ({ children }: AccessGateProps) => {
  const { isAuthorized, loading } = useSiteAccess();
  const location = useLocation();
  const {
    data: gateSetting,
    isLoading: settingLoading,
    isError: settingError,
  } = useAppSetting('site_access_enabled');

  if (PUBLIC_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  if (settingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fail-open: se não conseguir ler a configuração, libera o acesso.
  if (settingError || !gateSetting?.value) {
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
