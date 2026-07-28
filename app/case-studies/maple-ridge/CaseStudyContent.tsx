'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Clock,
  TrendingUp,
  Shield,
  DollarSign,
  Quote,
  ArrowRight,
  MapPin,
  Users,
  Calendar,
  FileSpreadsheet,
  AlertTriangle,
  ClipboardCheck,
  Timer,
  CheckCircle2,
  Zap,
  BarChart3,
  HardHat,
  ChevronRight,
} from 'lucide-react';

/* ─── Animated Counter Hook ─── */
function useCountUp(end: number, duration = 2000, suffix = '', prefix = '') {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, suffix, prefix]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) animate();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return { ref, display };
}

/* ─── Fade-in on scroll ─── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function FadeIn({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Metric Card ─── */
function MetricCard({
  value,
  suffix,
  prefix,
  label,
  icon: Icon,
  delay,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}) {
  const counter = useCountUp(value, 2200, suffix, prefix);
  const fade = useFadeIn();

  return (
    <div
      ref={(el) => {
        (counter.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (fade.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className={`group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-6 backdrop-blur-sm transition-all duration-700 ease-out hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 ${
        fade.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Glow effect */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl transition-all duration-500 group-hover:bg-amber-500/10" />

      <div className="relative">
        <div className="mb-3 inline-flex rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-2.5">
          <Icon className="h-5 w-5 text-amber-400" />
        </div>
        <div className="mb-1 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          {counter.display}
        </div>
        <p className="text-sm leading-relaxed text-slate-400">{label}</p>
      </div>
    </div>
  );
}

/* ─── Challenge Card ─── */
function ChallengeCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="group relative overflow-hidden rounded-2xl border border-red-500/10 bg-gradient-to-br from-red-950/20 to-slate-950/50 p-6 transition-all duration-300 hover:border-red-500/20">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-red-500/5 blur-2xl" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-xl bg-red-500/10 p-2.5">
            <Icon className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="mb-2 font-display text-lg font-semibold text-white">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">{description}</p>
        </div>
      </div>
    </FadeIn>
  );
}

/* ─── Solution Card ─── */
function SolutionCard({
  icon: Icon,
  title,
  description,
  features,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950/20 to-slate-950/50 p-6 transition-all duration-300 hover:border-emerald-500/20">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-2.5">
            <Icon className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="mb-2 font-display text-lg font-semibold text-white">
            {title}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-slate-400">
            {description}
          </p>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FadeIn>
  );
}

/* ─── Main Content ─── */
export default function CaseStudyContent() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl font-bold text-white transition-colors hover:text-amber-400"
          >
            <HardHat className="h-6 w-6 text-amber-400" />
            Obrized
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/case-studies/maple-ridge"
              className="text-sm text-amber-400 font-medium"
            >
              Case Studies
            </Link>
            <Link
              href="/#pricing"
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-110"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-28 pb-20">
        {/* Background glow effects */}
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute right-1/4 top-40 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <FadeIn>
            <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
              <Link href="/" className="transition-colors hover:text-slate-300">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-400">Case Studies</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-amber-400">Maple Ridge Construction</span>
            </div>
          </FadeIn>

          {/* Case Study badge */}
          <FadeIn delay={100}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              <BarChart3 className="h-4 w-4" />
              Customer Success Story
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="mb-6 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              How Maple Ridge Construction Saved{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                $180K+ Annually
              </span>{' '}
              with Obrized
            </h1>
          </FadeIn>

          <FadeIn delay={300}>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
              A mid-size General Contractor in Ontario transformed their
              operations—cutting estimating time by 80% and achieving zero WSIB
              compliance violations in 12 months.
            </p>
          </FadeIn>

          {/* Company Profile Card */}
          <FadeIn delay={400}>
            <div className="inline-flex flex-wrap items-center gap-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 px-8 py-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-2.5">
                  <Building2 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Company
                  </p>
                  <p className="font-display font-semibold text-white">
                    Maple Ridge Construction
                  </p>
                </div>
              </div>

              <div className="hidden h-10 w-px bg-slate-800 sm:block" />

              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400/70" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Location
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    Vaughan, Ontario
                  </p>
                </div>
              </div>

              <div className="hidden h-10 w-px bg-slate-800 sm:block" />

              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-amber-400/70" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Employees
                  </p>
                  <p className="text-sm font-medium text-slate-200">65</p>
                </div>
              </div>

              <div className="hidden h-10 w-px bg-slate-800 sm:block" />

              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-amber-400/70" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Projects/Year
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    12–18 Residential &amp; Commercial
                  </p>
                </div>
              </div>

              <div className="hidden h-10 w-px bg-slate-800 sm:block" />

              <div className="flex items-center gap-2.5">
                <DollarSign className="h-4 w-4 text-amber-400/70" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Annual Revenue
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    $8.2M CAD
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── The Challenge ── */}
      <section className="relative border-t border-slate-800/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-400">
              <AlertTriangle className="h-4 w-4" />
              The Challenge
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h2 className="mb-4 max-w-2xl font-display text-3xl font-bold text-white md:text-4xl">
              Manual Processes Were Costing Time, Money, and Compliance
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="mb-12 max-w-2xl text-lg text-slate-400">
              Before Obrized, Maple Ridge relied on outdated workflows that
              drained productivity and put the company at regulatory risk.
            </p>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2">
            <ChallengeCard
              icon={FileSpreadsheet}
              title="Manual Takeoffs in Excel"
              description="Quantity takeoffs were done entirely in Excel spreadsheets—each project taking 3–5 days of tedious manual measurement with error rates of 15–20%, leading to costly rework and budget overruns."
              delay={0}
            />
            <ChallengeCard
              icon={ClipboardCheck}
              title="Superficial CCDC Contract Reviews"
              description="CCDC contracts were reviewed only at surface level, leaving hidden risk clauses and unfavorable terms undetected. This resulted in costly disputes and change-order battles worth tens of thousands of dollars."
              delay={100}
            />
            <ChallengeCard
              icon={Shield}
              title="Handwritten Safety Logs"
              description="WSIB safety logs were kept on paper—often incomplete, illegible, or missing entirely. During audits, the team scrambled to reconstruct records, risking penalties and increased premiums."
              delay={200}
            />
            <ChallengeCard
              icon={Timer}
              title="Missed Prompt Payment Deadlines"
              description="Compliance with Ontario's Construction Act Prompt Payment provisions was entirely manual. The team frequently missed the strict 28-day payment timelines, straining subcontractor relationships and triggering adjudication proceedings."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ── The Solution ── */}
      <section className="relative border-t border-slate-800/40 py-24">
        {/* Subtle glow */}
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/3 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <FadeIn>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
              <Zap className="h-4 w-4" />
              The Solution
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h2 className="mb-4 max-w-2xl font-display text-3xl font-bold text-white md:text-4xl">
              Obrized Replaced Guesswork with AI-Powered Precision
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="mb-12 max-w-2xl text-lg text-slate-400">
              Maple Ridge implemented Obrized across all departments in Q1 2025,
              transforming four critical workflows from day one.
            </p>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2">
            <SolutionCard
              icon={TrendingUp}
              title="AI-Powered Quantity Takeoffs"
              description="Obrized's AI blueprint analysis replaced Excel-based estimating with automated, accurate quantity takeoffs."
              features={[
                'Upload blueprints (PDF/DWG) and receive itemized takeoffs in minutes',
                '95% accuracy in material quantities—validated against manual checks',
                'Auto-generated BOMs linked to RSMeans Canadian cost data',
                'Historical project data improves estimates over time',
              ]}
              delay={0}
            />
            <SolutionCard
              icon={ClipboardCheck}
              title="CCDC Contract Risk Audit"
              description="AI-driven clause-by-clause analysis of CCDC-2, CCDC-5A, and other standard forms."
              features={[
                'Automatic detection of unfavorable indemnity, liquidated damages, and payment terms',
                'Risk scoring (Low / Medium / High / Critical) for every clause',
                'Side-by-side comparison with CCDC standard language',
                'Recommended amendments drafted in plain English',
              ]}
              delay={100}
            />
            <SolutionCard
              icon={Shield}
              title="Digital WSIB Safety Logs"
              description="Replaced paper-based logs with a structured digital system designed for Ontario WSIB compliance."
              features={[
                'Voice-to-text daily field reports captured on mobile',
                'Auto-populated incident reports with photo attachments',
                'Pre-built WSIB Form 7 templates for workplace injuries',
                'Real-time compliance dashboard with audit-ready exports',
              ]}
              delay={200}
            />
            <SolutionCard
              icon={DollarSign}
              title="Prompt Payment Tracker"
              description="Automated timeline tracking for Ontario Construction Act compliance."
              features={[
                'Auto-calculated 28-day proper invoice and payment deadlines',
                'Email/SMS alerts 7, 3, and 1 days before each deadline',
                'Notice of Non-Payment template generator',
                'Complete audit trail for adjudication defense',
              ]}
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ── The Results ── */}
      <section className="relative border-t border-slate-800/40 py-24">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-amber-500/3 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <FadeIn>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              <BarChart3 className="h-4 w-4" />
              The Results
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h2 className="mb-4 max-w-2xl font-display text-3xl font-bold text-white md:text-4xl">
              Measurable Impact in the First 12 Months
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="mb-12 max-w-2xl text-lg text-slate-400">
              Within one year of implementing Obrized, Maple Ridge Construction
              achieved transformative results across every operational metric.
            </p>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              icon={Clock}
              value={80}
              suffix="%"
              label="Reduction in estimating time — from 3–5 days to under 8 hours per project"
              delay={0}
            />
            <MetricCard
              icon={TrendingUp}
              value={95}
              suffix="%"
              label="Accuracy in quantity takeoffs — virtually eliminating costly rework"
              delay={100}
            />
            <MetricCard
              icon={DollarSign}
              value={40}
              suffix="%"
              label="Faster payment collection through automated Prompt Payment tracking"
              delay={200}
            />
            <MetricCard
              icon={Shield}
              value={0}
              suffix=""
              prefix=""
              label="WSIB compliance violations in 12 months — down from 4 incidents"
              delay={300}
            />
            <MetricCard
              icon={DollarSign}
              value={180}
              suffix="K+"
              prefix="$"
              label="Annual savings in operational costs from eliminated rework and penalties"
              delay={400}
            />
            <MetricCard
              icon={Building2}
              value={18}
              suffix=""
              label="Projects delivered on time and on budget in the first year"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ── Testimonial Quote ── */}
      <section className="relative border-t border-slate-800/40 py-24">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/3 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-6">
          <FadeIn>
            <div className="relative rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-10 backdrop-blur-sm md:p-14">
              {/* Quote icon */}
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4">
                <Quote className="h-8 w-8 text-amber-400" />
              </div>

              <blockquote className="mb-8 font-display text-xl leading-relaxed text-white md:text-2xl md:leading-relaxed">
                &ldquo;Obrized transformed how we manage our construction
                projects. What used to take our estimating team days now takes
                hours, and we haven&rsquo;t missed a single Prompt Payment
                deadline since implementation.&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                {/* Avatar placeholder */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 font-display text-xl font-bold text-slate-950">
                  MC
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-white">
                    Michael Chen
                  </p>
                  <p className="text-sm text-slate-400">
                    VP of Operations, Maple Ridge Construction
                  </p>
                </div>
              </div>

              {/* Decorative corner accents */}
              <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-3xl border-l-2 border-t-2 border-amber-500/20" />
              <div className="absolute bottom-0 right-0 h-20 w-20 rounded-br-3xl border-b-2 border-r-2 border-amber-500/20" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative border-t border-slate-800/40 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-amber-950/5 to-slate-950" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <FadeIn>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              <Zap className="h-4 w-4" />
              Ready to Transform Your Operations?
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Join 200+ Canadian Builders Using{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Obrized
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="mx-auto mb-10 max-w-xl text-lg text-slate-400">
              Start your free 14-day trial today. No credit card required. See
              why companies like Maple Ridge Construction trust Obrized to
              streamline their operations.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/#pricing"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 font-display text-base font-semibold text-slate-950 transition-all hover:shadow-xl hover:shadow-amber-500/25 hover:brightness-110"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-8 py-3.5 text-base font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white"
              >
                Back to Home
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/40 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <HardHat className="h-5 w-5 text-amber-400" />
              Obrized
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Obrized. Engineered for Canadian Builders.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
