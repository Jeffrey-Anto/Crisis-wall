import { PageWrapper } from "../components/PageWrapper";
import { useAlertContext } from "../contexts/AlertContext";
import { Badge } from "../components/Badge";
import { timeAgo } from "../utils/timeAgo";
import { CheckCheck, ShieldAlert, Activity } from "lucide-react";
import { Skeleton } from "../components/Skeleton";

export function AlertCenter() {
  const { alerts, isLoading, markAsRead, markAllAsRead, unreadCount } = useAlertContext();

  return (
    <PageWrapper title="Alert Center" description="Manage and dispatch critical alerts.">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Recent Alerts</h3>
          <p className="text-sm text-slate-400">You have {unreadCount} unread alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-slate-600 opacity-50" />
            <p>No alerts available.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 flex items-start sm:items-center justify-between transition-colors ${
                  alert.is_read ? 'bg-slate-900/30' : 'bg-slate-800/20'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <Activity className={`h-5 w-5 mt-1 sm:mt-0 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'high' ? 'text-orange-500' :
                    alert.severity === 'medium' ? 'text-yellow-400' : 'text-cyan-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={alert.severity} className="text-[10px] uppercase">
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-slate-500 uppercase tracking-widest">{alert.type}</span>
                      {!alert.is_read && (
                        <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                      )}
                    </div>
                    <p className={`text-sm ${alert.is_read ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{timeAgo(alert.timestamp)}</p>
                  </div>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="ml-4 text-xs font-medium text-cyan-500 hover:text-cyan-400 whitespace-nowrap px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
