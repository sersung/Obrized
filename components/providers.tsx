"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <WebVitalsReporter />
      </Suspense>
      {children}
    </SessionProvider>
  );
}
