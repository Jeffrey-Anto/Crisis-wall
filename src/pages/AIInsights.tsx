import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, RefreshCw, ShieldAlert,
  AlertTriangle, Info, CheckCircle2, XCircle, Clock,
  Target, Activity, Lightbulb,
} from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { Card, CardContent } from '../components/Card';

import { useIncidents } from '../hooks/useIncidents';
import { useAlertContext } from '../contexts/AlertContext';
import { useResources } from '../hooks/useResources';
import { useExternalIntelligence } from '../hooks/useExternalIntelligence';
import { useAIInsights } from '../hooks/useAIInsights';
import type { ThreatLevel } from '../utils/aiEngine';

// ─── Config ──────────────────────────────────────────────────────────────────

const THREAT_CONFIG: Record<ThreatLevel, { color: string; bg: string; border: string; glow: string; label: string }> = {
  Low:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',  label: 'LOW' },
  Medium:   { color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/40',  glow: 'shadow-[0_0_20px_rgba(234,179,8,0.25)]',    label: 'MEDIUM' },
  High:     { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/40',  glow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]',   label: 'HIGH' },
  Critical: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/40',     glow: 'shadow-[0_0_30px_rgba(239,68,68,0.35)]',    label: 'CRITICAL' },
};

const INSIGHT_ICON: Record<string, React.ComponentType<any>> = {
  danger:  XCircle,
  warning: AlertTriangle,
  info:    Info,
  success: CheckCircle2,
};

const INSIGHT_COLOR: Record<string, string> = {
  danger:  'text-red-400 border-red-500/30 bg-red-500/5',
  warning: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
  info:    'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
  success: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
};

// ─── Risk Score Gauge ─────────────────────────────────────────────────────────

function RiskGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#ef4444' : score >= 50 ? '#f97316' : score >= 25 ? '#eab308' : '#34d399';

  return (
    <div className="relative flex items-center justify-center h-44 w-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
        {/* Progress */}
        <motion.circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-black text-slate-100"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-slate-500 uppercase tracking-widest">Risk Score</span>
      </div>
    </div>
  );
}

// ─── Processing Animation ─────────────────────────────────────────────────────

function AIProcessing() {
  const lines = [
    'Ingesting incident telemetry...',
    'Evaluating resource coverage vectors...',
    'Cross-referencing alert severity matrix...',
    'Computing geographic risk clusters...',
    'Generating threat assessment...',
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
          <Brain className="h-8 w-8 text-cyan-400 animate-pulse" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-cyan-400 font-semibold tracking-widest uppercase text-sm">AI Engine Processing</p>
        <p className="text-slate-500 text-xs">Analyzing real-time crisis intelligence data...</p>
      </div>
      <div className="space-y-2 w-full max-w-xs">
        {lines.map((line, i) => (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35 }}
            className="flex items-center gap-2 text-xs text-slate-500"
          >
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-cyan-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
            {line}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AIInsights() {
  const { incidents } = useIncidents();
  const { alerts } = useAlertContext();
  const { resources } = useResources();
  const { weather, news } = useExternalIntelligence();
  const { analysis, isProcessing, refresh } = useAIInsights(incidents, alerts, resources, weather, news);

  const threatCfg = analysis ? THREAT_CONFIG[analysis.threatLevel] : null;

  // Confidence bar color
  const confColor = (c: number) =>
    c >= 85 ? 'bg-emerald-500' : c >= 65 ? 'bg-yellow-500' : 'bg-orange-500';

  return (
    <PageWrapper title="AI Intelligence Layer" description="Rule-based threat intelligence powered by live crisis data.">

      {/* Header Action */}
      <div className="flex justify-end mb-5">
        <button
          onClick={refresh}
          disabled={isProcessing}
          className="flex items-center gap-2 text-sm text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          {isProcessing ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isProcessing || !analysis ? (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardContent>
                <AIProcessing />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* ── Row 1: Risk Gauge + Threat Level + Summary ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Risk Gauge Card */}
              <Card className="flex flex-col items-center justify-center py-6">
                <RiskGauge score={analysis.riskScore} />
                <div className="mt-2 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Overall Confidence</p>
                  <div className="mt-1.5 h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${confColor(analysis.overallConfidence)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.overallConfidence}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{analysis.overallConfidence}% confidence</p>
                </div>
              </Card>

              {/* Threat Level Card */}
              <Card className={`border ${threatCfg!.border} ${threatCfg!.glow} flex flex-col items-center justify-center py-8`}>
                <ShieldAlert className={`h-10 w-10 mb-3 ${threatCfg!.color}`} />
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Threat Level</p>
                <p className={`text-4xl font-black tracking-tight ${threatCfg!.color}`}>
                  {analysis.threatLevel.toUpperCase()}
                </p>
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${threatCfg!.bg} ${threatCfg!.color} border ${threatCfg!.border}`}>
                  Risk Score: {analysis.riskScore} / 100
                </div>
              </Card>

              {/* Suggested Action Card */}
              <Card className="flex flex-col justify-between py-5 px-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Suggested Action</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">{analysis.suggestedAction}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-800 pt-3">
                  <Clock className="h-3.5 w-3.5" />
                  Generated {analysis.generatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </Card>
            </div>

            {/* ── AI Summary Banner ── */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-slate-900/50 to-slate-900/50 border border-cyan-500/20 rounded-xl p-5 flex items-start gap-4">
              <Brain className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1.5">AI Situation Summary</p>
                <p className="text-slate-200 text-sm leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            {/* ── Row 2: Insights List + Stats ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Insights */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                    AI Insights ({analysis.insights.length})
                  </h3>
                </div>
                <AnimatePresence>
                  {analysis.insights.map((insight, i) => {
                    const InsightIcon = INSIGHT_ICON[insight.type] ?? Info;
                    const colorClass = INSIGHT_COLOR[insight.type] ?? INSIGHT_COLOR.info;
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`border rounded-xl p-4 ${colorClass}`}
                      >
                        <div className="flex items-start gap-3">
                          <InsightIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold">{insight.title}</p>
                              <span className="text-[10px] font-bold opacity-75 whitespace-nowrap">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                            <p className="text-xs opacity-80 leading-relaxed">{insight.description}</p>
                            {/* Confidence bar */}
                            <div className="mt-2.5 h-1 bg-black/20 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-current opacity-60"
                                initial={{ width: 0 }}
                                animate={{ width: `${insight.confidence}%` }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Quick Stats Panel */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Data Feed</h3>
                </div>
                {[
                  { label: 'Total Incidents',    value: incidents.length,                                                   color: 'text-slate-200' },
                  { label: 'Active Incidents',   value: incidents.filter(i => i.status === 'active').length,               color: 'text-orange-400' },
                  { label: 'Critical Incidents', value: incidents.filter(i => i.severity === 'critical').length,           color: 'text-red-400' },
                  { label: 'Total Alerts',       value: alerts.length,                                                      color: 'text-slate-200' },
                  { label: 'Unread Alerts',      value: alerts.filter(a => !a.is_read).length,                             color: 'text-yellow-400' },
                  { label: 'Available Units',    value: resources.filter(r => r.availability_status === 'available').length, color: 'text-emerald-400' },
                  { label: 'Deployed Units',     value: resources.filter(r => r.availability_status === 'deployed').length,  color: 'text-orange-400' },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5">
                    <span className="text-xs text-slate-400">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}

                {/* Threat level history placeholder */}
                <div className="mt-2 bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Threat Breakdown</p>
                  {(['Critical', 'High', 'Medium', 'Low'] as ThreatLevel[]).map((lvl) => {
                    const cfg = THREAT_CONFIG[lvl];
                    const count = incidents.filter(i => i.severity === lvl.toLowerCase()).length;
                    const pct = incidents.length > 0 ? (count / incidents.length) * 100 : 0;
                    return (
                      <div key={lvl} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={cfg.color}>{lvl}</span>
                          <span className="text-slate-500">{count}</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${cfg.bg.replace('/10', '')}`}
                            style={{ backgroundColor: lvl === 'Critical' ? '#ef4444' : lvl === 'High' ? '#f97316' : lvl === 'Medium' ? '#eab308' : '#34d399' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
