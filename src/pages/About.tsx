import { PageWrapper } from '../components/PageWrapper';
import { Card, CardContent } from '../components/Card';
import { Brain, Layers, Shield, Zap, Globe, PackageOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export function About() {
  const features = [
    { icon: Brain, title: 'AI Intelligence Engine', desc: 'Rule-based heuristics combined with external data streams compute real-time risk scoring and generate actionable situation summaries.' },
    { icon: Globe, title: 'Live Telemetry Integration', desc: 'Ingests global meteorological data and global disaster news feeds to contextualize local incidents with global threats.' },
    { icon: Zap, title: 'Real-time Synchronization', desc: 'Powered by Supabase Realtime, all dashboards, maps, and AI insights update instantly without page reloads.' },
    { icon: Shield, title: 'Role-Based Access Control', desc: 'Secure enterprise authentication with Admin, Responder, and Viewer tier privileges controlling system mutations.' },
    { icon: PackageOpen, title: 'Dynamic Resource Allocation', desc: 'Track and deploy emergency resources to active incident hot zones instantly.' },
    { icon: Layers, title: 'Production-Grade Architecture', desc: 'Lazy-loaded routes, global error boundaries, custom telemetry logging, and optimized Vite builds.' },
  ];

  return (
    <PageWrapper title="About CrisisWall" description="System documentation and technology architecture.">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hero Lockup */}
        <div className="text-center py-12 border-b border-slate-800">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex h-20 w-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.3)] mb-6"
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">Crisis<span className="text-cyan-400">Wall</span></h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CrisisWall is an advanced, AI-augmented operations command center built to process, analyze, and visualize emergency telemetry in real-time. Designed as a portfolio piece demonstrating production-grade React architecture.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" /> Core Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:border-cyan-500/30 transition-colors group">
                  <CardContent className="p-5 flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/10 transition-colors">
                      <feature.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 mb-1.5">{feature.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="pt-8">
          <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" /> Technology Stack
          </h2>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-wrap gap-2">
            {['React 18', 'TypeScript', 'Vite', 'Supabase Realtime', 'Supabase Auth', 'PostgreSQL', 'Tailwind CSS', 'Framer Motion', 'Lucide Icons', 'React Router v6', 'Recharts', 'Leaflet / React-Leaflet', 'Open-Meteo API', 'GNews API'].map(tech => (
              <span key={tech} className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:border-slate-500 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
