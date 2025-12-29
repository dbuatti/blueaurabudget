import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserId(session?.user?.id || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserId(session?.user?.id || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, userId, loading };
}