import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Incident } from '../types/database';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setIncidents(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIncidents();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('incidents_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents((prev) => [payload.new as Incident, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIncidents((prev) => prev.map(inc => inc.id === payload.new.id ? payload.new as Incident : inc));
        } else if (payload.eventType === 'DELETE') {
          setIncidents((prev) => prev.filter(inc => inc.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { incidents, isLoading, error };
}
