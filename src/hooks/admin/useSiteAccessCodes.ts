import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteAccessCode {
  id: string;
  label: string;
  is_active: boolean;
  expires_at: string | null;
  last_access_at: string | null;
  created_at: string;
}

// Gera uma senha aleatória forte (sem caracteres ambíguos)
const generatePassword = (length = 16): string => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
};

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const useSiteAccessCodes = () => {
  const queryClient = useQueryClient();

  const query = useQuery<SiteAccessCode[]>({
    queryKey: ['site-access-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_access_codes')
        .select('id, label, is_active, expires_at, last_access_at, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as SiteAccessCode[];
    },
  });

  // Retorna a senha em texto puro UMA única vez (não é armazenada)
  const createCode = useMutation({
    mutationFn: async ({
      label,
      expiresAt,
    }: {
      label: string;
      expiresAt: string | null;
    }): Promise<{ password: string }> => {
      const password = generatePassword(16);
      const password_hash = await sha256Hex(password);

      const { error } = await supabase.from('site_access_codes').insert({
        label,
        password_hash,
        expires_at: expiresAt,
      });

      if (error) throw error;
      return { password };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-access-codes'] });
    },
  });

  const revokeCode = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_access_codes')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-access-codes'] });
    },
  });

  const reactivateCode = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_access_codes')
        .update({ is_active: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-access-codes'] });
    },
  });

  const deleteCode = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_access_codes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-access-codes'] });
    },
  });

  return { query, createCode, revokeCode, reactivateCode, deleteCode };
};
