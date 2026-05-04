import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Resource, ResourceStatus } from '../types/database';

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setResources(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();

    const subscription = supabase
      .channel('resources_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // BUG-14: re-sort after insert so the list order stays consistent with
          // the initial `updated_at DESC` fetch — plain prepend broke the sort.
          setResources((prev) =>
            [payload.new as Resource, ...prev].sort(
              (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
          );
        } else if (payload.eventType === 'UPDATE') {
          setResources((prev) =>
            prev.map((r) => (r.id === payload.new.id ? (payload.new as Resource) : r))
          );
        } else if (payload.eventType === 'DELETE') {
          setResources((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchResources]);

  const deployResource = async (resourceId: string, incidentId: string) => {
    const { error } = await supabase
      .from('resources')
      .update({
        availability_status: 'deployed',
        assigned_incident_id: incidentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resourceId);
    if (error) throw error;
  };

  const markAvailable = async (resourceId: string) => {
    const { error } = await supabase
      .from('resources')
      .update({
        availability_status: 'available',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resourceId);
    if (error) throw error;
  };

  const updateStatus = async (resourceId: string, status: ResourceStatus, location?: string) => {
    const updates: Partial<Resource> & { updated_at: string } = {
      availability_status: status,
      updated_at: new Date().toISOString(),
    };
    if (location !== undefined) updates.location = location;
    const { error } = await supabase.from('resources').update(updates).eq('id', resourceId);
    if (error) throw error;
  };

  return { resources, isLoading, error, deployResource, markAvailable, updateStatus };
}
