import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Menu, Activity, LogOut, CheckCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useAlertContext } from "../contexts/AlertContext";
import { Badge } from "./Badge";
import { timeAgo } from "../utils/timeAgo";
import { useNavigate, Link } from "react-router-dom";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  // BUG-06: controlled state for the global search input
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const { user, profile, signOut } = useAuth();
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlertContext();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAlertColor = (severity: string) => {
    if (severity === 'critical') return 'text-red-500';
    if (severity === 'high') return 'text-orange-500';
    if (severity === 'medium') return 'text-yellow-400';
    return 'text-cyan-500';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center flex-1">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="mr-4 md:hidden text-slate-400 hover:text-slate-100 cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              // BUG-06: navigate to dashboard on Enter so search is functional
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate('/');
                setSearchQuery('');
              }
            }}
            className="block w-full rounded-md border-0 bg-slate-800/50 py-1.5 pl-10 pr-3 text-slate-200 ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
            placeholder="Search alerts, resources, news..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer focus:outline-none"
          >
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <Bell className="h-5 w-5" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-cyan-400 cursor-pointer hover:underline flex items-center"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[350px] overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500 text-sm">
                      No recent alerts.
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        onClick={() => !alert.is_read && markAsRead(alert.id)}
                        className={`flex items-start px-4 py-3 transition-colors border-b border-slate-800/50 last:border-0 ${
                          alert.is_read ? 'bg-slate-900/50 opacity-70' : 'bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer'
                        }`}
                      >
                        <Activity className={`h-4 w-4 mt-0.5 mr-3 flex-shrink-0 ${getAlertColor(alert.severity)}`} />
                        <div className="flex-1">
                          <p className={`text-sm ${alert.is_read ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                              {alert.type}
                            </span>
                            <span className="text-xs text-slate-500">
                              {timeAgo(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                        {!alert.is_read && (
                          <div className="w-2 h-2 ml-2 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 text-center border-t border-slate-800 bg-slate-800/20">
                  {/* BUG-07: was a dead <span> with no navigation */}
                  <Link
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium tracking-wide"
                  >
                    VIEW ALERT CENTER
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center cursor-pointer border border-slate-600 hover:border-cyan-500 transition-colors"
          >
            <User className="h-5 w-5 text-slate-300" />
          </div>

          <AnimatePresence>
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.email}</p>
                  <div className="mt-1">
                    <Badge variant="default" className="text-[10px] uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {profile?.role || "Viewer"}
                    </Badge>
                  </div>
                </div>
                <div className="py-1">
                  <button 
                    onClick={signOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
