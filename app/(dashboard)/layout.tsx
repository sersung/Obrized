"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import MobileTopNav from "@/components/layout/MobileTopNav";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-gray-50">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading workspace...</p>
      </div>
    );
  }

  // Render nothing while redirecting if unauthenticated
  if (status === "unauthenticated") {
    return null;
  }

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
