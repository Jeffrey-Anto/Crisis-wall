import { useState, useRef, useEffect } from "react";
import { Search, Activity, ShieldAlert, Users, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIncidents } from "../hooks/useIncidents";
import { useAlertContext } from "../contexts/AlertContext";
import { useResources } from "../hooks/useResources";
import { useExternalIntelligence } from "../hooks/useExternalIntelligence";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { incidents } = useIncidents();
  const { alerts } = useAlertContext();
  const { resources } = useResources();
  const { news } = useExternalIntelligence();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getResults = () => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const results: { type: string; title: string; subtitle: string; icon: any; path: string; id: string }[] = [];

    // Incidents
    const matchedIncidents = incidents.filter(i => 
      i.title.toLowerCase().includes(lowerQuery) || 
      i.location?.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);
    matchedIncidents.forEach(i => results.push({ type: 'Incident', title: i.title, subtitle: i.location || 'Unknown location', icon: Activity, path: '/map', id: `inc-${i.id}` }));

    // Alerts
    const matchedAlerts = alerts.filter(a => 
      a.message.toLowerCase().includes(lowerQuery) || 
      a.type?.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);
    matchedAlerts.forEach(a => results.push({ type: 'Alert', title: a.message, subtitle: a.type || 'System Alert', icon: ShieldAlert, path: '/alerts', id: `alt-${a.id}` }));

    // Resources
    const matchedResources = resources.filter(r => 
      r.resource_name.toLowerCase().includes(lowerQuery) || 
      r.location?.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);
    matchedResources.forEach(r => results.push({ type: 'Resource', title: r.resource_name, subtitle: r.location || 'HQ', icon: Users, path: '/resources', id: `res-${r.id}` }));

    // News
    const matchedNews = news.filter(n => 
      n.title.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);
    matchedNews.forEach((n, idx) => results.push({ type: 'News', title: n.title, subtitle: n.source, icon: Newspaper, path: '/news', id: `news-${idx}` }));

    return results;
  };

  const results = getResults();

  const handleNavigate = (path: string) => {
    navigate(path);
    setQuery("");
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-md hidden sm:block" ref={wrapperRef}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={query}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (results.length > 0) {
              handleNavigate(results[0].path);
            } else if (query.trim()) {
              handleNavigate('/');
              setQuery("");
              setIsFocused(false);
            }
          }
        }}
        className="block w-full rounded-md border-0 bg-slate-800/50 py-1.5 pl-10 pr-3 text-slate-200 ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
        placeholder="Search alerts, resources, news..."
      />

      <AnimatePresence>
        {isFocused && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No matching results found.
                </div>
              ) : (
                <div className="py-2">
                  {results.map((result) => (
                    <div 
                      key={result.id}
                      onClick={() => handleNavigate(result.path)}
                      className="flex items-start px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <result.icon className="h-4 w-4 mt-0.5 mr-3 flex-shrink-0 text-cyan-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">{result.title}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded mr-2">
                            {result.type}
                          </span>
                          <span className="text-xs text-slate-400 truncate">
                            {result.subtitle}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {results.length > 0 && (
              <div className="px-4 py-2 text-center border-t border-slate-800 bg-slate-800/20">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Press enter to go to top result
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
