import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  BarChart2, 
  Newspaper, 
  Package, 
  Settings, 
  ShieldAlert,
  Brain,
  X,
  Info,
  Database
} from "lucide-react";
import { cn } from "../utils/cn";
import { BrandLogo } from "./BrandLogo";
import { loadDemoData } from "../utils/demoData";
import { useState } from "react";
import toast from "react-hot-toast";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Live Crisis Map', href: '/map', icon: Map },
  { name: 'Alert Center', href: '/alerts', icon: AlertTriangle },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'AI Intelligence', href: '/ai', icon: Brain },
  { name: 'News Intelligence', href: '/news', icon: Newspaper },
  { name: 'Resource Management', href: '/resources', icon: Package },
  { name: 'Admin Panel', href: '/admin', icon: ShieldAlert },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'About & Tech', href: '/about', icon: Info },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLoad = async () => {
    setIsDemoLoading(true);
    const toastId = toast.loading('Populating database with demo data...');
    const success = await loadDemoData();
    if (success) {
      toast.success('Demo data loaded successfully! Real-time sync active.', { id: toastId });
    } else {
      toast.error('Failed to load demo data.', { id: toastId });
    }
    setIsDemoLoading(false);
  };
  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex flex-col h-20 px-6 border-b border-slate-800 justify-center relative">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-8 w-8 rounded-lg" iconClassName="h-4 w-4" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              Crisis<span className="text-cyan-400">Wall</span>
            </h1>
            <p className="text-[8px] text-cyan-500/80 font-bold uppercase tracking-widest mt-1">Real-Time Crisis Intelligence</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                isActive
                  ? 'bg-blue-600/10 text-cyan-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
              )
            }
          >
            <item.icon
              className="mr-3 h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleDemoLoad}
          disabled={isDemoLoading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Database className={`h-4 w-4 ${isDemoLoading ? 'animate-bounce' : ''}`} />
          {isDemoLoading ? 'Loading...' : 'Load Demo Data'}
        </button>
      </div>
    </div>
  );
}
