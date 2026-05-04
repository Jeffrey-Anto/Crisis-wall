import { useState, useEffect } from "react";
import { PageWrapper } from "../components/PageWrapper";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "../components/Badge";
import { User, Bell, Moon } from "lucide-react";

export function Settings() {
  const { user, profile } = useAuth();
  const [audioPing, setAudioPing] = useState(() => localStorage.getItem("setting_audioPing") !== "false");
  const [emailDigest, setEmailDigest] = useState(() => localStorage.getItem("setting_emailDigest") === "true");

  useEffect(() => {
    localStorage.setItem("setting_audioPing", String(audioPing));
  }, [audioPing]);

  useEffect(() => {
    localStorage.setItem("setting_emailDigest", String(emailDigest));
  }, [emailDigest]);

  return (
    <PageWrapper title="Settings" description="Personalize your command center experience.">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
            <User className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-slate-200">Account Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-800/50 pb-4">
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Email Address</div>
              <div className="md:col-span-2 text-slate-200 font-medium">{user?.email || 'N/A'}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-800/50 pb-4">
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">User ID</div>
              <div className="md:col-span-2 text-slate-400 text-sm">{user?.id || 'N/A'}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Clearance Level</div>
              <div className="md:col-span-2">
                <Badge variant="default" className="uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  {profile?.role || "Viewer"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
            <Bell className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-slate-200">Notification Preferences</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium mb-1">Critical Alerts Audio Ping</p>
                <p className="text-sm text-slate-500">Play an audible warning when a critical alert is received.</p>
              </div>
              <div 
                onClick={() => setAudioPing(!audioPing)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${audioPing ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${audioPing ? 'bg-white right-1' : 'bg-slate-400 left-1'}`}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium mb-1">Email Daily Digest</p>
                <p className="text-sm text-slate-500">Receive a daily summary of resolved and active incidents.</p>
              </div>
              <div 
                onClick={() => setEmailDigest(!emailDigest)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${emailDigest ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${emailDigest ? 'bg-white right-1' : 'bg-slate-400 left-1'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
            <Moon className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-slate-200">Appearance</h3>
          </div>
          <div className="p-6">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium mb-1">Theme</p>
                <p className="text-sm text-slate-500">The command center is permanently locked to Dark Mode for optimal contrast in low-light environments.</p>
              </div>
              <Badge variant="default" className="bg-slate-800 text-slate-400 border-slate-700">Dark Mode (Locked)</Badge>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
