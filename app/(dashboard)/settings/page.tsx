"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Settings,
  Shield,
  Building,
  Globe,
  DollarSign,
  Briefcase,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useTranslations, Language } from "@/lib/translations";

export default function SettingsPage() {
  const [lang, setLang] = useState<Language>("EN");
  const [companyName, setCompanyName] = useState("JC Construction Ltd.");
  const [contractorName, setContractorName] = useState("John Carter");
  const [email, setEmail] = useState("john.carter@jcconstruction.ca");
  const [defaultLabourRate, setDefaultLabourRate] = useState(65);
  const [defaultProvince, setDefaultProvince] = useState("ON");
  const [taxRate, setTaxRate] = useState(13);

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  const handleSave = () => {
    localStorage.setItem("buildr_lang", lang);
    toast.success(lang === "EN" ? "Settings saved successfully!" : "Paramètres enregistrés avec succès !");
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("settings")}</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          {lang === "EN" ? "Manage your company profile, default tax rates, regional parameters, and bilingual translations." : "Gérez le profil de votre entreprise, les taxes par défaut, les paramètres régionaux et la traduction bilíngue."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Navigation Sidebar settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-fit space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-brand-50 text-brand-700">
            <Building className="w-4 h-4" />
            <span>{lang === "EN" ? "Company Profile" : "Profil d'Entreprise"}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>{lang === "EN" ? "Rates & Taxes" : "Taux & Taxes"}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>{lang === "EN" ? "Language Toggles" : "Langue"}</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Company Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <Building className="w-4 h-4 text-brand-600" />
              <span>{lang === "EN" ? "Company Credentials" : "Coordonnées de l'Entreprise"}</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {lang === "EN" ? "Legal Company Name" : "Nom Légal de l'Entreprise"}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {lang === "EN" ? "Primary Contact Name" : "Nom du Contact Principal"}
                </label>
                <input
                  type="text"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {lang === "EN" ? "Corporate Email Address" : "Adresse Courriel de l'Entreprise"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <DollarSign className="w-4 h-4 text-brand-600" />
              <span>{lang === "EN" ? "Wages, Estimates & Tax Defaults" : "Tarifs, Estimations & Taxes par Défaut"}</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {lang === "EN" ? "Default Labour Rate ($/hr)" : "Tarif Horaire par Défaut ($/h)"}
                </label>
                <input
                  type="number"
                  value={defaultLabourRate}
                  onChange={(e) => setDefaultLabourRate(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {lang === "EN" ? "Default Province/Region" : "Province/Région par Défaut"}
                </label>
                <select
                  value={defaultProvince}
                  onChange={(e) => {
                    setDefaultProvince(e.target.value);
                    setTaxRate(e.target.value === "ON" ? 13 : e.target.value === "QC" ? 14.975 : 5);
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-semibold text-gray-700"
                >
                  <option value="ON">Ontario (HST)</option>
                  <option value="BC">British Columbia (GST+PST)</option>
                  <option value="AB">Alberta (GST Only)</option>
                  <option value="QC">Québec (TPS+TVQ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bilingual settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <Globe className="w-4 h-4 text-brand-600" />
              <span>{lang === "EN" ? "Preferred Interface Language" : "Langue de l'Interface"}</span>
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setLang("EN")}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                  lang === "EN"
                    ? "border-brand-500 bg-brand-50/20 text-brand-700 font-bold"
                    : "border-gray-200 text-gray-500 font-semibold hover:bg-gray-50"
                }`}
              >
                English (Canada)
              </button>
              <button
                onClick={() => setLang("FR")}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                  lang === "FR"
                    ? "border-brand-500 bg-brand-50/20 text-brand-700 font-bold"
                    : "border-gray-200 text-gray-500 font-semibold hover:bg-gray-50"
                }`}
              >
                Français (Canada)
              </button>
            </div>
          </div>

          {/* Grants eligibility check */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-850 pb-3">
              <Briefcase className="w-4 h-4 text-brand-400" />
              <span>{lang === "EN" ? "Canadian Tech Grants Eligibility" : "Éligibilité aux Subventions Canadiennes"}</span>
            </h3>
            <div className="space-y-3">
              {[
                { title: "CDAP (Canada Digital Adoption Program)", desc: "Up to $15,000 in grants + 0% interest BDC loan." },
                { title: "RAII (Regional AI Integration)", desc: "Up to 50% matching funds for AI infrastructure adoption." },
                { title: "SR&ED Tax Credit", desc: "Scientific Research & Experimental Development credits." }
              ].map((grant, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-slate-100">{grant.title}</p>
                    <p className="text-slate-400 mt-0.5 font-medium leading-relaxed">{grant.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-brand-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/10 transition-all duration-200"
            >
              {lang === "EN" ? "Save Parameters" : "Sauvegarder les Paramètres"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
