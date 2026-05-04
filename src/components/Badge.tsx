import * as React from "react";
import { cn } from "../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "low" | "medium" | "high" | "critical";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    low: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
    medium: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
    high: "bg-orange-400/10 text-orange-400 border border-orange-400/20",
    critical: "bg-red-400/10 text-red-400 border border-red-400/20 animate-pulse",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
