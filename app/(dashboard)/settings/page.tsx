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
    const successMsg = 
      lang === "EN" ? "Settings saved successfully!" : 
      lang === "FR" ? "Paramètres enregistrés avec succès !" : 
      lang === "PT" ? "Configurações salvas com sucesso!" : 
      "¡Configuraciones guardadas con éxito!";
    toast.success(successMsg);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("settings")}</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          {lang === "EN" ? "Manage your company profile, default tax rates, regional parameters, and multilingual translations." : 
           lang === "FR" ? "Gérez le profil de votre entreprise, les taxes par défaut, les paramètres régionaux et la traduction multilingue." : 
           lang === "PT" ? "Gerencie o perfil da sua empresa, taxas de impostos padrão, parâmetros regionais e traduções multilíngues." : 
           "Gestione el perfil de su empresa, las tasas de impuestos predeterminadas, los parámetros regionales y las traducciones multilingües."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Navigation Sidebar settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-fit space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-brand-50 text-brand-700">
            <Building className="w-4 h-4" />
            <span>
              {lang === "EN" ? "Company Profile" : 
               lang === "FR" ? "Profil d'Entreprise" : 
               lang === "PT" ? "Perfil da Empresa" : 
               "Perfil de la Empresa"}
            </span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>
              {lang === "EN" ? "Rates & Taxes" : 
               lang === "FR" ? "Taux & Taxes" : 
               lang === "PT" ? "Taxas & Impostos" : 
               "Tasas e Impuestos"}
            </span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>
              {lang === "EN" ? "Language Toggles" : 
               lang === "FR" ? "Langue" : 
               lang === "PT" ? "Idiomas" : 
               "Idiomas"}
            </span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Company Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <Building className="w-4 h-4 text-brand-600" />
              <span>
                {lang === "EN" ? "Company Credentials" : 
                 lang === "FR" ? "Coordonnées de l'Entreprise" : 
                 lang === "PT" ? "Credenciais da Empresa" : 
                 "Credenciales de la Empresa"}
              </span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {lang === "EN" ? "Legal Company Name" : 
                   lang === "FR" ? "Nom Légal de l'Entreprise" : 
                   lang === "PT" ? "Nome Legal da Empresa" : 
                   "Nombre Legal de la Empresa"}
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
                  {lang === "EN" ? "Primary Contact Name" : 
                   lang === "FR" ? "Nom du Contact Principal" : 
                   lang === "PT" ? "Nome do Contato Principal" : 
                   "Nombre del Contacto Principal"}
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
                  {lang === "EN" ? "Corporate Email Address" : 
                   lang === "FR" ? "Adresse Courriel de l'Entreprise" : 
                   lang === "PT" ? "Endereço de E-mail Corporativo" : 
                   "Dirección de Correo Electrónico Corporativo"}
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
              <span>
                {lang === "EN" ? "Wages, Estimates & Tax Defaults" : 
                 lang === "FR" ? "Tarifs, Estimations & Taxes par Défaut" : 
                 lang === "PT" ? "Salários, Orçamentos & Impostos Padrão" : 
                 "Salarios, Estimaciones e Impuestos Predeterminados"}
              </span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {lang === "EN" ? "Default Labour Rate ($/hr)" : 
                   lang === "FR" ? "Tarif Horaire par Défaut ($/h)" : 
                   lang === "PT" ? "Taxa de Mão de Obra Padrão ($/h)" : 
                   "Tarifa de Mano de Obra Predeterminada ($/h)"}
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
                  {lang === "EN" ? "Default Province/Region" : 
                   lang === "FR" ? "Province/Région par Défaut" : 
                   lang === "PT" ? "Província/Região Padrão" : 
                   "Provincia/Región Predeterminada"}
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

          {/* Multilingual settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <Globe className="w-4 h-4 text-brand-600" />
              <span>
                {lang === "EN" ? "Preferred Interface Language" : 
                 lang === "FR" ? "Langue de l'Interface" : 
                 lang === "PT" ? "Idioma de Interface Preferido" : 
                 "Idioma de Interfaz Preferido"}
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setLang("EN")}
                className={`p-4 rounded-xl border text-center transition-all ${
                  lang === "EN"
                    ? "border-brand-500 bg-brand-50/20 text-brand-700 font-bold"
                    : "border-gray-200 text-gray-500 font-semibold hover:bg-gray-50"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang("FR")}
                className={`p-4 rounded-xl border text-center transition-all ${
                  lang === "FR"
                    ? "border-brand-500 bg-brand-50/20 text-brand-700 font-bold"
                    : "border-gray-200 text-gray-500 font-semibold hover:bg-gray-50"
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLang("PT")}
                className={`p-4 rounded-xl border text-center transition-all ${
                  lang === "PT"
                    ? "border-brand-500 bg-brand-50/20 text-brand-700 font-bold"
                    : "border-gray-200 text-gray-500 font-semibold hover:bg-gray-50"
                }`}
              >
                Português
              </button>
              <button
                onClick={() => setLang("ES")}
                className={`p-4 rounded-xl border text-center transition-all ${
                  lang === "ES"
                    ? "border-brand-500 bg-brand-50/20 text-brand-700 font-bold"
                    : "border-gray-200 text-gray-500 font-semibold hover:bg-gray-50"
                }`}
              >
                Español
              </button>
            </div>
          </div>

          {/* Grants eligibility check */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-850 pb-3">
              <Briefcase className="w-4 h-4 text-brand-400" />
              <span>
                {lang === "EN" ? "Canadian Tech Grants Eligibility" : 
                 lang === "FR" ? "Éligibilité aux Subventions Canadiennes" : 
                 lang === "PT" ? "Elegibilidade para Subsídios de Tecnologia Canadenses" : 
                 "Elegibilidad para Subvenciones de Tecnología Canadienses"}
              </span>
            </h3>
            <div className="space-y-3">
              {[
                { 
                  title: "CDAP (Canada Digital Adoption Program)", 
                  desc: lang === "EN" ? "Up to $15,000 in grants + 0% interest BDC loan." : 
                        lang === "FR" ? "Jusqu'à 15 000 $ en subventions + prêt BDC à taux d'intérêt de 0 %." : 
                        lang === "PT" ? "Até $15.000 em subsídios + empréstimo BDC com juros de 0%." : 
                        "Hasta $15,000 en subvenciones + préstamo BDC con interés del 0%."
                },
                { 
                  title: "RAII (Regional AI Integration)", 
                  desc: lang === "EN" ? "Up to 50% matching funds for AI infrastructure adoption." : 
                        lang === "FR" ? "Jusqu'à 50 % de fonds de contrepartie pour l'adoption d'infrastructures d'IA." : 
                        lang === "PT" ? "Até 50% de fundos de contrapartida para adoção de infraestrutura de IA." : 
                        "Hasta 50% de fondos de contrapartida para la adopción de infraestructura de IA."
                },
                { 
                  title: "SR&ED Tax Credit", 
                  desc: lang === "EN" ? "Scientific Research & Experimental Development credits." : 
                        lang === "FR" ? "Crédits d'impôt pour la recherche scientifique et le développement expérimental." : 
                        lang === "PT" ? "Créditos para Pesquisa Científica e Desenvolvimento Experimental." : 
                        "Créditos fiscales por Investigación Científica y Desarrollo Experimental."
                }
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
              {lang === "EN" ? "Save Parameters" : 
               lang === "FR" ? "Sauvegarder les Paramètres" : 
               lang === "PT" ? "Salvar Parâmetros" : 
               "Guardar Parámetros"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
