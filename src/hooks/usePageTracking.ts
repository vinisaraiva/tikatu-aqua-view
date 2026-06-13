import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'analytics_session_id';

// Identificador anônimo de sessão (sem dados pessoais)
const getSessionId = (): string => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

// Rotas que NÃO devem ser rastreadas (admin e tela de acesso)
const isIgnoredPath = (path: string) =>
  path.startsWith('/admin') || path.startsWith('/acesso');

export const usePageTracking = () => {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);
  const enteredAtRef = useRef<number>(Date.now());

  useEffect(() => {
    const sessionId = getSessionId();

    const sendEvent = (path: string, durationSeconds: number) => {
      if (isIgnoredPath(path)) return;
      supabase.functions
        .invoke('track-visit', {
          body: {
            session_id: sessionId,
            path,
            referrer: document.referrer || null,
            duration_seconds: Math.max(0, Math.round(durationSeconds)),
          },
        })
        .catch(() => {
          /* falha de tracking nunca deve quebrar a navegação */
        });
    };

    const currentPath = location.pathname;

    // Registra a duração da página anterior ao trocar de rota
    if (prevPathRef.current && prevPathRef.current !== currentPath) {
      const duration = (Date.now() - enteredAtRef.current) / 1000;
      sendEvent(prevPathRef.current, duration);
    }

    prevPathRef.current = currentPath;
    enteredAtRef.current = Date.now();

    // Ao sair/ocultar a aba, registra a duração da página atual
    const handleLeave = () => {
      if (document.visibilityState === 'hidden') {
        const duration = (Date.now() - enteredAtRef.current) / 1000;
        sendEvent(currentPath, duration);
        enteredAtRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleLeave);
    return () => {
      document.removeEventListener('visibilitychange', handleLeave);
    };
  }, [location.pathname]);
};
