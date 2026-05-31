"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────────────
interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
}

// ─── Thresholds (Google's Core Web Vitals standards) ───────────────────────
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },   // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },      // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },    // Cumulative Layout Shift (score)
  INP: { good: 200, poor: 500 },      // Interaction to Next Paint (ms)
  TTFB: { good: 800, poor: 1800 },   // Time to First Byte (ms)
  FCP: { good: 1800, poor: 3000 },   // First Contentful Paint (ms)
};

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

// ─── Send metric to analytics ───────────────────────────────────────────────
function sendToAnalytics(metric: WebVitalMetric) {
  // Log to console in development for debugging
  if (process.env.NODE_ENV === "development") {
    const emoji =
      metric.rating === "good" ? "✅" :
      metric.rating === "needs-improvement" ? "⚠️" : "❌";
    console.log(
      `%c[Web Vitals] ${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      `color: ${metric.rating === "good" ? "#22c55e" : metric.rating === "needs-improvement" ? "#f59e0b" : "#ef4444"}; font-weight: bold;`
    );
  }

  // In production: send to your analytics endpoint
  // Example: Google Analytics 4, Vercel Analytics, PostHog, etc.
  if (process.env.NODE_ENV === "production") {
    // Vercel Analytics (if installed) — window.va is injected by @vercel/analytics
    if (typeof window !== "undefined" && (window as unknown as { va?: (cmd: string, payload: object) => void }).va) {
      (window as unknown as { va: (cmd: string, payload: object) => void }).va("event", {
        name: metric.name,
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        id: metric.id,
        rating: metric.rating,
      });
    }

    // Google Analytics 4 (gtag)
    if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", metric.name, {
        event_category: "Web Vitals",
        event_label: metric.id,
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }

    // Beacon API fallback (works even on page unload)
    if (typeof navigator !== "undefined" && (navigator as { sendBeacon?: (url: string, data: string) => boolean }).sendBeacon) {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        path: window.location.pathname,
        timestamp: Date.now(),
      });
      // Uncomment to send to your own endpoint:
      // navigator.sendBeacon("/api/vitals", body);
      void body; // suppress unused var warning
    }
  }
}

// ─── Core Web Vitals Observer Component ────────────────────────────────────
export function WebVitalsReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Use web-vitals library (installed separately) or PerformanceObserver API
    // We use the native PerformanceObserver API approach here (zero dependencies)
    
    // ── Largest Contentful Paint (LCP) ──────────────────────────────────
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        const value = lastEntry.startTime;
        sendToAnalytics({
          id: "lcp-" + Date.now(),
          name: "LCP",
          value,
          rating: getRating("LCP", value),
          delta: value,
          navigationType: "navigate",
        });
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // LCP not supported in this browser
    }

    // ── Cumulative Layout Shift (CLS) ────────────────────────────────────
    try {
      let clsValue = 0;
      let clsId = "cls-" + Date.now();
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutEntry.hadRecentInput && layoutEntry.value !== undefined) {
            clsValue += layoutEntry.value;
            sendToAnalytics({
              id: clsId,
              name: "CLS",
              value: clsValue,
              rating: getRating("CLS", clsValue),
              delta: layoutEntry.value,
              navigationType: "navigate",
            });
            clsId = "cls-" + Date.now();
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // CLS not supported
    }

    // ── First Input Delay (FID) ──────────────────────────────────────────
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEntry & { processingStart?: number; startTime: number };
          if (fidEntry.processingStart !== undefined) {
            const value = fidEntry.processingStart - fidEntry.startTime;
            sendToAnalytics({
              id: "fid-" + Date.now(),
              name: "FID",
              value,
              rating: getRating("FID", value),
              delta: value,
              navigationType: "navigate",
            });
          }
        }
      });
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch {
      // FID not supported
    }

    // ── Time to First Byte (TTFB) ────────────────────────────────────────
    try {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) {
        const value = navEntry.responseStart;
        sendToAnalytics({
          id: "ttfb-" + Date.now(),
          name: "TTFB",
          value,
          rating: getRating("TTFB", value),
          delta: value,
          navigationType: navEntry.type,
        });
      }
    } catch {
      // TTFB not supported
    }

    // ── First Contentful Paint (FCP) ─────────────────────────────────────
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            const value = entry.startTime;
            sendToAnalytics({
              id: "fcp-" + Date.now(),
              name: "FCP",
              value,
              rating: getRating("FCP", value),
              delta: value,
              navigationType: "navigate",
            });
          }
        }
      });
      fcpObserver.observe({ type: "paint", buffered: true });
    } catch {
      // FCP not supported
    }
  }, [pathname, searchParams]);

  return null; // This component renders nothing — it's a side-effect only tracker
}
