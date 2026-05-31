"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Globe,
  BarChart3,
  Clock,
  Activity,
  Monitor,
  Smartphone,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface VitalMetric {
  name: string;
  label: string;
  value: number | null;
  unit: string;
  rating: "good" | "needs-improvement" | "poor" | "loading";
  good: number;
  poor: number;
  description: string;
}

// ─── Thresholds ─────────────────────────────────────────────────────────────
const VITALS_CONFIG: Omit<VitalMetric, "value" | "rating">[] = [
  {
    name: "LCP",
    label: "Largest Contentful Paint",
    unit: "ms",
    good: 2500,
    poor: 4000,
    description: "Measures how quickly the largest content element on your page loads. Poor LCP means users see blank space too long.",
  },
  {
    name: "FCP",
    label: "First Contentful Paint",
    unit: "ms",
    good: 1800,
    poor: 3000,
    description: "Time until the browser renders the first bit of content. Directly affects perceived load speed.",
  },
  {
    name: "CLS",
    label: "Cumulative Layout Shift",
    unit: "score",
    good: 0.1,
    poor: 0.25,
    description: "Measures visual stability. High CLS means elements jump around during load, causing frustration.",
  },
  {
    name: "FID",
    label: "First Input Delay",
    unit: "ms",
    good: 100,
    poor: 300,
    description: "Time from when a user first interacts with your page to when the browser responds.",
  },
  {
    name: "TTFB",
    label: "Time to First Byte",
    unit: "ms",
    good: 800,
    poor: 1800,
    description: "Measures server response time. High TTFB indicates slow server or network issues.",
  },
];

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const config = VITALS_CONFIG.find((v) => v.name === name);
  if (!config) return "good";
  if (value <= config.good) return "good";
  if (value <= config.poor) return "needs-improvement";
  return "poor";
}

function getRatingColor(rating: VitalMetric["rating"]) {
  switch (rating) {
    case "good": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    case "needs-improvement": return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    case "poor": return "text-rose-400 border-rose-500/30 bg-rose-500/10";
    default: return "text-slate-400 border-slate-700 bg-slate-800/50";
  }
}

function getRatingBadge(rating: VitalMetric["rating"]) {
  switch (rating) {
    case "good": return { icon: CheckCircle2, label: "Good", color: "text-emerald-400" };
    case "needs-improvement": return { icon: AlertTriangle, label: "Needs Work", color: "text-amber-400" };
    case "poor": return { icon: AlertTriangle, label: "Poor", color: "text-rose-400" };
    default: return { icon: Activity, label: "Measuring…", color: "text-slate-400" };
  }
}

function getScoreBar(value: number, good: number, poor: number, unit: string) {
  const max = poor * 1.5;
  const percentage = Math.min((value / max) * 100, 100);
  const goodPct = (good / max) * 100;
  const poorPct = (poor / max) * 100;
  const display = unit === "score" ? value.toFixed(3) : `${Math.round(value)}ms`;

  return { percentage, goodPct, poorPct, display };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function SpeedInsightsPage() {
  const [vitals, setVitals] = useState<VitalMetric[]>(
    VITALS_CONFIG.map((v) => ({ ...v, value: null, rating: "loading" as const }))
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastMeasured, setLastMeasured] = useState<Date | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  const measureVitals = useCallback(() => {
    setIsRefreshing(true);

    const updates: Partial<VitalMetric>[] = [];
    let measured = 0;
    const total = VITALS_CONFIG.length;

    const checkDone = () => {
      measured++;
      if (measured >= total) {
        setVitals((prev) =>
          prev.map((v) => {
            const u = updates.find((u) => u.name === v.name);
            return u ? { ...v, ...u } : v;
          })
        );
        setLastMeasured(new Date());
        setIsRefreshing(false);

        // Calculate overall score (0–100) weighted by importance
        const weights: Record<string, number> = { LCP: 0.25, FCP: 0.15, CLS: 0.25, FID: 0.25, TTFB: 0.1 };
        let score = 0;
        let totalWeight = 0;
        updates.forEach((u) => {
          if (u.name && u.rating && u.rating !== "loading") {
            const w = weights[u.name] || 0;
            const pts = u.rating === "good" ? 100 : u.rating === "needs-improvement" ? 65 : 30;
            score += pts * w;
            totalWeight += w;
          }
        });
        if (totalWeight > 0) setOverallScore(Math.round(score / totalWeight));
      }
    };

    // Measure LCP
    try {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as { startTime: number };
        const value = last.startTime;
        updates.push({ name: "LCP", value, rating: getRating("LCP", value) });
        lcpObs.disconnect();
        checkDone();
      });
      lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => {
        if (!updates.find((u) => u.name === "LCP")) {
          updates.push({ name: "LCP", value: null, rating: "loading" });
          checkDone();
        }
      }, 3000);
    } catch {
      updates.push({ name: "LCP", value: null, rating: "loading" });
      checkDone();
    }

    // Measure FCP
    try {
      const fcpObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            const value = entry.startTime;
            updates.push({ name: "FCP", value, rating: getRating("FCP", value) });
            fcpObs.disconnect();
            checkDone();
            return;
          }
        }
      });
      fcpObs.observe({ type: "paint", buffered: true });
      setTimeout(() => {
        if (!updates.find((u) => u.name === "FCP")) {
          updates.push({ name: "FCP", value: null, rating: "loading" });
          checkDone();
        }
      }, 3000);
    } catch {
      updates.push({ name: "FCP", value: null, rating: "loading" });
      checkDone();
    }

    // Measure CLS
    try {
      let clsValue = 0;
      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const e = entry as { hadRecentInput?: boolean; value?: number };
          if (!e.hadRecentInput && e.value !== undefined) {
            clsValue += e.value;
          }
        }
      });
      clsObs.observe({ type: "layout-shift", buffered: true });
      setTimeout(() => {
        clsObs.disconnect();
        updates.push({ name: "CLS", value: clsValue, rating: getRating("CLS", clsValue) });
        checkDone();
      }, 4000);
    } catch {
      updates.push({ name: "CLS", value: null, rating: "loading" });
      checkDone();
    }

    // Measure FID
    try {
      const fidObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const e = entry as { processingStart?: number; startTime: number };
          if (e.processingStart !== undefined) {
            const value = e.processingStart - e.startTime;
            updates.push({ name: "FID", value, rating: getRating("FID", value) });
            fidObs.disconnect();
            checkDone();
            return;
          }
        }
      });
      fidObs.observe({ type: "first-input", buffered: true });
      setTimeout(() => {
        if (!updates.find((u) => u.name === "FID")) {
          updates.push({ name: "FID", value: null, rating: "loading" });
          checkDone();
        }
      }, 5000);
    } catch {
      updates.push({ name: "FID", value: null, rating: "loading" });
      checkDone();
    }

    // Measure TTFB (synchronous from Navigation Timing)
    try {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) {
        const value = navEntry.responseStart;
        updates.push({ name: "TTFB", value, rating: getRating("TTFB", value) });
      } else {
        updates.push({ name: "TTFB", value: null, rating: "loading" });
      }
    } catch {
      updates.push({ name: "TTFB", value: null, rating: "loading" });
    }
    checkDone();
  }, []);

  useEffect(() => {
    measureVitals();
  }, [measureVitals]);

  const getOverallRating = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 70) return { label: "Good", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
    return { label: "Needs Work", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-base font-bold text-white">Speed Insights</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ml-1">
                Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastMeasured && (
              <span className="text-[10px] text-slate-500 font-semibold">
                Last measured: {lastMeasured.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={measureVitals}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
              {isRefreshing ? "Measuring…" : "Remeasure"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">Core Web Vitals</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Real-time performance metrics measured directly from your browser session.
            These metrics directly impact your Google Search ranking.
          </p>
        </div>

        {/* Overall Score */}
        {overallScore !== null && (
          <div className={`rounded-2xl border p-6 ${getOverallRating(overallScore).bg} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Overall Performance Score</p>
              <p className={`text-4xl font-black ${getOverallRating(overallScore).color} font-display`}>
                {overallScore}
                <span className="text-lg text-slate-500 font-semibold">/100</span>
              </p>
              <p className={`text-sm font-bold mt-1 ${getOverallRating(overallScore).color}`}>
                {getOverallRating(overallScore).label}
              </p>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 justify-end">
                <Monitor className="w-4 h-4" />
                <span className="font-semibold">Desktop measurement</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 justify-end">
                <Globe className="w-4 h-4" />
                <span>obrized.com</span>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vitals.map((vital) => {
            const badge = getRatingBadge(vital.rating);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={vital.name}
                className={`rounded-2xl border p-5 space-y-4 transition-all ${getRatingColor(vital.rating)}`}
              >
                {/* Metric Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{vital.name}</p>
                    <p className="text-sm font-bold text-slate-300 mt-0.5">{vital.label}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${badge.color}`}>
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {badge.label}
                  </div>
                </div>

                {/* Value */}
                <div>
                  {vital.value !== null ? (
                    <>
                      <p className={`text-3xl font-black font-display ${getRatingColor(vital.rating).split(" ")[0]}`}>
                        {vital.unit === "score"
                          ? vital.value.toFixed(3)
                          : `${Math.round(vital.value)}`}
                        <span className="text-xs text-slate-500 font-semibold ml-1">
                          {vital.unit === "score" ? "" : "ms"}
                        </span>
                      </p>

                      {/* Progress bar */}
                      {vital.value !== null && (() => {
                        const { percentage, goodPct, poorPct } = getScoreBar(
                          vital.value,
                          vital.good,
                          vital.poor,
                          vital.unit
                        );
                        return (
                          <div className="mt-3 relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            {/* Good zone */}
                            <div
                              className="absolute top-0 left-0 h-full bg-emerald-500/30 rounded-full"
                              style={{ width: `${goodPct}%` }}
                            />
                            {/* Needs-improvement zone */}
                            <div
                              className="absolute top-0 h-full bg-amber-500/30 rounded-full"
                              style={{ left: `${goodPct}%`, width: `${poorPct - goodPct}%` }}
                            />
                            {/* Value indicator */}
                            <div
                              className={`absolute top-0 h-full rounded-full transition-all duration-700 ${
                                vital.rating === "good" ? "bg-emerald-500" :
                                vital.rating === "needs-improvement" ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        );
                      })()}

                      {/* Thresholds */}
                      <div className="flex justify-between text-[9px] text-slate-600 font-semibold mt-1">
                        <span>Good ≤ {vital.unit === "score" ? vital.good : `${vital.good}ms`}</span>
                        <span>Poor &gt; {vital.unit === "score" ? vital.poor : `${vital.poor}ms`}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <Activity className="w-4 h-4 text-slate-500 animate-pulse" />
                      <span className="text-sm text-slate-500 font-semibold">Waiting for interaction…</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-800/80 pt-3">
                  {vital.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* How to Improve Section */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white">How to Improve Your Score</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LCP / FCP</h3>
              <ul className="space-y-2">
                {[
                  "Use next/image for all images (auto-compression + WebP)",
                  "Add rel=preload for hero fonts and critical CSS",
                  "Enable Vercel Edge Network CDN for static assets",
                  "Use next/font instead of @import for Google Fonts",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
            </ul>
          </div>
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CLS / FID / TTFB</h3>
              <ul className="space-y-2">
                {[
                  "Set explicit width/height on all images to prevent layout shifts",
                  "Use skeleton loaders while data fetches are in progress",
                  "Minimize JavaScript bundle with dynamic imports",
                  "Use React Server Components for heavy data-fetching pages",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* SEO Checklist */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white">SEO Checklist — Obrized</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { done: true, item: "Title tag with primary keyword" },
              { done: true, item: "Meta description (155 chars)" },
              { done: true, item: "Open Graph + Twitter Cards" },
              { done: true, item: "JSON-LD Schema (SoftwareApplication)" },
              { done: true, item: "JSON-LD AggregateRating (4.9/5 stars)" },
              { done: true, item: "JSON-LD Offers with CAD pricing" },
              { done: true, item: "sitemap.xml with all public pages" },
              { done: true, item: "robots.txt with proper bot rules" },
              { done: true, item: "DNS-prefetch for Stripe origins" },
              { done: true, item: "Canonical URL tag" },
              { done: true, item: "theme-color meta tag" },
              { done: true, item: "Google Fonts preload hint" },
              { done: true, item: "Semantic H1 on landing page" },
              { done: true, item: "Alt text on all SVG icons" },
              { done: false, item: "Submit sitemap to Google Search Console" },
              { done: false, item: "Set up Google Analytics 4 property" },
              { done: false, item: "Add next/image for all hero images" },
              { done: false, item: "Add hreflang for EN/FR/PT/ES" },
            ].map((check, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                {check.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span className={check.done ? "text-slate-300" : "text-amber-400"}>{check.item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile note */}
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/30 text-xs font-semibold text-slate-400">
          <Smartphone className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Note:</strong> These metrics reflect your current browser session. 
            For production Lighthouse scores, visit{" "}
            <a
              href="https://pagespeed.web.dev/analysis?url=https://obrized.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline hover:text-amber-300"
            >
              PageSpeed Insights
            </a>{" "}
            and{" "}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline hover:text-amber-300"
            >
              Google Search Console
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
