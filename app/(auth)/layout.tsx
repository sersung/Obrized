import { HardHat, Calculator, FileText, ShieldCheck, DollarSign } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Calculator className="w-4 h-4" />,
    title: "AI Quantity Takeoffs",
    desc: "Automated quantity takeoff from PDF drawing uploads",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "CCDC Contract Review",
    desc: "Identifies contract risk clauses and suggests protective alternatives",
  },
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    title: "Safety & COR Daily Reports",
    desc: "Voice-dictated logs structured for OHS and COR compliance",
  },
  {
    icon: <DollarSign className="w-4 h-4" />,
    title: "Prompt Payment Statutory Clock",
    desc: "Track the 28-day statutory clock in Ontario and British Columbia",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex animate-fade-in bg-gray-50">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col bg-brand-700 text-white flex-shrink-0 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-600 rounded-full opacity-40 animate-pulse duration-4000" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-brand-800 rounded-full opacity-50 animate-pulse duration-3000" />

        <div className="relative z-10 flex flex-col h-full p-10 justify-between">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-auto">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur shadow-md">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">BuildrAI</span>
          </Link>

          {/* Hero text */}
          <div className="my-12">
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight">
              AI for Canadian<br />
              <span className="text-brand-200">contractors</span>
            </h2>
            <p className="text-brand-200 mt-4 text-sm font-medium leading-relaxed">
              Precise takeoffs, protective contracts, OHS safety records, and timely prompt payments — all unified in one premium system.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5 mb-12">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10 shadow-inner">
                  {f.icon}
                </div>
                <div>
                  <p className="font-bold text-sm tracking-wide">{f.title}</p>
                  <p className="text-brand-300 text-xs mt-1 leading-relaxed font-semibold">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-brand-300 text-[10px] font-bold uppercase tracking-widest">
              Free Forever · No Credit Card · Hosted in Canada
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile header */}
        <header className="lg:hidden p-5 border-b border-gray-100/50 bg-white">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-md">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">BuildrAI</span>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
