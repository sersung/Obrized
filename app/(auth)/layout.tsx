import { HardHat, Calculator, FileText, ShieldCheck, DollarSign } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Calculator className="w-4 h-4" />,
    title: "Orçamentação com IA",
    desc: "Extração automática de quantitativos a partir de plantas PDF",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Análise de Contratos CCDC",
    desc: "Identifica cláusulas de risco e sugere redação alternativa",
  },
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    title: "Relatórios de Segurança",
    desc: "Gerados por voz em segundos — conformidade OHSA/WorkSafeBC",
  },
  {
    icon: <DollarSign className="w-4 h-4" />,
    title: "Prompt Payment",
    desc: "Rastreamento do prazo de 28 dias — Ontário e BC",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col bg-brand-700 text-white flex-shrink-0 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-600 rounded-full opacity-40" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-brand-800 rounded-full opacity-50" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-auto">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">BuildrAI</span>
          </Link>

          {/* Hero text */}
          <div className="my-12">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
              IA para construtores<br />
              <span className="text-brand-200">canadenses</span>
            </h2>
            <p className="text-brand-200 mt-4 text-base leading-relaxed">
              Orçamentos precisos, contratos seguros, segurança em dia e pagamentos no prazo —
              tudo em um só lugar.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-12">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-brand-300 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-brand-300 text-xs">
              Gratuito para sempre · Sem cartão de crédito · Dados hospedados no Canadá
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile header */}
        <header className="lg:hidden p-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">BuildrAI</span>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
