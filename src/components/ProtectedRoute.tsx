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
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
