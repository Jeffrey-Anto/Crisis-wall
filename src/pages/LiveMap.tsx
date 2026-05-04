import { useState, useMemo } from "react";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { Search as SearchIcon, Filter, AlertTriangle } from "lucide-react";
import { PageWrapper } from "../components/PageWrapper";
import { Badge } from "../components/Badge";
import { useIncidents } from "../hooks/useIncidents";
import type { Severity } from "../types/database";

const createIcon = (severity: Severity) => {
  const colorMap: Record<Severity, string> = {
    low: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]",
    medium: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]",
    high: "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.9)]",
    critical: "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse",
  };
  const colorClass = colorMap[severity] || colorMap.low;
  
  return L.divIcon({
    className: "bg-transparent border-0",
    html: `<div class="h-4 w-4 rounded-full border-2 border-slate-900 ${colorClass}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

const getHeatmapRadius = (severity: Severity) => {
  if (severity === 'critical') return 50000; // 50km
  if (severity === 'high') return 25000; // 25km
  return 0;
};

const getHeatmapColor = (severity: Severity) => {
  if (severity === 'critical') return '#ef4444'; // Red
  if (severity === 'high') return '#f97316'; // Orange
  return 'transparent';
};

export function LiveMap() {
  const { incidents, isLoading } = useIncidents();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeverity, setActiveSeverity] = useState<Severity | "all">("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");

  const mappedIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Must have coordinates to display on map
      if (!incident.latitude || !incident.longitude) return false;
      
      const titleMatch = incident.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const locMatch = incident.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || locMatch;
      
      const matchesSeverity = activeSeverity === "all" || incident.severity === activeSeverity;
      const matchesStatus = activeStatus === "all" || incident.status === activeStatus;
      
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchQuery, activeSeverity, activeStatus]);

  // Center map around global view or specific location (default to US center)
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const center = mappedIncidents.length > 0 && mappedIncidents[0].latitude && mappedIncidents[0].longitude
    ? [mappedIncidents[0].latitude, mappedIncidents[0].longitude] as [number, number]
    : defaultCenter;

  return (
    <PageWrapper title="Live Crisis Map" description="Real-time geographic visualization of active incidents.">
      
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-sm transition-all mb-4 z-10 relative">
        <div className="relative w-full sm:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-0 bg-slate-800/80 py-2 pl-10 pr-3 text-slate-200 ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6"
            placeholder="Search location or title..."
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1">
            <Filter className="h-4 w-4 text-slate-400 mr-1" />
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1">Severity:</span>
            <select 
              value={activeSeverity}
              onChange={(e) => setActiveSeverity(e.target.value as Severity | "all")}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1">Status:</span>
            <select 
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="investigating">Investigating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-xl border border-slate-800 overflow-hidden h-[calc(100vh-220px)] min-h-[500px] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-0">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-[400] flex items-center justify-center">
             <div className="flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 text-cyan-500 animate-pulse mb-3" />
                <p className="text-cyan-400 font-medium">Establishing Satellite Uplink...</p>
             </div>
          </div>
        )}
        
        <MapContainer 
          center={center} 
          zoom={4} 
          className="h-full w-full bg-slate-950"
          zoomControl={false}
        >
          {/* CartoDB Dark Matter Base Map */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Render Incident Markers and Heatmap Risk Zones */}
          {mappedIncidents.map((incident) => {
            if (!incident.latitude || !incident.longitude) return null;
            const pos: [number, number] = [incident.latitude, incident.longitude];

            return (
              // BUG-05: Must use Fragment, not <div>, inside MapContainer.
              // Plain DOM elements break React-Leaflet's context-based layer
              // registration — Circle overlays were silently dropped.
              <React.Fragment key={incident.id}>
                {/* Heatmap-style Risk Zone Overlay for High/Critical */}
                {(incident.severity === 'high' || incident.severity === 'critical') && (
                  <Circle
                    center={pos}
                    radius={getHeatmapRadius(incident.severity)}
                    pathOptions={{
                      color: getHeatmapColor(incident.severity),
                      fillColor: getHeatmapColor(incident.severity),
                      fillOpacity: incident.severity === 'critical' ? 0.3 : 0.15,
                      weight: 1,
                    }}
                  />
                )}
                
                <Marker position={pos} icon={createIcon(incident.severity)}>
                  <Popup 
                    className="crisis-popup"
                    closeButton={false}
                  >
                    <div className="p-3 min-w-[200px]">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={incident.severity} className="uppercase text-[10px] leading-none py-1">
                          {incident.severity}
                        </Badge>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{incident.status}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-100 mb-1 leading-tight">{incident.title}</h3>
                      <p className="text-xs text-slate-400 mb-2">{incident.location}</p>
                      <div className="border-t border-slate-700/50 pt-2 mt-2">
                        <span className="text-[10px] text-slate-500">
                          Detected: {new Date(incident.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Global CSS overrides for Leaflet Popups to match dark theme */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background-color: #0f172a !important; /* slate-900 */
          border: 1px solid #1e293b; /* slate-800 */
          border-radius: 0.75rem !important;
          color: #f1f5f9;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: normal !important;
        }
        .leaflet-popup-tip {
          background-color: #0f172a !important;
          border-top: 1px solid #1e293b;
          border-left: 1px solid #1e293b;
        }
        .leaflet-container {
          background: #020617; /* slate-950 background before tiles load */
        }
      `}</style>

    </PageWrapper>
  );
}
