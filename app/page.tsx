"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HardHat,
  FileText,
  ShieldCheck,
  Calendar,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  Users,
  Globe,
  ChevronRight,
  ChevronDown,
  Star,
  Play,
  Sparkles,
  HelpCircle,
  X,
  Award,
  AlertTriangle,
  Mail,
  Phone,
  Headphones,
} from "lucide-react";
import { useTranslations, Language } from "@/lib/translations";

export default function LandingPage() {
  const [lang, setLang] = useState<Language>("EN");
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [activePersona, setActivePersona] = useState<"gc" | "trade" | "owner">("gc");
  const [activeMockup, setActiveMockup] = useState<"takeoff" | "contract" | "schedule" | "safety">("takeoff");
  
  // ROI Calculator states
  const [estimatesVolume, setEstimatesVolume] = useState<number>(10);
  const [safetyHours, setSafetyHours] = useState<number>(8);
  
  // Interactive Fit Quiz state
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizStep, setQuizStep] = useState<number>(1);
  const [contractorType, setContractorType] = useState<string>("");
  const [projectVolume, setProjectVolume] = useState<string>("");
  
  // Recalculating Schedule Demo State
  const [demoDelayDays, setDemoDelayDays] = useState<number>(14);
  
  // Billing interval state
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annually">("monthly");

  // Lead Magnet state
  const [leadEmail, setLeadEmail] = useState<string>("");
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const selectLanguage = (selectedLang: Language) => {
    localStorage.setItem("buildr_lang", selectedLang);
    setLang(selectedLang);
    setShowLangMenu(false);
    window.location.reload();
  };

  const { t } = useTranslations(lang);

  // Dynamic calculations for ROI Calculator
  const monthlyHoursSaved = (estimatesVolume * 6) + (safetyHours * 4);
  const annualSavings = monthlyHoursSaved * 65 * 12;

  // Formatter for CAD Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === "EN" ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Quiz submission evaluation
  const getQuizRecommendation = () => {
    const isAnnually = billingInterval === "annually";
    if (contractorType === "Enterprise" || projectVolume === "10+") {
      return {
        tier: lang === "PT" ? "Plano Pro" : lang === "ES" ? "Plan Pro" : lang === "FR" ? "Forfait Pro" : "Pro Plan",
        price: isAnnually ? "$159 CAD / mo" : "$189 CAD / mo",
        desc: lang === "EN" 
          ? "For small to medium GCs and specialty contractors requiring unlimited projects, unlimited AI takeoffs, voice logs, and NBC compliance checks."
          : lang === "FR"
          ? "Pour les entrepreneurs généraux et spécialisés nécessitant des projets illimités, des analyses d'IA illimitées et la conformité NBC."
          : lang === "PT"
          ? "Para GCs de pequeno e médio porte e subempreiteiros que exigem projetos ilimitados, análises de plantas ilimitadas por IA, RDO por voz e conformidade NBC."
          : "Para contratistas generales y especializados que requieren proyectos ilimitados, análisis de planos ilimitados por IA, RDO por voz y cumplimiento NBC."
      };
    }
    if (contractorType === "General" || projectVolume === "4-10") {
      return {
        tier: lang === "PT" ? "Plano Starter" : lang === "ES" ? "Plan Starter" : lang === "FR" ? "Forfait Starter" : "Starter Plan",
        price: isAnnually ? "$69 CAD / mo" : "$79 CAD / mo",
        desc: lang === "EN"
          ? "Ideal for smaller trades and contractors. Includes 10 active projects, 30 AI blueprint analyses/mo, Gantt scheduling, and WSIB compliance templates."
          : lang === "FR"
          ? "Idéal pour les petits entrepreneurs. Comprend 10 projets actifs, 30 analyses d'IA/mois, planification Gantt et modèles de conformité WSIB."
          : lang === "PT"
          ? "Ideal para pequenos empreiteiros e trades. Inclui 10 projetos ativos, 30 análises de planta por IA/mês, cronograma Gantt e templates WSIB."
          : "Ideal para pequeños contratistas y trades. Incluye 10 proyectos activos, 30 análisis de planos por IA/mes, cronograma Gantt y plantillas WSIB."
      };
    }
    return {
      tier: lang === "PT" ? "Plano Gratuito" : lang === "ES" ? "Plan Gratuito" : lang === "FR" ? "Forfait Gratuit" : "Free Plan",
      price: "$0 CAD / mo",
      desc: lang === "EN"
        ? "Perfect to test our features. Try up to 3 AI blueprint analyses, 2 active projects, static CCDC templates, and basic WSIB safety logs."
        : lang === "FR"
        ? "Parfait pour tester nos fonctionnalités. Essayez jusqu'à 3 analyses d'IA, 2 projets actifs et des modèles de sécurité WSIB de base."
        : lang === "PT"
        ? "Perfeito para testar nossos recursos. Experimente até 3 análises de planta por IA, 2 projetos ativos, templates estáticos CCDC e logs WSIB."
        : "Perfecto para probar nuestras funciones. Experimente hasta 3 análisis de planos por IA, 2 proyectos activos, plantillas estáticas CCDC y registros WSIB."
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <HardHat className="w-5.5 h-5.5 text-slate-950 font-black" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight font-display">Obrized</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded ml-2 uppercase font-extrabold tracking-widest">.com</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              {lang === "EN" ? "Features" : lang === "FR" ? "Fonctionnalités" : lang === "PT" ? "Funcionalidades" : "Funcionalidades"}
            </a>
            <a href="#personas" className="hover:text-white transition-colors">
              {lang === "EN" ? "Solutions" : lang === "FR" ? "Solutions" : lang === "PT" ? "Soluções" : "Soluciones"}
            </a>
            <a href="#roi" className="hover:text-white transition-colors flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              ROI Calculator
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              {lang === "EN" ? "Pricing" : lang === "FR" ? "Tarifs" : lang === "PT" ? "Preços" : "Precios"}
            </a>
          </nav>
          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-all duration-200"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang}</span>
              </button>

              {/* Language Dropdown Menu */}
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-fade-in">
                  {[
                    { code: "EN" as Language, label: "English" },
                    { code: "FR" as Language, label: "Français" },
                    { code: "PT" as Language, label: "Português" },
                    { code: "ES" as Language, label: "Español" },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => selectLanguage(l.code)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        lang === l.code
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-200 hover:text-white hover:bg-slate-850"
                      }`}
                    >
                      <span>{l.label}</span>
                      {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-extrabold hover:shadow-lg hover:shadow-amber-500/15 transition-all duration-300 flex items-center gap-2"
            >
              {t("access_platform")} <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center relative">
        {/* Rating Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-900/80 text-amber-400 text-xs font-bold px-4 py-2 rounded-full mb-8 border border-slate-800/80 backdrop-blur-sm shadow-xl">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span>4.9/5 early rating from Canadian builders (Beta)</span>
        </div>

        {/* Headlines */}
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-tight font-display tracking-tight max-w-4xl mx-auto">
          {t("hero_title_1")}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300">
            {t("hero_title_2")}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
          The only AI-powered construction co-pilot engineered specifically for Canadian local laws — automating estimates, CCDC contracts, WSIB safety audits, and Prompt Payment compliance.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <div className="flex flex-col items-center">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 px-8 py-4 rounded-xl text-lg font-black hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2.5 min-w-[240px]"
            >
              Start Free Trial <Sparkles className="w-5 h-5 text-slate-950" />
            </Link>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-2.5">No Credit Card Required · 14-Day Trial</span>
          </div>
          <div className="flex flex-col items-center">
            <a
              href="#features"
              className="border border-slate-800 text-slate-300 px-8 py-4 rounded-xl text-lg font-bold hover:text-white hover:bg-slate-900 transition-all duration-200 flex items-center justify-center gap-2 min-w-[240px]"
            >
              <Play className="w-4 h-4 text-amber-500 fill-current" /> Watch Product Tour
            </a>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-2.5">Quick 90s Demo Video</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">{t("trust_badge_ssl")}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">{t("trust_badge_stripe")}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">{t("trust_badge_gcp")}</span>
          </div>
        </div>

        {/* Scrolling Trust Ticker */}
        <div className="border-t border-b border-slate-900/60 py-6 max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Conforming to Canadian Codes & Regulation Authorities</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40">
            <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-slate-300 font-display">
              <Award className="w-5 h-5 text-amber-500" /> WSIB COMPLIANT
            </div>
            <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-slate-300 font-display">
              <Award className="w-5 h-5 text-amber-500" /> WORKSAFEBC COR
            </div>
            <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-slate-300 font-display">
              <Award className="w-5 h-5 text-amber-500" /> CDAP REGISTERED
            </div>
            <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-slate-300 font-display">
              <Award className="w-5 h-5 text-amber-500" /> NBC 2025 COMPLIANT
            </div>
          </div>
        </div>
      </section>

      {/* Target Personas Section */}
      <section id="personas" className="py-20 bg-slate-950 border-t border-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">Designed for Your Role</h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl mx-auto mt-2">Every feature is mapped to solve your specific construction business bottlenecks.</p>
          </div>

          {/* Persona Tabs Buttons */}
          <div className="flex justify-center mb-10 p-1 bg-slate-900 rounded-2xl max-w-2xl mx-auto border border-slate-800">
            <button
              onClick={() => setActivePersona("gc")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                activePersona === "gc"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <HardHat className="w-4 h-4" /> General Contractor
            </button>
            <button
              onClick={() => setActivePersona("trade")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                activePersona === "trade"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> Specialty Trade
            </button>
            <button
              onClick={() => setActivePersona("owner")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                activePersona === "owner"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> Project Owner
            </button>
          </div>

          {/* Persona Value Card Grid */}
          <div className="bg-slate-900/40 rounded-3xl p-8 md:p-12 border border-slate-800/80 max-w-4xl mx-auto shadow-2xl">
            {activePersona === "gc" && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">General Contractor Flow</div>
                  <h3 className="text-2xl font-bold text-white leading-tight font-display">Accelerate Estimating & Protect Margins</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    General contractors in Canada shoulder the risk of CCDC contracts, massive estimation schedules, and subcontractor payment timelines under the Construction Act.
                  </p>
                  <ul className="space-y-3">
                    {["AI quantity takeoff extracts blueprints automatically in minutes", "Risk audits check for high-liability clauses in CCDC-2 & CCDC-5A contracts", " statutory 28-day countdown monitors Proper Invoices to secure cash flow"].map((b, i) => (
                      <li key={i} className="flex gap-2.5 items-start text-xs font-bold text-slate-300">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active CCDC Checklist</p>
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded uppercase">CCDC-2 2020</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-rose-400">Notice Period Clause 12.1</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">Owner delay notice set to 48 hours. Suggest extending to 5 business days to avoid forfeiture.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-400">Proper Invoice Setup</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">Ontario Construction Act 28-day clock mapped. Payment date: Jan 28, 2025.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePersona === "trade" && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Specialty Trade Flow</div>
                  <h3 className="text-2xl font-bold text-white leading-tight font-display">Automate Daily Safety & Prompt Payment Claims</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    Specialty trades face massive manual paperwork loads: filling out OHS daily logs, chemical hazard checks, and struggling to get invoices paid by General Contractors.
                  </p>
                  <ul className="space-y-3">
                    {["Voice-dictated daily reports populate COR compliance sheets instantly", "Auto-generate statutory WSIB/WorkSafeBC clearances & WHMIS lists", "Proper Invoice formatting ensures legally-enforced payment timelines"].map((b, i) => (
                      <li key={i} className="flex gap-2.5 items-start text-xs font-bold text-slate-300">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OHS COR daily check</p>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded uppercase">Compliant</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-300 font-bold">Daily Safety Log</span>
                      <span className="text-emerald-500 font-extrabold">✓ Voice structured</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-300 font-bold">WSIB Clearance Letter</span>
                      <span className="text-emerald-500 font-extrabold">✓ Attached</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-300 font-bold">WHMIS Hazardous List</span>
                      <span className="text-emerald-500 font-extrabold">✓ Current</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePersona === "owner" && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Project Owner Flow</div>
                  <h3 className="text-2xl font-bold text-white leading-tight font-display">Achieve Complete Schedule & Auditing Transparency</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    Owners and developers require high-level visibility to avoid delay disputes, CCDC claim traps, and ensure regulatory compliance on every invoice.
                  </p>
                  <ul className="space-y-3">
                    {["Predictive Gantt charts visualize delay recalculations on the critical path", "Lien waivers and WSIB letters stored automatically against payments", "Complete transparency on project takeoff calculations and costs"].map((b, i) => (
                      <li key={i} className="flex gap-2.5 items-start text-xs font-bold text-slate-300">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Financial Audit Lock</p>
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded uppercase">Audited</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-2.5 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-300 font-bold">Lien Waivers</span>
                      <span className="text-emerald-500 font-extrabold">✓ Fully Executed</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-300 font-bold">Progress Claims</span>
                      <span className="text-emerald-500 font-extrabold">✓ Verified vs Takeoff</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Live Interactive CSS Mockup Showcase */}
      <section id="features" className="py-24 bg-slate-900/20 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">Interactive Product Experience</h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl mx-auto mt-2">Test the Obrized AI modules instantly. Click below to switch features.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Features Menu */}
            <div className="lg:col-span-4 space-y-3">
              {[
                { id: "takeoff", icon: <FileText className="w-5 h-5 text-blue-400" />, label: t("estimating"), desc: "Blueprints takeoff extraction" },
                { id: "contract", icon: <ShieldCheck className="w-5 h-5 text-purple-400" />, label: t("contracts"), desc: "AI CCDC compliance risk audit" },
                { id: "safety", icon: <HardHat className="w-5 h-5 text-orange-400" />, label: t("safety"), desc: "Voice OHS daily log formatter" },
                { id: "schedule", icon: <Calendar className="w-5 h-5 text-green-400" />, label: t("scheduling"), desc: "Gantt critical path recalculator" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMockup(m.id as any)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    activeMockup === m.id
                      ? "bg-slate-900 border-slate-700 shadow-lg"
                      : "border-transparent text-slate-450 hover:bg-slate-900/40 hover:border-slate-850"
                  }`}
                >
                  <div className={`p-2 rounded-xl bg-slate-950 border border-slate-850 flex-shrink-0`}>
                    {m.icon}
                  </div>
                  <div>
                    <p className={`font-extrabold text-sm ${activeMockup === m.id ? "text-white" : "text-slate-350"}`}>{m.label}</p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Live Interactive CSS Preview Container */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 min-h-[460px] flex flex-col justify-between shadow-2xl relative">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" /> Live Simulator
              </div>

              {/* ESTIMATING / TAKEOFF MOCKUP */}
              {activeMockup === "takeoff" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Takeoff Engine</p>
                    <h4 className="text-xl font-bold text-white font-display">Interactive Takeoff Analysis</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 flex-1 items-center">
                    {/* Simulated Blueprint Canvas */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                      <div className="border border-dashed border-slate-800 rounded-xl p-3 flex-1 flex flex-col justify-between relative bg-slate-950/80">
                        {/* Grid lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                        <div className="relative z-10 flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                          <span>blueprint.pdf</span>
                          <span>Scale: 1:100</span>
                        </div>
                        {/* Drawn Mock Polygons */}
                        <div className="relative z-10 w-full h-24 flex items-center justify-center">
                          <div className="absolute w-24 h-16 bg-blue-500/10 border-2 border-blue-500 rounded flex items-center justify-center text-[10px] text-blue-400 font-extrabold">
                            Slab Area A
                          </div>
                          <div className="absolute w-12 h-16 top-4 left-1/4 bg-amber-500/10 border border-amber-500 rounded-lg flex items-center justify-center text-[8px] text-amber-400 font-extrabold">
                            MEP
                          </div>
                        </div>
                        <div className="relative z-10 text-[9px] font-extrabold text-blue-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Takeoff Successful
                        </div>
                      </div>
                    </div>

                    {/* Extracted Item Table list */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Extracted quantities</p>
                      <div className="space-y-1.5 text-xs">
                        {[
                          { item: "Slab Concrete Pour (Area A)", qty: "250 m²", total: "$16,250" },
                          { item: "Metal Stud Framing (Type X)", qty: "840 lin m", total: "$10,920" },
                          { item: "Fire-Rated Access Doors", qty: "14 units", total: "$4,800" },
                        ].map((q, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-850 rounded-xl">
                            <span className="text-slate-300 font-semibold truncate max-w-[140px]">{q.item}</span>
                            <div className="flex gap-4">
                              <span className="text-slate-400 font-bold">{q.qty}</span>
                              <span className="text-amber-500 font-black">{q.total}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-450 leading-relaxed border-t border-slate-850/80 pt-3 flex justify-between items-center">
                    <span>AI takeoff saves an average of **12-16 hours** per estimation spreadsheet.</span>
                    <Link href="/dashboard" className="text-amber-400 font-bold hover:underline flex items-center gap-1">Test Demo <ChevronRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              )}

              {/* CONTRACT MOCKUP */}
              {activeMockup === "contract" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Contract Reviewer</p>
                    <h4 className="text-xl font-bold text-white font-display">Simulated CCDC Risk Review</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 flex-1 items-center">
                    {/* Simulated Contract text */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                      <div className="border border-slate-850 rounded-xl p-3 flex-1 flex flex-col justify-between bg-slate-950/80 text-[10px] leading-relaxed">
                        <div className="flex justify-between border-b border-slate-850 pb-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <span>CCDC-2 CONTRACT (Original)</span>
                        </div>
                        <p className="text-slate-400 mt-2 font-medium">
                          "12.1.3 The Contractor forfeits any claim for additional costs due to owner delays unless written notice is delivered within forty-eight (48) hours of occurrence."
                        </p>
                        <div className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 font-bold flex items-center gap-1.5 mt-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          <span>Strict 48-Hour Forfeiture Trap Detected</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation bubble */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Obrized AI Suggested Wording</p>
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2 text-xs leading-relaxed">
                        <p className="font-extrabold text-emerald-400">Recommended Amendment</p>
                        <p className="text-slate-350 font-medium italic">
                          "...unless written notice is delivered within five (5) business days after the Contractor becomes aware of the delay."
                        </p>
                        <p className="text-[10px] text-slate-450 mt-1 leading-normal font-semibold">
                          Why: Protects GC from immediate forfeiture over minor structural delays or late submittals.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-450 leading-relaxed border-t border-slate-850/80 pt-3 flex justify-between items-center">
                    <span>Ensures Canadian local prompt payment compliance.</span>
                    <Link href="/dashboard" className="text-amber-400 font-bold hover:underline flex items-center gap-1">Analyze Contract <ChevronRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              )}

              {/* VOICE SAFETY MOCKUP */}
              {activeMockup === "safety" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OHS Daily Safety Logger</p>
                    <h4 className="text-xl font-bold text-white font-display">Voice Safety Formatter</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 flex-1 items-center">
                    {/* Simulated Voice wave */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                      <div className="border border-slate-850 rounded-xl p-3 flex-1 flex flex-col justify-between bg-slate-950/80">
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> Dictating Log...
                        </p>
                        <p className="text-xs text-slate-300 font-medium italic leading-relaxed mt-2">
                          "Had 10 guys on site today, temp was around 12 degrees. Weather was good. Mitigated slip hazards near concrete slab A by putting safety cones. Zero incidents."
                        </p>
                        {/* Voice waves representation */}
                        <div className="flex justify-center items-end gap-1.5 h-10 mt-3">
                          {[20, 45, 15, 60, 30, 80, 25, 40, 65, 10].map((h, i) => (
                            <div key={i} className="flex-1 bg-amber-500 rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI structured daily log */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Structured Report Output</p>
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3 text-[11px] leading-relaxed">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Workers: <strong className="text-white">10 Site Workers</strong></span>
                          <span>Temp: <strong className="text-white">12 °C</strong></span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-300 uppercase tracking-wider text-[9px]">Hazards Control Audit</p>
                          <p className="text-slate-400 font-medium">✓ Slip/trip hazard at concrete slab A controlled with structural warnings & barriers.</p>
                        </div>
                        <div className="flex justify-between border-t border-slate-900 pt-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          <span>WorkSafeBC / WSIB CONFORMANT</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-450 leading-relaxed border-t border-slate-850/80 pt-3 flex justify-between items-center">
                    <span>Reduces manual safety logging paperwork to **2 minutes** daily.</span>
                    <Link href="/dashboard" className="text-amber-400 font-bold hover:underline flex items-center gap-1">Test Safety Voice <ChevronRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              )}

              {/* SCHEDULING / GANTT RECALCULATOR MOCKUP */}
              {activeMockup === "schedule" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Schedule Recalculator</p>
                    <h4 className="text-xl font-bold text-white font-display">Predictive Critical Path Recalculation</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 flex-1 items-center">
                    {/* Simulated Gantt chart */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                      <div className="border border-slate-850 rounded-xl p-3 flex-1 flex flex-col justify-between bg-slate-950/80 text-xs">
                        <div className="flex justify-between border-b border-slate-850 pb-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <span>Gantt Chart Recalculator</span>
                          <span className="text-rose-400 font-bold">{demoDelayDays} Days Delay</span>
                        </div>
                        <div className="space-y-3 mt-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">1. Excavation</span>
                            <div className="h-4 bg-emerald-500 rounded-md w-[40%] opacity-80" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">2. Concrete Pour (Delay)</span>
                            <div className="h-4 bg-amber-500 rounded-md transition-all duration-300 opacity-80" style={{ width: `${35 + (demoDelayDays / 3)}%` }} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">3. Structural (Critical Path)</span>
                            <div className="h-4 bg-rose-500 rounded-md transition-all duration-300 ring-2 ring-rose-500/20 opacity-80" style={{ marginLeft: `${35 + (demoDelayDays / 3)}%`, width: "30%" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delay slider widget */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Interactive Delay Range: <span className="text-amber-500 font-black">{demoDelayDays} Days</span>
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={30}
                          value={demoDelayDays}
                          onChange={(e) => setDemoDelayDays(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] leading-relaxed text-amber-300 font-semibold flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>AI recalculated: Gantt critical path shifted by {demoDelayDays} days. Subsequent tasks optimized.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-450 leading-relaxed border-t border-slate-850/80 pt-3 flex justify-between items-center">
                    <span>Recalculates tasks instantly on project delays.</span>
                    <Link href="/dashboard" className="text-amber-400 font-bold hover:underline flex items-center gap-1">Test Scheduler <ChevronRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Before-and-After Side-by-Side Contrast Section */}
      <section className="py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">Old Manual Method vs. Obrized AI</h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl mx-auto mt-2">See how switching to Obrized resolves bottleneck inefficiencies.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="bg-slate-900/35 border border-rose-500/15 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-500/15 text-rose-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-2xl border-l border-b border-rose-500/20">The Old Spreadsheet Way</div>
              <h3 className="text-xl font-bold text-slate-350 font-display">Slow, Fragmented & High-Risk</h3>
              <ul className="space-y-4 text-xs font-semibold text-slate-400">
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">✕</div>
                  <span>Estimates done manually on Excel takes days and contains costly mathematical errors.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">✕</div>
                  <span>CCDC contracts signed without proper legal review, exposing GCs to high liability clauses.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">✕</div>
                  <span>10 to 15 hours per week filling out safety reports and logs by hand on paper.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">✕</div>
                  <span>Cash flow stuck due to minor billing inaccuracies and delayed statutory prompt payment.</span>
                </li>
              </ul>
            </div>

            {/* The Obrized Way */}
            <div className="bg-slate-900/80 border border-emerald-500/20 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-2xl border-l border-b border-emerald-500/25">The Obrized AI Way</div>
              <h3 className="text-xl font-bold text-white font-display">Instant, Automatic & Secure</h3>
              <ul className="space-y-4 text-xs font-bold text-slate-200">
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                  <span>Quantity Takeoff estimates extracted in under 5 minutes from drawing PDF uploads.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                  <span>CCDC-2 contract clauses audited for liability notice traps within seconds.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                  <span>Safety reports filled by voice in 2 minutes, maintaining complete OHS COR compliance.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                  <span>Automated 28-day statutory invoice tracking ensures timely cash flow release.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator widget */}
      <section id="roi" className="py-24 bg-slate-900/40 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">Interactive ROI Calculator</h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl mx-auto mt-2">Estimate how many hours and how much money your construction business will save with Obrized.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto shadow-2xl grid md:grid-cols-12 gap-8 items-center">
            {/* Sliders Area */}
            <div className="md:col-span-7 space-y-6">
              {/* Slider 1 */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Estimates Volume</span>
                  <span className="text-amber-500 font-extrabold">{estimatesVolume} Estimates / Month</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={estimatesVolume}
                  onChange={(e) => setEstimatesVolume(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Slider 2 */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Weekly Safety Paperwork Hours</span>
                  <span className="text-amber-500 font-extrabold">{safetyHours} Hours / Week</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={safetyHours}
                  onChange={(e) => setSafetyHours(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Calculations Result */}
            <div className="md:col-span-5 bg-slate-950 rounded-2xl p-6 border border-slate-800 text-center space-y-6 shadow-inner">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated savings</p>
                <p className="text-4xl font-black text-emerald-400 mt-2 font-display">{formatCurrency(annualSavings)}</p>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Estimated Annual Business Savings</p>
              </div>
              <div className="border-t border-slate-900 pt-4 flex justify-around text-center">
                <div>
                  <p className="text-xl font-bold text-white">{monthlyHoursSaved}h</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hours saved / Mo</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">80%</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Time reduction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with custom Quiz trigger */}
      <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              {lang === "EN" ? "Simple, Transparent Pricing" : lang === "FR" ? "Tarification Simple & Transparente" : lang === "PT" ? "Preços Simples e Transparentes" : "Precios Simples y Transparentes"}
            </h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl mx-auto mt-2">
              {lang === "EN" ? "Choose the plan that matches your project scale, or take our custom fit quiz." : lang === "FR" ? "Choisissez le forfait adapté à vos projets, ou faites notre test." : lang === "PT" ? "Escolha o plano que melhor se adapta à escala dos seus projetos ou faça o nosso quiz de adequação." : "Elija el plan que mejor se adapte a sus proyectos o realice nuestro cuestionario."}
            </p>
          </div>

          {/* CDAP Grant Voucher Badge */}
          <div className="inline-flex items-center gap-2.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full mb-10 border border-emerald-500/20 shadow-lg">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === "EN" ? "Eligible for CDAP funding — get up to $15,000 to cover your subscription" : lang === "FR" ? "Admissible au PCAN — obtenez jusqu'à 15 000 $ pour votre abonnement" : lang === "PT" ? "Qualificado para subsídio CDAP — receba até $15.000 CAD para cobrir sua assinatura" : "Elegible para financiamiento CDAP — obtenga hasta $15,000 para su suscripción"}
            </span>
          </div>

          {/* Billing Interval Toggle Switch */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <span className={`text-xs font-black uppercase tracking-wider transition-colors duration-200 ${billingInterval === "monthly" ? "text-white" : "text-slate-500"}`}>
              {lang === "EN" ? "Billed Monthly" : lang === "FR" ? "Mensuel" : lang === "PT" ? "Mensal" : "Mensual"}
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === "monthly" ? "annually" : "monthly")}
              className="relative w-14 h-7 bg-slate-900 rounded-full border border-slate-800 p-0.5 flex items-center transition-all duration-300"
            >
              <div className={`w-5.5 h-5.5 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-full shadow-md transform transition-transform duration-300 ${billingInterval === "annually" ? "translate-x-7" : "translate-x-0"}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-wider transition-colors duration-200 ${billingInterval === "annually" ? "text-amber-400" : "text-slate-500"}`}>
                {lang === "EN" ? "Billed Annually" : lang === "FR" ? "Annuel" : lang === "PT" ? "Anual" : "Anual"}
              </span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                {lang === "EN" ? "Save ~15%" : lang === "FR" ? "Économisez ~15%" : lang === "PT" ? "Economize ~15%" : "Ahorre ~15%"}
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16 text-left">
            {/* Free Plan */}
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {lang === "EN" ? "Free" : lang === "FR" ? "Gratuit" : lang === "PT" ? "Gratuito" : "Gratuito"}
                  </p>
                  <p className="text-4xl font-extrabold text-white mt-2 font-display">$0<span className="text-xs text-slate-400">/mo</span></p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    {lang === "EN" ? "Permanent tier with volume gates." : lang === "FR" ? "Forfait permanent avec limites de volume." : lang === "PT" ? "Plano permanente com limites (gates)." : "Plan permanente con límites de volumen."}
                  </p>
                </div>
                <div className="border-t border-slate-850/80 pt-4 space-y-3 text-xs text-slate-300 font-bold">
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "2 projetos simultâneos" : lang === "FR" ? "2 projets simultanés" : lang === "ES" ? "2 proyectos simultáneos" : "2 simultaneous active projects"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Estimativas manuais ilimitadas (sem IA)" : lang === "FR" ? "Estimations manuelles illimitées (sans IA)" : lang === "ES" ? "Estimaciones manuales ilimitadas (sin IA)" : "Unlimited manual estimates (no AI)"}</div>
                  <div className="flex gap-2 items-center text-amber-400">✓ {lang === "PT" ? "3 análises de plantas/mês por IA" : lang === "FR" ? "3 analyses de plans/mois par IA" : lang === "ES" ? "3 análisis de planos/mes por IA" : "3 AI blueprint analyses / month"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Lista de materiais incluída nos 3 créditos" : lang === "FR" ? "Liste de matériaux incluse dans les crédits" : lang === "ES" ? "Lista de materiales incluida en créditos" : "Materials list included in AI credits"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "RDO digital limitado (5/mês)" : lang === "FR" ? "Rapport quotidien limité (5/mois)" : lang === "ES" ? "Reportes de obra limitados (5/mes)" : "Digital Daily Reports limited (5 / month)"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Templates de segurança WSIB básicos" : lang === "FR" ? "Modèles de sécurité WSIB de base" : lang === "ES" ? "Plantillas WSIB básicas" : "Basic Safety & WSIB templates"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Visualização de cronograma (Gantt)" : lang === "FR" ? "Planification Gantt (lecture seule)" : lang === "ES" ? "Programación Gantt (solo lectura)" : "View-only Gantt scheduling"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Templates estáticos CCDC" : lang === "FR" ? "Modèles CCDC statiques" : lang === "ES" ? "Plantillas estáticas CCDC" : "Static CCDC contract templates"}</div>
                  <div className="flex gap-2 items-center text-slate-500">✗ {lang === "PT" ? "Sem portal do cliente" : lang === "FR" ? "Pas de portail client" : lang === "ES" ? "Sin portal del cliente" : "No client portal included"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Suporte via comunidade e docs" : lang === "FR" ? "Support communauté + documents" : lang === "ES" ? "Soporte de comunidad + docs" : "Community & documentation support"}</div>
                </div>
              </div>

              {/* Gate Prompt Alert Box */}
              <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[10px] leading-relaxed text-amber-300 font-semibold flex items-start gap-1.5 shadow-inner">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold uppercase text-[8px] tracking-wider text-amber-400">
                    {lang === "PT" ? "Aviso de Limite de Créditos" : lang === "FR" ? "Alerte de Limite de Crédit" : lang === "ES" ? "Alerta de Límite de Crédito" : "Credit Limit Alert"}
                  </p>
                  <p className="mt-0.5">
                    {lang === "PT" 
                      ? 'Lógica de Gate: "Você atingiu seus 3 créditos de análise de IA este mês. Faça upgrade para análises ilimitadas."' 
                      : lang === "FR" 
                      ? '"Vous avez atteint vos 3 crédits d\'analyse IA ce mois-ci. Passez à la version supérieure pour des analyses illimitées."' 
                      : lang === "ES"
                      ? '"Ha alcanzado sus 3 créditos de análisis de IA este mes. Actualice para análisis ilimitados."'
                      : '"You have reached your 3 AI analysis credits this month. Upgrade to unlimited analyses."'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setContractorType("Trade");
                  setProjectVolume("1-3");
                  setShowQuiz(true);
                  setQuizStep(3);
                }}
                className="w-full bg-slate-950 text-slate-350 hover:text-white border border-slate-800 hover:bg-slate-900 py-3.5 rounded-xl text-xs font-black transition-all duration-200 mt-2"
              >
                {lang === "EN" ? "Choose Free" : lang === "FR" ? "Choisir Gratuit" : lang === "PT" ? "Escolher Grátis" : "Elegir Gratis"}
              </button>
            </div>

            {/* Starter Plan */}
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              {/* Pro Trial Notification Highlight */}
              <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-2xl border-l border-b border-amber-500/20">
                {lang === "EN" ? "14-Day Pro Trial Included" : lang === "FR" ? "Essai Pro 14 jours inclus" : lang === "PT" ? "14 Dias de Teste Pro Incluídos" : "Prueba Pro de 14 días incluida"}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Starter</p>
                  <p className="text-4xl font-extrabold text-white mt-2 font-display">
                    {billingInterval === "annually" ? "$69" : "$79"}
                    <span className="text-xs text-slate-400"> CAD/mo</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    {billingInterval === "annually" ? (lang === "EN" ? "$828 billed annually ($69/mo)" : lang === "FR" ? "828 $ facturé annuellement" : lang === "PT" ? "$828 CAD faturado anualmente" : "$828 facturado anualmente") : (lang === "EN" ? "Billed monthly" : lang === "FR" ? "Facturé mensuellement" : lang === "PT" ? "Faturamento mensal" : "Facturado mensualmente")}
                  </p>
                  <p className="text-xs text-slate-400 mt-2.5 font-semibold">
                    {lang === "EN" ? "Perfect for small contractors, trades, and subtrades (1-5 projects/yr)." : lang === "FR" ? "Parfait pour les petits entrepreneurs et sous-traitants." : lang === "PT" ? "Ideal para pequenos empreiteiros, trades e subempreiteiros (1–5 projetos/ano)." : "Perfecto para pequeños contratistas y subcontratistas."}
                  </p>
                </div>
                
                {/* Annual Prepaid Bonus Alert */}
                {billingInterval === "annually" && (
                  <div className="bg-amber-500/10 text-amber-400 text-[10px] font-extrabold px-3 py-2 rounded-xl border border-amber-500/20">
                    🎁 {lang === "EN" ? "Annual Bonus: 2 Months Free + 100 Bonus AI Credits!" : lang === "FR" ? "Bonus Annuel: 2 mois gratuits + 100 crédits IA!" : lang === "PT" ? "Bônus Anual: 2 Meses Grátis + 100 Créditos de IA Bônus!" : "¡Bono Anual: 2 meses gratis + 100 créditos de IA!"}
                  </div>
                )}

                <div className="border-t border-slate-850/80 pt-4 space-y-3 text-xs text-slate-300 font-bold">
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "10 projetos simultâneos" : lang === "FR" ? "10 projets simultanés" : lang === "ES" ? "10 proyectos simultáneos" : "10 simultaneous active projects"}</div>
                  <div className="flex gap-2 items-center text-amber-400">✓ {lang === "PT" ? "30 análises de plantas/mês por IA" : lang === "FR" ? "30 analyses de plans/mois par IA" : lang === "ES" ? "30 análisis de planos/mes por IA" : "30 AI blueprint analyses / month"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Lista de materiais ilimitada nos créditos" : lang === "FR" ? "Matériaux illimités dans les crédits" : lang === "ES" ? "Materiales ilimitados en créditos" : "Unlimited Materials List within credits"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "RDO digital ilimitado" : lang === "FR" ? "Rapport quotidien illimité" : lang === "ES" ? "Reportes de obra ilimitados" : "Unlimited digital daily reports"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Segurança WSIB completa + notificações" : lang === "FR" ? "WSIB complet + notifications" : lang === "ES" ? "Seguridad WSIB completa + alertas" : "Full Safety/WSIB templates & notifications"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Scheduling básico Gantt simples" : lang === "FR" ? "Planification Gantt simple" : lang === "ES" ? "Programación Gantt simple" : "Basic Gantt scheduling"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "5 contratos CCDC digitais/mês" : lang === "FR" ? "5 contrats CCDC par mois" : lang === "ES" ? "5 contratos CCDC al mes" : "5 digital CCDC contracts / month"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Rastreamento de Prompt Payment" : lang === "FR" ? "Suivi du paiement rapide" : lang === "ES" ? "Seguimiento de pago rápido" : "Prompt Payment tracking"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "1 portal do cliente ativo" : lang === "FR" ? "1 portail client actif" : lang === "ES" ? "1 portal de cliente activo" : "1 active customer portal"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Suporte via chat + email" : lang === "FR" ? "Support chat + e-mail" : lang === "ES" ? "Soporte por chat + email" : "Chat + email support (Business hours)"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Exportação ilimitada (PDF/CSV)" : lang === "FR" ? "Exportations illimitées (PDF/CSV)" : lang === "ES" ? "Exportaciones ilimitadas (PDF/CSV)" : "Unlimited Export (PDF/CSV)"}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setContractorType("General");
                  setProjectVolume("4-10");
                  setShowQuiz(true);
                  setQuizStep(3);
                }}
                className="w-full bg-slate-950 text-slate-350 hover:text-white border border-slate-800 hover:bg-slate-900 py-3.5 rounded-xl text-xs font-black transition-all duration-200 mt-2"
              >
                {lang === "EN" ? "Choose Starter" : lang === "FR" ? "Choisir Starter" : lang === "PT" ? "Escolher Starter" : "Elegir Starter"}
              </button>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-slate-950 shadow-md">
                {lang === "EN" ? "RECOMMENDED" : lang === "FR" ? "RECOMMANDÉ" : lang === "PT" ? "RECOMENDADO" : "RECOMENDADO"}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black text-amber-400 uppercase tracking-widest">Pro</p>
                  <p className="text-4xl font-extrabold text-white mt-2 font-display">
                    {billingInterval === "annually" ? "$159" : "$189"}
                    <span className="text-xs text-slate-400"> CAD/mo</span>
                  </p>
                  <p className="text-[10px] text-amber-400 font-semibold mt-1">
                    {billingInterval === "annually" ? (lang === "EN" ? "$1,908 billed annually ($159/mo)" : lang === "FR" ? "1 908 $ facturé annuellement" : lang === "PT" ? "$1.908 CAD faturado anualmente" : "$1,908 facturado anualmente") : (lang === "EN" ? "Billed monthly" : lang === "FR" ? "Facturé mensuellement" : lang === "PT" ? "Faturamento mensal" : "Facturado mensuellement")}
                  </p>
                  <p className="text-xs text-slate-400 mt-2.5 font-semibold">
                    {lang === "EN" ? "For small & medium GCs, specialty contractors with higher volume (5-20 projects/yr)." : lang === "FR" ? "Pour les entrepreneurs généraux et spécialisés à volume élevé." : lang === "PT" ? "Para GCs pequenos e médios, specialty contractors com maior volume (5–20 projetos/ano)." : "Para contratistas generales y subcontratistas con mayor volumen."}
                  </p>
                  <p className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded mt-2.5 inline-block font-extrabold">
                    {lang === "EN" ? "+$15 CAD / user / month (first 3 included)" : lang === "FR" ? "+15 $ CAD / utilisateur / mois (3 inclus)" : lang === "PT" ? "+$15 CAD / usuário / mês (primeiros 3 incluídos)" : "+$15 CAD / usuario / mes (primeros 3 incluidos)"}
                  </p>
                </div>

                {/* Annual Prepaid Bonus Alert */}
                {billingInterval === "annually" && (
                  <div className="bg-amber-500/10 text-amber-400 text-[10px] font-extrabold px-3 py-2 rounded-xl border border-amber-500/20">
                    🎁 {lang === "EN" ? "Annual Bonus: 2 Months Free + Unlimited AI Access!" : lang === "FR" ? "Bonus Annuel: 2 mois gratuits + Accès IA illimité!" : lang === "PT" ? "Bônus Anual: 2 Meses Grátis + Acesso Ilimitado à IA!" : "¡Bono Anual: 2 meses gratis + Acceso IA ilimitado!"}
                  </div>
                )}

                <div className="border-t border-slate-800 pt-4 space-y-3 text-xs text-slate-200 font-bold">
                  <div className="flex gap-2 items-center text-amber-400">✓ {lang === "PT" ? "Projetos ativos ilimitados" : lang === "FR" ? "Projets illimités" : lang === "ES" ? "Proyectos ilimitados" : "Unlimited active projects"}</div>
                  <div className="flex gap-2 items-center text-amber-400">✓ {lang === "PT" ? "Análise de plantas por IA ilimitada" : lang === "FR" ? "Analyses de plans d'IA illimitées" : lang === "ES" ? "Análisis de planos por IA ilimitados" : "Unlimited AI blueprint takeoffs"}</div>
                  <div className="flex gap-2 items-center text-amber-400">✓ {lang === "PT" ? "Lista de materiais por IA ilimitada" : lang === "FR" ? "Liste de matériaux d'IA illimitée" : lang === "ES" ? "Lista de materiales de IA ilimitada" : "Unlimited AI Materials list"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "AI de voz para relatórios de campo (RDO)" : lang === "FR" ? "IA de voix pour rapports de chantier" : lang === "ES" ? "IA de voz para reportes de obra" : "Voice AI for field daily logs"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Safety/WSIB avançado: COR, incidentes, OSHA" : lang === "FR" ? "SST avancé: COR, incidents, OSHA" : lang === "ES" ? "SST avanzado: COR, incidentes, OSHA" : "Advanced Safety/WSIB: COR compliance & incidents"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Scheduling avançado: Gantt + CPM + dep." : lang === "FR" ? "Calendrier avancé: Gantt + CPM + dép." : lang === "ES" ? "Calendario avanzado: Gantt + CPM + dep." : "Advanced Scheduling: Gantt + CPM + dependencies"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Contratos CCDC digitais ilimitados" : lang === "FR" ? "Contrats CCDC numériques illimités" : lang === "ES" ? "Contratos CCDC digitales ilimitados" : "Unlimited digital CCDC contracts"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Prompt Payment: alertas por província" : lang === "FR" ? "Paiement rapide: alertes provinciales" : lang === "ES" ? "Pago rápido: alertas provinciales" : "Prompt Payment: automatic provincial alerts"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Portal do cliente ilimitado" : lang === "FR" ? "Portails clients illimités" : lang === "ES" ? "Portales de clientes ilimitados" : "Unlimited active customer portals"}</div>
                  <div className="flex gap-2 items-center text-amber-400">✓ {lang === "PT" ? "NBC compliance checks (Código de Construção)" : lang === "FR" ? "Contrôles de conformité NBC" : lang === "ES" ? "Controles de conformidad NBC" : "National Building Code (NBC) compliance checks"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Relatórios financeiros e job costing" : lang === "FR" ? "Rapports financiers et job costing" : lang === "ES" ? "Reportes financieros y job costing" : "Financial reports: Job costing & margins"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Integrações: QuickBooks, Xero" : lang === "FR" ? "Intégrations QuickBooks & Xero" : lang === "ES" ? "Integraciones con QuickBooks & Xero" : "QuickBooks & Xero integrations"}</div>
                  <div className="flex gap-2 items-center text-emerald-400">✓ {lang === "PT" ? "Assistente de elegibilidade CDAP/Grant" : lang === "FR" ? "Assistant de subvention CDAP" : lang === "ES" ? "Asistente de subsidios CDAP" : "CDAP / Grant assistance & eligibility guide"}</div>
                  <div className="flex gap-2 items-center">✓ {lang === "PT" ? "Suporte prioritário e chat ao vivo" : lang === "FR" ? "Support prioritaire et chat en direct" : lang === "ES" ? "Soporte prioritario y chat en vivo" : "Priority live chat support 24/7"}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setContractorType("Enterprise");
                  setProjectVolume("10+");
                  setShowQuiz(true);
                  setQuizStep(3);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 py-3.5 rounded-xl text-xs font-black transition-all duration-200 shadow-lg shadow-amber-500/10 mt-2"
              >
                {lang === "EN" ? "Choose Pro" : lang === "FR" ? "Choisir Pro" : lang === "PT" ? "Escolher Pro" : "Elegir Pro"}
              </button>
            </div>
          </div>

          {/* Builder Fit Quiz callout */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <HelpCircle className="w-4.5 h-4.5 text-amber-500" /> Not sure which plan fits?
              </h4>
              <p className="text-[11px] text-slate-450 mt-1 font-semibold">Take our quick 2-question Builder Fit Quiz to determine the perfect subscription for your projects.</p>
            </div>
            <button
              onClick={() => {
                setQuizStep(1);
                setContractorType("");
                setProjectVolume("");
                setShowQuiz(true);
              }}
              className="bg-slate-950 text-amber-400 border border-amber-500/20 hover:border-amber-500 hover:bg-slate-900 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shadow-inner flex items-center gap-1.5 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Take Builder Fit Quiz
            </button>
          </div>
        </div>
      </section>

      {/* Grants section */}
      <section className="py-20 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl border border-slate-800/85 p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <DollarSign className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 font-display">
              {t("grants_title")}
            </h2>
            <p className="text-slate-450 text-sm max-w-2xl mx-auto mb-8 leading-relaxed font-semibold">
              {t("grants_desc")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["CDAP", "RAII Grant", "SR&ED Tax Credit", "AI Compute Access"].map((grant) => (
                <span
                  key={grant}
                  className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full border border-emerald-500/20 flex items-center"
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-emerald-500" />
                  {grant}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-amber-500/20">
              <Headphones className="w-3.5 h-3.5" />
              Support & Onboarding
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 font-display">{t("onboarding_title")}</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto font-semibold">{t("onboarding_desc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", icon: Phone, titleKey: "onboarding_step1_title" as const, descKey: "onboarding_step1_desc" as const, color: "amber" },
              { step: "02", icon: HardHat, titleKey: "onboarding_step2_title" as const, descKey: "onboarding_step2_desc" as const, color: "orange" },
              { step: "03", icon: Users, titleKey: "onboarding_step3_title" as const, descKey: "onboarding_step3_desc" as const, color: "emerald" },
            ].map((item) => (
              <div key={item.step} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center relative group hover:border-amber-500/30 transition-all duration-300">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                  Step {item.step}
                </div>
                <div className={`w-14 h-14 bg-${item.color}-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-${item.color}-500/20 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 text-${item.color}-400`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 font-display">{t(item.titleKey)}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-amber-500/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl shadow-amber-500/5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-br-full pointer-events-none" />
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
              <FileText className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 font-display">{t("lead_magnet_title")}</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8 font-semibold">{t("lead_magnet_desc")}</p>
            {leadSubmitted ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm animate-fade-in">
                <CheckCircle2 className="w-5 h-5" />
                {t("lead_magnet_success")}
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (leadEmail) setLeadSubmitted(true); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder={t("lead_magnet_placeholder")}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    aria-label="Email address for checklist download"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 px-6 py-3 rounded-xl text-sm font-extrabold hover:shadow-lg hover:shadow-amber-500/15 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {t("lead_magnet_cta")} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 font-display">{t("faq_title")}</h2>
          </div>
          <div className="space-y-3">
            {([
              { q: "faq_q1" as const, a: "faq_a1" as const },
              { q: "faq_q2" as const, a: "faq_a2" as const },
              { q: "faq_q3" as const, a: "faq_a3" as const },
              { q: "faq_q4" as const, a: "faq_a4" as const },
              { q: "faq_q5" as const, a: "faq_a5" as const },
              { q: "faq_q6" as const, a: "faq_a6" as const },
            ]).map((item, index) => (
              <div key={index} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-800/30 transition-colors"
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-sm font-bold text-white pr-4">{t(item.q)}</span>
                  <ChevronDown className={`w-5 h-5 text-amber-400 flex-shrink-0 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div id={`faq-answer-${index}`} className="px-6 pb-5 animate-fade-in">
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">{t(item.a)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rebranded Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-16 text-slate-500 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <HardHat className="w-4.5 h-4.5 text-slate-950 font-black" />
              </div>
              <span className="text-lg font-extrabold text-white font-display">Obrized</span>
            </div>
            <p className="text-[11px] leading-relaxed max-w-xs text-slate-500 font-semibold">
              Obrized is Canada's premier AI co-pilot designed to resolve construction bottlenecks in compliance, estimating, contracts, scheduling, and Prompt Payments.
            </p>
            <p className="text-[10px] text-slate-650 font-bold uppercase tracking-widest">{t("grants_footer")}</p>
          </div>

          {/* Column 1 */}
          <div className="space-y-3">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Product</p>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">AI Quantity Takeoffs</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">CCDC Contract reviews</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Voice Safety Logs</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Gantt delay paths</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Resources</p>
            <ul className="space-y-2">
              <li><Link href="#roi" className="hover:text-white transition-colors">ROI Calculator</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Builder Fit Quiz</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">CDAP Funding Guide</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">COR Checklist templates</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security & Compliance</Link></li>
              <li><Link href="/case-studies/maple-ridge" className="hover:text-white transition-colors">Case Studies</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-650 font-bold uppercase tracking-wider">
          <p>© 2026 Obrized.com. All rights reserved.</p>
          <p>Designed with absolute visual excellence in Canada</p>
        </div>
      </footer>

      {/* Interactive Builder Fit Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg mx-4 shadow-2xl relative overflow-hidden">
            
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Builder Fit Quiz
              </h3>
              <button
                onClick={() => setShowQuiz(false)}
                className="p-1 text-slate-450 hover:text-white hover:bg-slate-850 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Contractor Type */}
            {quizStep === 1 && (
              <div className="py-6 space-y-4">
                <p className="text-sm font-bold text-white">1. What is your primary contractor role?</p>
                <div className="space-y-2.5">
                  {[
                    { val: "Trade", label: "Specialty Trade (MEP, Drywall, Masonry, etc.)" },
                    { val: "General", label: "General Contractor (Commercial / Residential)" },
                    { val: "Enterprise", label: "Large Developer / Multi-company Enterprise" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setContractorType(opt.val);
                        setQuizStep(2);
                      }}
                      className="w-full text-left p-4 rounded-xl bg-slate-950 border border-slate-850 hover:border-amber-500/50 hover:bg-slate-900/60 font-semibold text-xs transition-all flex justify-between items-center"
                    >
                      <span className="text-slate-200">{opt.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Project volume */}
            {quizStep === 2 && (
              <div className="py-6 space-y-4">
                <p className="text-sm font-bold text-white">2. How many active projects do you manage simultaneously?</p>
                <div className="space-y-2.5">
                  {[
                    { val: "1-3", label: "1 to 3 projects at once" },
                    { val: "4-10", label: "4 to 10 projects at once" },
                    { val: "10+", label: "10+ projects at once" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setProjectVolume(opt.val);
                        setQuizStep(3);
                      }}
                      className="w-full text-left p-4 rounded-xl bg-slate-950 border border-slate-850 hover:border-amber-500/50 hover:bg-slate-900/60 font-semibold text-xs transition-all flex justify-between items-center"
                    >
                      <span className="text-slate-200">{opt.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Evaluation results */}
            {quizStep === 3 && (
              <div className="py-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Recommended Plan for you</p>
                  <h4 className="text-2xl font-black text-white font-display">{getQuizRecommendation().tier}</h4>
                  <p className="text-xl font-bold text-emerald-400">{getQuizRecommendation().price}</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-center text-xs text-slate-350 leading-relaxed font-semibold">
                  {getQuizRecommendation().desc}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setQuizStep(1);
                      setContractorType("");
                      setProjectVolume("");
                    }}
                    className="flex-1 bg-slate-950 text-slate-400 border border-slate-850 hover:text-white py-3.5 rounded-xl text-xs font-black transition-all"
                  >
                    Retake Quiz
                  </button>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowQuiz(false)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                  >
                    Start Free Trial <Sparkles className="w-4 h-4 text-slate-950" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
