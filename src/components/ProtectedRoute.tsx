import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AlertTriangle } from "lucide-react";
import type { UserRole } from "../types/database";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <AlertTriangle className="h-10 w-10 text-cyan-500 animate-pulse mb-4" />
        <p className="text-cyan-400 font-medium tracking-widest uppercase text-sm">Authenticating Identity...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-restricted route: wait for profile to load before making the decision.
  // Without this guard, profile=null during fetch would fall through to <Outlet />,
  // briefly granting access to any authenticated user regardless of role.
  if (allowedRoles) {
    if (!profile) {
      // Profile still resolving — show clearance spinner instead of granting access
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-cyan-500 animate-pulse mb-4" />
          <p className="text-cyan-400 font-medium tracking-widest uppercase text-sm">Verifying Clearance Level...</p>
        </div>
      );
    }
    if (!allowedRoles.includes(profile.role)) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-100 mb-2 uppercase tracking-widest">Access Restricted</h1>
            <p className="text-slate-400 mb-6">Admin Clearance Required. Your current clearance level ({profile.role}) does not permit access to this sector.</p>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
}
