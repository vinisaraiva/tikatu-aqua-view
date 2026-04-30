import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'site_access_token';
const EXP_KEY = 'site_access_exp';

interface LoginResult {
  success: boolean;
  error?: string;
}

export const useSiteAccess = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const validate = useCallback(async () => {
    const token = sessionStorage.getItem(STORAGE_KEY);
    const exp = Number(sessionStorage.getItem(EXP_KEY) || 0);

    if (!token || !exp || Date.now() > exp) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(EXP_KEY);
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-site-token', {
        body: { token },
      });
      if (error || !data?.valid) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(EXP_KEY);
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    } catch {
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validate();
  }, [validate]);

  const login = useCallback(async (password: string): Promise<LoginResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-site-access', {
        body: { password },
      });

      if (error) {
        // Try to extract message from edge function response
        const msg =
          (error as any)?.context?.error ||
          (error as any)?.message ||
          'Senha incorreta';
        return { success: false, error: typeof msg === 'string' ? msg : 'Senha incorreta' };
      }

      if (!data?.token || !data?.expiresAt) {
        return { success: false, error: 'Senha incorreta' };
      }

      sessionStorage.setItem(STORAGE_KEY, data.token);
      sessionStorage.setItem(EXP_KEY, String(data.expiresAt));
      setIsAuthorized(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(EXP_KEY);
    setIsAuthorized(false);
  }, []);

  return { isAuthorized, loading, login, logout };
};
