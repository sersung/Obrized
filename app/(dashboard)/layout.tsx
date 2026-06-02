"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route changes (catch-all via pathname change)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const close = () => setSidebarOpen(false);
  const toggle = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Mobile backdrop ── */}
      <div
        className={`
          fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm
          transition-opacity duration-300 lg:hidden
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Sidebar — full drawer on mobile, static on desktop ── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar onClose={close} />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav onMenuToggle={toggle} sidebarOpen={sidebarOpen} />

        {/* Extra bottom padding on mobile for the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:pb-6 pb-24 scrollbar-thin">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      <MobileBottomNav onMenuOpen={toggle} menuOpen={sidebarOpen} />
    </div>
  );
}
