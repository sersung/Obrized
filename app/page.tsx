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
} from "lucide-react";
import { useTranslations, Language } from "@/lib/translations";

export default function LandingPage() {
  const [lang, setLang] = useState<Language>("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    let nextLang: Language = "EN";
    if (lang === "EN") nextLang = "FR";
    else if (lang === "FR") nextLang = "PT";
    else if (lang === "PT") nextLang = "ES";
    else nextLang = "EN";
    localStorage.setItem("buildr_lang", nextLang);
    setLang(nextLang);
    window.location.reload();
  };

  const { t } = useTranslations(lang);

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: t("estimating"),
      description: t("feat_estimating_desc"),
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: t("contracts"),
      description: t("feat_contracts_desc"),
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: <HardHat className="w-6 h-6" />,
      title: t("safety"),
      description: t("feat_safety_desc"),
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t("scheduling"),
      description: t("feat_scheduling_desc"),
      color: "bg-green-50 text-green-600",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: t("payments"),
      description: t("feat_payments_desc"),
      color: "bg-red-50 text-red-600",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t("summary"),
      description: t("feat_dashboard_desc"),
      color: "bg-teal-50 text-teal-600",
    },
  ];

  const stats = [
    { label: t("stats_takeoff"), value: "80%" },
    { label: t("stats_smes"), value: "99.9%" },
    { label: t("stats_bureaucracy"), value: "$51B" },
    { label: t("stats_workforce"), value: "380k" },
  ];

  const painPoints = [
    t("pain_1"),
    t("pain_2"),
    t("pain_3"),
    t("pain_4"),
    t("pain_5"),
    t("pain_6"),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BuildrAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors font-medium">
              {lang === "EN" ? "Features" : lang === "FR" ? "Fonctionnalités" : lang === "PT" ? "Funcionalidades" : "Funcionalidades"}
            </a>
            <a href="#pain-points" className="hover:text-gray-900 transition-colors font-medium">
              {lang === "EN" ? "Problems We Solve" : lang === "FR" ? "Problèmes résolus" : lang === "PT" ? "Problemas que Resolvemos" : "Problemas que Resolvemos"}
            </a>
            <a href="#stats" className="hover:text-gray-900 transition-colors font-medium">
              {lang === "EN" ? "Results" : lang === "FR" ? "Résultats" : lang === "PT" ? "Resultados" : "Resultados"}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-650 hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang}</span>
            </button>
            <Link
              href="/dashboard"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/10 transition-all flex items-center gap-2"
            >
              {t("access_platform")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-brand-100">
          <Zap className="w-4 h-4" />
          {t("marketing_badge")}
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {t("hero_title_1")}
          <br />
          <span className="text-brand-600">{t("hero_title_2")}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          {t("hero_subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/10 transition-all flex items-center justify-center gap-2"
          >
            {t("access_platform")} <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {t("view_features")}
          </a>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="bg-brand-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-brand-200 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section id="pain-points" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("pain_title")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("pain_desc")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {painPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100"
              >
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <span className="text-gray-700 text-sm font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("features_title")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("features_desc")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-gray-250 hover:shadow-md hover:shadow-gray-200/20 transition-all bg-white"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grants section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-3xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t("grants_title")}
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t("grants_desc")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["CDAP", "RAII", "SR&ED Tax Credit", "AI Compute Access Fund"].map((grant) => (
                <span
                  key={grant}
                  className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full border border-green-100 flex items-center"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
                  {grant}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t("ready_multiply")}
          </h2>
          <p className="text-brand-200 mb-8 max-w-xl mx-auto">
            {t("ready_desc")}
          </p>
          <Link
            href="/dashboard"
            className="bg-white text-brand-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            {t("access_platform")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-700">BuildrAI</span>
          </div>
          <p>{t("grants_footer")}</p>
        </div>
      </footer>
    </div>
  );
}
