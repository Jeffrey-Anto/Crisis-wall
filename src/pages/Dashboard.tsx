import { useState } from "react";
import { Activity, AlertOctagon, CheckCircle2, Users, Search as SearchIcon, Filter, ServerCrash, Brain, Zap, Download, Inbox } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { PageWrapper } from "../components/PageWrapper";
import { Skeleton } from "../components/Skeleton";
import { Badge } from "../components/Badge";
import { Link } from "react-router-dom";

// Hooks
import { useIncidents } from "../hooks/useIncidents";
import { useAlertContext } from "../contexts/AlertContext";
import { useResources } from "../hooks/useResources";
import { useAIInsights } from "../hooks/useAIInsights";
import { useExternalIntelligence } from "../hooks/useExternalIntelligence";
import { useChartReady } from "../hooks/useChartReady";
import { LiveIntelligenceWidget } from "../components/LiveIntelligenceWidget";
import { timeAgo } from "../utils/timeAgo";
import { exportToCsv } from "../utils/exportCsv";
import type { Severity } from "../types/database";



export function Dashboard() {
  const { incidents, isLoading: isIncidentsLoading, error: incidentsError } = useIncidents();
  const { alerts, isLoading: isAlertsLoading } = useAlertContext();
  const { resources, isLoading: isResourcesLoading } = useResources();
  const { weather, news, isLoading: isExternalLoading, refresh } = useExternalIntelligence();
  const { analysis, isProcessing } = useAIInsights(incidents, alerts, resources, weather, news);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Severity | "all">("all");

  // Per-chart ResizeObserver guards — chart renders only after container has real pixel dims
  const pieChart = useChartReady();
  const areaChart = useChartReady();

  const isLoading = isIncidentsLoading || isAlertsLoading || isResourcesLoading;
  const hasError = incidentsError; // Simplified error check

  // Filtered Activity (Unified Incidents & Alerts)
  const filteredIncidents = incidents.filter((incident) => {
    const titleMatch = incident.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const locMatch = incident.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || locMatch;
    const matchesFilter = activeFilter === "all" || incident.severity === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Computed Card Data based on filtered incidents
  const activeIncidents = filteredIncidents.filter(i => i.status === 'active').length;
  const highRiskZones = filteredIncidents.filter(i => i.severity === 'high' || i.severity === 'critical').length;
  
  const filteredAlerts = alerts.filter((alert) => {
    const titleMatch = alert.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = alert.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || typeMatch;
    const matchesFilter = activeFilter === "all" || alert.severity === activeFilter;
    return matchesSearch && matchesFilter;
  });
  const totalAlerts = filteredAlerts.length;

  const filteredResources = resources.filter((resource) => {
    const titleMatch = resource.resource_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = resource.resource_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const locMatch = resource.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || typeMatch || locMatch;
  });
  const availableResources = filteredResources.filter(r => r.availability_status === 'available').length;

  // Filtered Activity (Unified Incidents & Alerts)
  const unifiedActivity = [...filteredIncidents.map(i => ({
    id: i.id,
    type: 'Incident',
    title: i.title,
    location: i.location,
    severity: i.severity,
    time: i.created_at
  })), ...filteredAlerts.map(a => ({
    id: a.id,
    type: a.type || 'Alert',
    title: a.message,
    location: '',
    severity: a.severity,
    time: a.timestamp
  }))].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Dynamic Area Chart Data (Bucket unifiedActivity by 4-hour windows)
  const currentHour = new Date().getHours();
  const areaData = Array.from({ length: 7 }).map((_, i) => {
    const hoursAgo = (6 - i) * 4;
    const bucketTime = new Date();
    bucketTime.setHours(currentHour - hoursAgo);
    
    const start = bucketTime.getTime() - 4 * 60 * 60 * 1000;
    const end = bucketTime.getTime();
    
    const count = unifiedActivity.filter(item => {
      const t = new Date(item.time).getTime();
      return t >= start && t <= end;
    }).length;
    
    return {
      name: `${bucketTime.getHours()}:00`,
      alerts: count
    };
  });

  // Dynamic Pie Chart Data
  const getSeverityCount = (sev: Severity) => filteredIncidents.filter(i => i.severity === sev).length;
  const pieData = [
    { name: 'Low', value: getSeverityCount('low'), color: '#34d399' },
    { name: 'Medium', value: getSeverityCount('medium'), color: '#60a5fa' },
    { name: 'High', value: getSeverityCount('high'), color: '#fb923c' },
    { name: 'Critical', value: getSeverityCount('critical'), color: '#f87171' },
  ].filter(d => d.value > 0); // only show if there is data

  if (hasError) {
    return (
      <PageWrapper title="Global Overview" description="Monitor live crises and system status.">
        <div className="flex flex-col items-center justify-center h-96 text-red-400 space-y-4">
          <ServerCrash className="h-12 w-12" />
          <p>Error connecting to Database: {incidentsError}</p>
        </div>
      </PageWrapper>
    );
  }
  return (
    <PageWrapper title="" description="">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Global Overview</h2>
          <p className="text-sm text-slate-400">Live synchronization active via Supabase Realtime.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => exportToCsv('incidents_report.csv', incidents)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export Report
        </motion.button>
      </div>

      {/* Live Intelligence (Weather & News) */}
      <LiveIntelligenceWidget weather={weather} news={news} isLoading={isExternalLoading} onRefresh={refresh} />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-sm transition-all hover:border-slate-700">
        <div className="relative w-full sm:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-0 bg-slate-800/80 py-2 pl-10 pr-3 text-slate-200 ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 transition-all"
            placeholder="Search events by name or location..."
          />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 mr-1 flex-shrink-0" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter("all")} className={`px-3 py-1 text-xs rounded-full border transition-colors flex-shrink-0 cursor-pointer ${activeFilter === "all" ? "bg-slate-700 text-white border-slate-600" : "bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800"}`}>All</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter("low")} className={`px-3 py-1 text-xs rounded-full border transition-colors flex-shrink-0 cursor-pointer ${activeFilter === "low" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800"}`}>Low</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter("medium")} className={`px-3 py-1 text-xs rounded-full border transition-colors flex-shrink-0 cursor-pointer ${activeFilter === "medium" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800"}`}>Medium</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter("high")} className={`px-3 py-1 text-xs rounded-full border transition-colors flex-shrink-0 cursor-pointer ${activeFilter === "high" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800"}`}>High</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter("critical")} className={`px-3 py-1 text-xs rounded-full border transition-colors flex-shrink-0 cursor-pointer ${activeFilter === "critical" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800"}`}>Critical</motion.button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Active Incidents</CardTitle>
                <Activity className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeIncidents}</div>
                <p className="text-xs text-emerald-400 flex items-center mt-1">
                  Live DB Connection
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">High Risk Zones</CardTitle>
                <AlertOctagon className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highRiskZones}</div>
                <p className="text-xs text-orange-400 flex items-center mt-1">
                  Requiring attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Emergency Alerts</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAlerts}</div>
                <p className="text-xs text-slate-500 mt-1">Active notifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Available Resources</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableResources}</div>
                <p className="text-xs text-emerald-400 flex items-center mt-1">
                  Ready for deployment
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* AI Intelligence Widget */}
      <Link to="/ai" className="block group">
        <div className="bg-gradient-to-r from-cyan-500/10 via-slate-900/60 to-slate-900/50 border border-cyan-500/20 rounded-xl p-4 flex items-center gap-4 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Brain className={`h-5 w-5 text-cyan-400 ${isProcessing ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-0.5">AI Situation Assessment</p>
            {isProcessing || !analysis ? (
              <p className="text-sm text-slate-400 animate-pulse">Analyzing real-time data...</p>
            ) : (
              <p className="text-sm text-slate-300 truncate">{analysis.summary}</p>
            )}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {analysis && !isProcessing && (
              <>
                <div className="text-center hidden sm:block">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Risk Score</p>
                  <p className={`text-xl font-black ${analysis.riskScore >= 75 ? 'text-red-400' : analysis.riskScore >= 50 ? 'text-orange-400' : analysis.riskScore >= 25 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {analysis.riskScore}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                  analysis.threatLevel === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  analysis.threatLevel === 'High'     ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                  analysis.threatLevel === 'Medium'   ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  <Zap className="h-3.5 w-3.5" />
                  {analysis.threatLevel}
                </div>
              </>
            )}
            <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors hidden sm:block">View Full Analysis →</span>
          </div>
        </div>
      </Link>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-3 min-w-0">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={pieChart.containerRef} className="w-full min-w-0 h-[320px] min-h-[320px] overflow-hidden">
              {isLoading || !pieChart.isReady ? (
                <div className="flex justify-center items-center h-full">
                  <Skeleton className="h-64 w-64 rounded-full" />
                </div>
              ) : pieData.length > 0 ? (
                <PieChart width={pieChart.width} height={pieChart.height}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-slate-500">No data available.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-4 min-w-0">
          <CardHeader>
            <CardTitle>Incident Trend (24h)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div ref={areaChart.containerRef} className="w-full min-w-0 h-[320px] min-h-[320px] overflow-hidden">
              {isLoading || !areaChart.isReady ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <AreaChart width={areaChart.width} height={areaChart.height} data={areaData}>
                  <defs>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Area type="monotone" dataKey="alerts" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
                </AreaChart>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-4 lg:col-span-7 min-w-0">
          <CardHeader>
            <CardTitle>Live Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {unifiedActivity.length > 0 ? (
                    unifiedActivity.slice(0, 20).map((item) => (
                      <motion.div 
                        key={`${item.type}-${item.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start sm:items-center bg-slate-900/30 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="hidden sm:block mr-4">
                          <Badge variant={item.severity} className="capitalize w-20 justify-center">
                            {item.severity}
                          </Badge>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start sm:items-center">
                            <div className="text-sm font-medium leading-none text-slate-200 flex items-center">
                              <span className="sm:hidden mr-2">
                                <Badge variant={item.severity} className="capitalize text-[10px] px-1.5 py-0">
                                  {item.severity}
                                </Badge>
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest mr-2">{item.type}</span>
                              {item.title}
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                              {timeAgo(item.time)}
                            </span>
                          </div>
                          {item.location && <p className="text-sm text-slate-400">Location: {item.location}</p>}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="flex flex-col items-center justify-center py-16 text-slate-500"
                    >
                      <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">No events detected.</p>
                      <p className="text-xs mt-1">System is currently monitoring for new telemetry.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
