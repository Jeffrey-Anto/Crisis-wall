import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ambulance, Flame, Shield, HeartPulse, Users, Truck,
  Search, Filter, MapPin, Clock, CheckCircle2, Loader2,
  WrenchIcon, WifiOff, Zap, X, ChevronDown, ArrowUpDown, Inbox, Download
} from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { Card, CardContent } from '../components/Card';
import { Skeleton } from '../components/Skeleton';
import { useResources } from '../hooks/useResources';
import { useIncidents } from '../hooks/useIncidents';
import { useAuth } from '../contexts/AuthContext';
import { timeAgo } from '../utils/timeAgo';
import { exportToCsv } from '../utils/exportCsv';
import type { ResourceStatus, ResourceType } from '../types/database';

// ─── Constants ──────────────────────────────────────────────────────────────

const RESOURCE_TYPES: ResourceType[] = [
  'Ambulance', 'Fire Truck', 'Police Unit', 'Medical Team', 'Rescue Team', 'Relief Vehicle',
];

const STATUS_CONFIG: Record<ResourceStatus, { label: string; color: string; glow: string; icon: React.ComponentType<any> }> = {
  available:   { label: 'Available',   color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]', icon: CheckCircle2 },
  deployed:    { label: 'Deployed',    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',   glow: 'shadow-[0_0_10px_rgba(249,115,22,0.15)]', icon: Zap },
  maintenance: { label: 'Maintenance', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',   glow: 'shadow-[0_0_10px_rgba(234,179,8,0.15)]',  icon: WrenchIcon },
  offline:     { label: 'Offline',     color: 'text-slate-400 bg-slate-700/30 border-slate-600/30',      glow: '',                                          icon: WifiOff },
};

const TYPE_ICON: Record<string, React.ComponentType<any>> = {
  'Ambulance':      Ambulance,
  'Fire Truck':     Flame,
  'Police Unit':    Shield,
  'Medical Team':   HeartPulse,
  'Rescue Team':    Users,
  'Relief Vehicle': Truck,
};

const TYPE_COLOR: Record<string, string> = {
  'Ambulance':      'text-red-400 bg-red-500/10 border-red-500/20',
  'Fire Truck':     'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Police Unit':    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Medical Team':   'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Rescue Team':    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Relief Vehicle': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

// ─── Deploy Modal ────────────────────────────────────────────────────────────

function DeployModal({
  resourceName,
  incidents,
  onClose,
  onConfirm,
}: {
  resourceName: string;
  // BUG-11: accept incidents as a prop instead of calling useIncidents() internally,
  // which was creating a duplicate Supabase fetch + realtime channel on every modal open.
  incidents: ReturnType<typeof import('../hooks/useIncidents').useIncidents>['incidents'];
  onClose: () => void;
  onConfirm: (incidentId: string) => Promise<void>;
}) {
  const activeIncidents = incidents.filter((i) => i.status === 'active' || i.status === 'investigating');
  const [selectedIncident, setSelectedIncident] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedIncident) return;
    setIsSubmitting(true);
    setDeployError(null);
    try {
      await onConfirm(selectedIncident);
      onClose();
    } catch (err: any) {
      setDeployError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Deploy Resource</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Assign <span className="text-cyan-400 font-medium">{resourceName}</span> to an active incident
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {deployError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-sm text-red-400">
            {deployError}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Incident</label>
          <div className="relative">
            <select
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">— Choose an incident —</option>
              {activeIncidents.length === 0 && (
                <option disabled>No active incidents found</option>
              )}
              {activeIncidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.severity.toUpperCase()}] {inc.title} — {inc.location || 'Unknown'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedIncident || isSubmitting}
            className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {isSubmitting ? 'Deploying...' : 'Confirm Deploy'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function ResourceManagement() {
  const { resources, isLoading, deployResource, markAvailable, updateStatus } = useResources();
  // BUG-11: fetch incidents once here; pass them as prop to DeployModal
  // so the modal doesn't create its own duplicate Supabase subscription.
  const { incidents } = useIncidents();
  const { canEdit } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ResourceStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'status' | 'name' | 'updated'>('status');
  const [deployTarget, setDeployTarget] = useState<{ id: string; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total:       resources.length,
    available:   resources.filter((r) => r.availability_status === 'available').length,
    deployed:    resources.filter((r) => r.availability_status === 'deployed').length,
    maintenance: resources.filter((r) => r.availability_status === 'maintenance' || r.availability_status === 'offline').length,
  }), [resources]);

  const filtered = useMemo(() => {
    const result = resources.filter((r) => {
      const nameMatch  = r.resource_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const locMatch   = r.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSearch  = nameMatch || locMatch;
      const matchStatus  = filterStatus === 'all' || r.availability_status === filterStatus;
      const matchType    = filterType === 'all'   || r.resource_type === filterType;
      return matchSearch && matchStatus && matchType;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'status') {
        const order: Record<ResourceStatus, number> = { available: 0, deployed: 1, maintenance: 2, offline: 3 };
        return (order[a.availability_status] ?? 9) - (order[b.availability_status] ?? 9);
      }
      if (sortBy === 'name') return a.resource_name.localeCompare(b.resource_name);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [resources, searchQuery, filterStatus, filterType, sortBy]);

  const handleMarkAvailable = async (id: string) => {
    setActionLoading(id);
    try { await markAvailable(id); } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  const handleUpdateStatus = async (id: string, status: ResourceStatus) => {
    setActionLoading(id);
    try { await updateStatus(id, status); } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  const summaryCards = [
    { label: 'Total Resources',    value: stats.total,       icon: Truck,        color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Available Units',    value: stats.available,   icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Active Deployments', value: stats.deployed,    icon: Zap,          color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Maint. / Offline',   value: stats.maintenance, icon: WrenchIcon,   color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  ];

  return (
    <PageWrapper title="" description="">

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Resource Command Center</h2>
          <p className="text-sm text-slate-400">Real-time deployment and management of all emergency units.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => exportToCsv('resources_report.csv', resources)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export Report
        </motion.button>
      </div>

      <AnimatePresence>
        {deployTarget && (
          <DeployModal
            resourceName={deployTarget.name}
            incidents={incidents}
            onClose={() => setDeployTarget(null)}
            onConfirm={(incidentId) => deployResource(deployTarget.id, incidentId)}
          />
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              {isLoading ? <Skeleton className="h-14 w-full" /> : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-500 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ResourceStatus | 'all')}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_CONFIG) as ResourceStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ResourceType | 'all')}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Types</option>
            {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            onClick={() => setSortBy((prev) => prev === 'status' ? 'name' : prev === 'name' ? 'updated' : 'status')}
            className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort: {sortBy === 'status' ? 'Status' : sortBy === 'name' ? 'Name' : 'Recent'}
          </button>
        </div>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-slate-500"
        >
          <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-300">No resources match your criteria.</p>
          <p className="text-xs mt-1">Try adjusting your filters or clearing the search box.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((resource) => {
              const status  = resource.availability_status ?? 'offline';
              const cfg     = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
              const StatusIcon = cfg.icon;
              const type    = resource.resource_type ?? 'Ambulance';
              const TypeIcon = TYPE_ICON[type] ?? Truck;
              const isActing = actionLoading === resource.id;

              return (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-all ${cfg.glow}`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[type] ?? 'text-slate-400 bg-slate-700/30 border-slate-600/30'}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 leading-tight">{resource.resource_name}</p>
                        <span className={`text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded border mt-0.5 inline-block ${TYPE_COLOR[type] ?? ''}`}>
                          {type}
                        </span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-1.5 text-sm flex-1">
                    {resource.location && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{resource.location}</span>
                      </div>
                    )}
                    {resource.assigned_incident_id && (
                      <div className="flex items-center gap-2 text-orange-400">
                        <Zap className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs">Assigned to active incident</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs">Updated {timeAgo(resource.updated_at)}</span>
                    </div>
                  </div>

                  {/* Action Buttons (Admin / Responder only) */}
                  {canEdit && (
                    <div className="flex gap-2 pt-1 border-t border-slate-800">
                      {status !== 'deployed' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeployTarget({ id: resource.id, name: resource.resource_name })}
                          disabled={isActing}
                          className="flex-1 text-xs font-semibold py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <Zap className="h-3.5 w-3.5" /> Deploy
                        </motion.button>
                      )}
                      {status !== 'available' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMarkAvailable(resource.id)}
                          disabled={isActing}
                          className="flex-1 text-xs font-semibold py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Available
                        </motion.button>
                      )}
                      {status !== 'maintenance' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateStatus(resource.id, 'maintenance')}
                          disabled={isActing}
                          title="Set to Maintenance"
                          className="text-xs font-semibold py-2 px-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-40"
                        >
                          <WrenchIcon className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  );
}
