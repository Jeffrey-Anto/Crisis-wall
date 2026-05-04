import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} className="flex-1">
              <Outlet />
            </motion.div>
          </AnimatePresence>

          {/* Global Footer */}
          <footer className="mt-8 pt-6 border-t border-slate-800/50 text-center opacity-80">
            <p className="text-xs text-slate-500 font-medium">© 2026 CrisisWall. All rights reserved.</p>
            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-semibold">Powered by Real-Time Intelligence</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
