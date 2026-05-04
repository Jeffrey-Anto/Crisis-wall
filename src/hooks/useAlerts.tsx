import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Alert } from '../types/database';
import toast from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';


const playPing = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // ignore autoplay restrictions
  }
};

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase.channel(`alerts_channel_${Math.random().toString(36).substring(7)}`);
    
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newAlert = payload.new as Alert;
          setAlerts((prev) => [newAlert, ...prev].slice(0, 20));
          
          if (newAlert.severity === 'critical') {
            playPing();
          }

          // Trigger Toast
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.5)] border ${
                newAlert.severity === 'critical' ? 'border-red-500/50' : 'border-slate-800'
              } rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <ShieldAlert className={`h-6 w-6 ${
                      newAlert.severity === 'critical' ? 'text-red-500' : 
                      newAlert.severity === 'high' ? 'text-orange-500' : 
                      'text-cyan-500'
                    }`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-slate-100 uppercase tracking-wider">
                      {newAlert.type || 'System Alert'}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {newAlert.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-800">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-500 hover:text-slate-300 focus:outline-none transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 5000 });

        } else if (payload.eventType === 'UPDATE') {
          setAlerts((prev) => prev.map(a => a.id === payload.new.id ? payload.new as Alert : a));
        } else if (payload.eventType === 'DELETE') {
          setAlerts((prev) => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('alerts').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id);
      if (unreadIds.length === 0) return;
      await supabase.from('alerts').update({ is_read: true }).in('id', unreadIds);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return { alerts, isLoading, error, markAsRead, markAllAsRead };
}
