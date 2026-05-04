import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Wind, Thermometer, CloudLightning, Newspaper, AlertTriangle, RefreshCw, Radio } from 'lucide-react';
import type { WeatherData, NewsArticle } from '../services/externalIntelligence';

interface LiveIntelligenceWidgetProps {
  weather: WeatherData | null;
  news: NewsArticle[];
  isLoading: boolean;
}

export function LiveIntelligenceWidget({ weather, news, isLoading }: LiveIntelligenceWidgetProps) {
  if (isLoading && !weather && news.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex items-center justify-center h-32 animate-pulse">
        <div className="flex items-center gap-3 text-cyan-500/50">
          <Radio className="h-5 w-5 animate-pulse" /> {/* BUG-12: animate-spin-slow doesn't exist in Tailwind */}
          <span className="text-sm font-medium tracking-widest uppercase">Establishing Satellite Uplink...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      {/* ── Weather Module ── */}
      <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
          <RefreshCw className="h-3 w-3 text-slate-400" />
        </div>
        
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Meteorological Data</h3>
          </div>
          {weather?.isStormWarning && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest animate-pulse">
              <AlertTriangle className="h-3 w-3" /> Warning
            </span>
          )}
        </div>

        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-widest">
              <Thermometer className="h-3 w-3" /> Core Temp
            </div>
            <p className="text-2xl font-light text-slate-200">
              {weather ? Math.round(weather.temperature) : '--'}°<span className="text-slate-500 text-lg">C</span>
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-widest">
              <Wind className="h-3 w-3" /> Wind Vel
            </div>
            <p className="text-2xl font-light text-slate-200">
              {weather ? Math.round(weather.windSpeed) : '--'} <span className="text-slate-500 text-sm">km/h</span>
            </p>
          </div>
          <div className="space-y-1 col-span-2 pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-widest">
              <CloudLightning className="h-3 w-3" /> Precipitation Prob
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${weather && weather.rainProbability > 50 ? 'bg-blue-500' : 'bg-cyan-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${weather?.rainProbability || 0}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="text-xs font-medium text-slate-300 w-8">{weather?.rainProbability || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Global News Feed ── */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Global Intelligence Feed</h3>
          </div>
          <span className="flex items-center gap-2 text-[10px] text-emerald-400 font-medium uppercase tracking-widest">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>
        
        <div className="flex-1 p-0 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent" />
          <div className="h-[120px] overflow-y-auto custom-scrollbar p-2">
            <AnimatePresence>
              {news.map((item, idx) => (
                <motion.div 
                  key={`${item.title}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 hover:bg-slate-800/50 rounded-lg transition-colors border-b border-slate-800/30 last:border-0 group"
                >
                  <div className="flex-1 min-w-0">
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors truncate block">
                      {item.title}
                    </a>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 uppercase tracking-wider">
                      <span className="text-cyan-500/70">{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {news.length === 0 && !isLoading && (
                <div className="p-4 text-xs text-slate-500 flex items-center justify-center h-full">
                  No critical updates detected in global feeds.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
