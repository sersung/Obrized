"use client";

import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import MobileTopNav from "@/components/layout/MobileTopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ── Mobile: top bar (fixed) + slide-down menu ── */}
      <MobileTopNav />

      {/* ── Desktop + Mobile container ── */}
      <div className="flex h-screen overflow-hidden bg-gray-50">

        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Desktop top nav — hidden on mobile */}
          <div className="hidden lg:block">
            <TopNav />
          </div>

          {/* Content — pt-14 on mobile compensates for fixed top bar */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pt-[72px] lg:pt-6 scrollbar-thin">
            {children}
          </main>
        </div>

      </div>
    </>
  );
}
