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
  CreditCard,
  Trash2,
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

  // Stateful tabs
  const [activeTab, setActiveTab] = useState<"profile" | "rates" | "language" | "plan">("profile");

  // Plan management states
  const [currentPlan, setCurrentPlan] = useState<"Free" | "Starter" | "Pro">("Starter");
  const [currentBilling, setCurrentBilling] = useState<"monthly" | "annually">("monthly");

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) setLang(savedLang);

    const savedPlan = localStorage.getItem("obrized_plan") as "Free" | "Starter" | "Pro";
    if (savedPlan) setCurrentPlan(savedPlan);

    const savedBilling = localStorage.getItem("obrized_billing") as "monthly" | "annually";
    if (savedBilling) setCurrentBilling(savedBilling);

    const savedRate = localStorage.getItem("obrized_labour_rate");
    if (savedRate) setDefaultLabourRate(parseInt(savedRate) || 65);

    const savedProvince = localStorage.getItem("obrized_province");
    if (savedProvince) {
      setDefaultProvince(savedProvince);
      setTaxRate(savedProvince === "ON" ? 13 : savedProvince === "QC" ? 14.975 : 5);
    }

    const savedCompany = localStorage.getItem("obrized_company_name");
    if (savedCompany) setCompanyName(savedCompany);

    const savedContractor = localStorage.getItem("obrized_contractor_name");
    if (savedContractor) setContractorName(savedContractor);

    const savedEmail = localStorage.getItem("obrized_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const { t } = useTranslations(lang);

  const handleSave = () => {
    localStorage.setItem("buildr_lang", lang);
    localStorage.setItem("obrized_plan", currentPlan);
    localStorage.setItem("obrized_billing", currentBilling);
    localStorage.setItem("obrized_labour_rate", defaultLabourRate.toString());
    localStorage.setItem("obrized_province", defaultProvince);
    localStorage.setItem("obrized_company_name", companyName);
    localStorage.setItem("obrized_contractor_name", contractorName);
    localStorage.setItem("obrized_email", email);

    const successMsg = 
      lang === "EN" ? "Settings saved successfully!" : 
      lang === "FR" ? "Paramètres enregistrés avec succès !" : 
      lang === "PT" ? "Configurações salvas com sucesso!" : 
      "¡Configuraciones guardadas con éxito!";
    toast.success(successMsg);
    
    // Refresh to apply language change globally
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("settings")}</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          {lang === "EN" ? "Manage your company profile, default tax rates, regional parameters, and current subscription plan." : 
           lang === "FR" ? "Gérez le profil de votre entreprise, les taxes par défaut, les paramètres régionaux et votre forfait d'abonnement." : 
           lang === "PT" ? "Gerencie o perfil da sua empresa, taxas de impostos padrão, parâmetros regionais e o plano de assinatura atual." : 
           "Gestione el perfil de su empresa, las tasas de impuestos predeterminadas, los parámetros regionales y su plan de suscripción actual."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Navigation Sidebar settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-fit space-y-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              activeTab === "profile"
                ? "font-bold bg-brand-50 text-brand-700"
                : "font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>
              {lang === "EN" ? "Company Profile" : 
               lang === "FR" ? "Profil d'Entreprise" : 
               lang === "PT" ? "Perfil da Empresa" : 
               "Perfil de la Empresa"}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("rates")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              activeTab === "rates"
                ? "font-bold bg-brand-50 text-brand-700"
                : "font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>
              {lang === "EN" ? "Rates & Taxes" : 
               lang === "FR" ? "Taux & Taxes" : 
               lang === "PT" ? "Taxas & Impostos" : 
               "Tasas e Impuestos"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("language")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              activeTab === "language"
                ? "font-bold bg-brand-50 text-brand-700"
                : "font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>
              {lang === "EN" ? "Language Toggles" : 
               lang === "FR" ? "Langue de l'Interface" : 
               lang === "PT" ? "Idioma da Interface" : 
               "Idioma de la Interfaz"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("plan")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              activeTab === "plan"
                ? "font-bold bg-brand-50 text-brand-700"
                : "font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {lang === "EN" ? "Subscription Plan" : 
               lang === "FR" ? "Plan d'Abonnement" : 
               lang === "PT" ? "Plano de Assinatura" : 
               "Plan de Suscripción"}
            </span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Company Details Tab */}
          {activeTab === "profile" && (
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
          )}

          {/* Rates & Taxes Tab */}
          {activeTab === "rates" && (
            <div className="space-y-6">
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
            </div>
          )}

          {/* Language Toggles Tab */}
          {activeTab === "language" && (
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
                  type="button"
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
                  type="button"
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
                  type="button"
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
                  type="button"
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
          )}

          {/* Subscription Plan Panel Tab */}
          {activeTab === "plan" && (
            <div className="space-y-6 animate-fade-in">
              {/* Active Plan Detail Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {lang === "EN" ? "Current Subscription" : lang === "FR" ? "Abonnement Actuel" : lang === "PT" ? "Assinatura Atual" : "Suscripción Actual"}
                    </p>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-black font-display tracking-tight text-white">
                        {currentPlan === "Free" ? (lang === "PT" ? "Plano Gratuito" : lang === "FR" ? "Forfait Gratuit" : lang === "ES" ? "Plan Gratuito" : "Free Plan") : 
                         currentPlan === "Starter" ? "Starter Plan" : "Pro Plan"}
                      </h4>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {lang === "EN" ? "Active" : lang === "FR" ? "Actif" : lang === "PT" ? "Ativo" : "Activo"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-amber-400 font-display">
                      {currentPlan === "Free" ? "$0" : currentPlan === "Starter" ? (currentBilling === "annually" ? "$69" : "$79") : (currentBilling === "annually" ? "$159" : "$189")}
                      <span className="text-xs text-slate-400 font-semibold"> CAD/mo</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {currentPlan === "Free" ? (lang === "EN" ? "Forever Free" : lang === "FR" ? "Gratuit à vie" : lang === "PT" ? "Grátis para sempre" : "Gratis de por vida") : 
                       currentBilling === "annually" ? (lang === "EN" ? "Billed annually" : lang === "FR" ? "Facturé annuellement" : lang === "PT" ? "Faturamento anual" : "Facturado anualmente") : (lang === "EN" ? "Billed monthly" : lang === "FR" ? "Facturé mensuellement" : lang === "PT" ? "Faturamento mensal" : "Facturado mensualmente")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-350">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">
                      {lang === "EN" ? "Next Invoice" : lang === "FR" ? "Prochaine Facture" : lang === "PT" ? "Próxima Fatura" : "Próxima Factura"}
                    </span>
                    <span className="text-slate-200 mt-1 block">June 30, 2026</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">
                      {lang === "EN" ? "Payment Method" : lang === "FR" ? "Moyen de Paiement" : lang === "PT" ? "Forma de Pagamento" : "Método de Pago"}
                    </span>
                    <span className="text-slate-200 mt-1 block">MasterCard ending in **** 8402</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">
                      {lang === "EN" ? "CAD Currency Lock" : lang === "FR" ? "Devise Canadienne" : lang === "PT" ? "Moeda CAD Ativa" : "Moneda CAD Activa"}
                    </span>
                    <span className="text-emerald-400 mt-1 block font-bold">100% Tax Exempted CAD</span>
                  </div>
                </div>
              </div>

              {/* Modify Plan Options Grid */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  <span>
                    {lang === "EN" ? "Modify or Upgrade Your Plan" : lang === "FR" ? "Modifier ou Améliorer votre Plan" : lang === "PT" ? "Modificar ou Fazer Upgrade do Seu Plano" : "Modificar o Actualizar Su Plan"}
                  </span>
                </h3>
                
                {/* Plan options */}
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { 
                      id: "Free", 
                      name: lang === "PT" ? "Gratuito" : lang === "FR" ? "Gratuit" : "Free", 
                      price: "$0",
                      desc: lang === "EN" ? "2 active projects, 3 AI analyses/mo, limited templates." : lang === "PT" ? "2 projetos ativos, 3 análises/mês, templates básicos." : "2 proyectos activos, 3 análisis/mes."
                    },
                    { 
                      id: "Starter", 
                      name: "Starter", 
                      price: currentBilling === "annually" ? "$69 CAD" : "$79 CAD", 
                      desc: lang === "EN" ? "10 projects, 30 AI takeoffs, WSIB compliance, simple Gantt." : lang === "PT" ? "10 projetos, 30 takeoffs de IA, Gantt simples." : "10 proyectos, 30 takeoffs de IA."
                    },
                    { 
                      id: "Pro", 
                      name: "Pro Plan", 
                      price: currentBilling === "annually" ? "$159 CAD" : "$189 CAD", 
                      desc: lang === "EN" ? "Unlimited projects, unlimited AI takeoffs, voice logs, NBC checks." : lang === "PT" ? "Projetos ilimitados, IA ilimitada, NBC checks." : "Projetos ilimitados, IA ilimitada."
                    }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setCurrentPlan(p.id as any);
                        const changeMsg = 
                          lang === "EN" ? `Plan changed to ${p.id}!` : 
                          lang === "FR" ? `Plan changé pour ${p.id} !` : 
                          lang === "PT" ? `Plano alterado para ${p.id}!` : 
                          `¡Plan cambiado a ${p.id}!`;
                        toast.success(changeMsg);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all space-y-2 flex flex-col justify-between h-36 ${
                        currentPlan === p.id
                          ? "border-brand-500 bg-brand-50/15 shadow-sm ring-2 ring-brand-500/20"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-black ${currentPlan === p.id ? "text-brand-700" : "text-gray-900"}`}>{p.name}</span>
                          {currentPlan === p.id && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                        </div>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1 leading-normal">{p.desc}</p>
                      </div>
                      <span className="text-sm font-extrabold text-gray-900 block mt-2">{p.price}<span className="text-[9px] text-gray-400 font-normal">/mo</span></span>
                    </button>
                  ))}
                </div>

                {/* Billing Cycle Switcher for current plan selection */}
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {lang === "EN" ? "Billing Cycle" : lang === "FR" ? "Cycle de Facturation" : lang === "PT" ? "Ciclo de Faturamento" : "Ciclo de Facturación"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentBilling("monthly");
                        toast.success(lang === "EN" ? "Switched to Monthly billing cycle" : "Alterado para faturamento mensal");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentBilling === "monthly"
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {lang === "EN" ? "Monthly" : lang === "FR" ? "Mensuel" : lang === "PT" ? "Mensal" : "Mensual"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentBilling("annually");
                        toast.success(lang === "EN" ? "Switched to Annual billing cycle" : "Alterado para faturamento anual");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentBilling === "annually"
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {lang === "EN" ? "Annually (Save ~15%)" : lang === "FR" ? "Annuel" : lang === "PT" ? "Anual (Economize ~15%)" : "Anual"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cancel Subscription Area */}
              <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-rose-900">
                    {lang === "EN" ? "Danger Zone: Cancel Subscription" : lang === "FR" ? "Zone de Danger : Annuler l'Abonnement" : lang === "PT" ? "Zona de Perigo: Cancelar Assinatura" : "Zona de Peligro: Cancelar Suscripción"}
                  </h4>
                  <p className="text-[11px] text-rose-700 font-semibold leading-relaxed">
                    {lang === "EN" ? "Cancelling will revert your account to the Free Plan at the end of your billing cycle. You will lose access to 10+ active projects, unlimited safety logs, and professional CCDC reviews." : 
                     lang === "FR" ? "L'annulation ramènera votre compte au forfait gratuit. Vous perdrez l'accès aux fonctionnalités Starter." : 
                     lang === "PT" ? "O cancelamento reverterá sua conta para o Plano Gratuito no final do ciclo de faturamento. Você perderá o acesso a mais de 10 projetos ativos, relatórios ilimitados e revisões de contratos CCDC." : 
                     "La cancelación revertirá su cuenta al Plan Gratis al final de su ciclo de facturación."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPlan("Free");
                    const cancelMsg = 
                      lang === "EN" ? "Subscription cancelled. Your account has been demoted to the Free Plan." : 
                      lang === "FR" ? "Abonnement annulé. Votre compte a été rétrogradé au forfait gratuit." : 
                      lang === "PT" ? "Assinatura cancelada com sucesso! Sua conta foi revertida para o Plano Gratuito." : 
                      "Suscripción cancelada con éxito. Su cuenta ha sido revertida al Plan Gratuito.";
                    toast.error(cancelMsg);
                  }}
                  className="bg-rose-600 text-white hover:bg-rose-700 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm shadow-rose-600/10"
                >
                  {lang === "EN" ? "Cancel Subscription" : lang === "FR" ? "Annuler l'Abonnement" : lang === "PT" ? "Cancelar Assinatura" : "Cancelar Suscripción"}
                </button>
              </div>
            </div>
          )}

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
