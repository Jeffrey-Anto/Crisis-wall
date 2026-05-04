import { Radio } from 'lucide-react';

export function GlobalLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full" />
        <div className="h-16 w-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
          <Radio className="h-6 w-6 text-cyan-400 animate-pulse" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-ping" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-[0.2em] uppercase">
            Establishing Connection
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-mono">Initializing Intelligence Modules...</p>
      </div>
    </div>
  );
}
