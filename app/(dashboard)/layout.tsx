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

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const close = () => setSidebarOpen(false);
  const toggle = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Desktop sidebar (always visible on lg+) ── */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile full-screen menu overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-slate-950 animate-fade-in">
          <Sidebar onClose={close} mobile />
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6 scrollbar-thin">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      <MobileBottomNav onMenuOpen={toggle} menuOpen={sidebarOpen} />
    </div>
  );
}
