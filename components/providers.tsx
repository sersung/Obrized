"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";

export default function Providers({ children }: { children: React.ReactNode }) {
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <>
      {/* Web Vitals: tracks LCP, CLS, FID, TTFB, FCP silently in background */}
      <Suspense fallback={null}>
        <WebVitalsReporter />
      </Suspense>
      {children}
    </>
  );

  if (!isClerkConfigured) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
