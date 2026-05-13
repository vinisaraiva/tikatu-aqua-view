import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserContext = async (sess: Session | null) => {
      setSession(sess);
      setUser(sess?.user ?? null);

      if (!sess?.user) {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Fetch profile + admin role atomically before flipping loading=false
      const [profileRes, roleRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', sess.user.id).single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', sess.user.id)
          .eq('role', 'admin')
          .maybeSingle(),
      ]);

      setProfile(profileRes.data);
      setIsAdmin(!!roleRes.data);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        // Defer Supabase calls out of the auth callback to avoid deadlocks
        setTimeout(() => { loadUserContext(sess); }, 0);
      }
    );

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      loadUserContext(sess);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    isAdmin,
    signIn,
    signOut,
  };
};
