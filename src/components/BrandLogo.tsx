import { ShieldAlert } from "lucide-react";
import { cn } from "../utils/cn";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  containerClassName?: string;
}

export function BrandLogo({ className, iconClassName, containerClassName }: BrandLogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center", containerClassName)}>
      {/* Outer subtle pulse */}
      <div className="absolute -inset-2 rounded-xl border border-cyan-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
      {/* Inner secondary pulse */}
      <div className="absolute -inset-1 rounded-xl border border-cyan-400/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
      {/* Core shield background */}
      <div className={cn("relative bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-sm", className)}>
        <ShieldAlert className={cn("text-cyan-400", iconClassName)} />
      </div>
    </div>
  );
}
