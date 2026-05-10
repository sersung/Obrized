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
} from "lucide-react";

const features = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Orçamentação com IA",
    description:
      "Faça upload de plantas e a IA extrai quantitativos automaticamente, vinculando a preços de materiais em tempo real.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Análise de Contratos CCDC",
    description:
      "Identifique cláusulas de alto risco em contratos CCDC e receba sugestões de redação para proteger sua empresa.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: <HardHat className="w-6 h-6" />,
    title: "Segurança no Canteiro",
    description:
      "Gere relatórios diários por voz. A IA estrutura, classifica riscos e mantém conformidade com WSIB/WorkSafeBC.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Cronograma Preditivo",
    description:
      "Quando há atrasos, a IA recalcula todo o cronograma com base nos recursos disponíveis e caminho crítico.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Prompt Payment (ON/BC)",
    description:
      "Gere faturas adequadas automaticamente. Rastreie o relógio de 28 dias e documentos WSIB/lien waivers.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Dashboard Unificado",
    description:
      "Visão completa de todos os projetos, alertas de conformidade, KPIs financeiros e status de pagamentos.",
    color: "bg-teal-50 text-teal-600",
  },
];

const stats = [
  { label: "Redução no tempo de orçamentação", value: "80%" },
  { label: "PMEs de construção no Canadá", value: "99.9%" },
  { label: "Custo burocracia/ano no Canadá", value: "$51B" },
  { label: "Trabalhadores a contratar até 2034", value: "380k" },
];

const painPoints = [
  "Orçamentos manuais em Excel levam dias e têm erros custosos",
  "Contratos CCDC assinados sem revisão jurídica adequada",
  "10–15 horas/semana preenchendo relatórios de segurança à mão",
  "Fluxo de caixa travado por faturas incorretas e atrasos de pagamento",
  "Cronogramas colapsam no primeiro imprevisto sem recalculação",
  "Legislação de Prompt Payment exige documentação perfeita",
];

export default function LandingPage() {
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
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Funcionalidades
            </a>
            <a href="#pain-points" className="hover:text-gray-900 transition-colors">
              Problemas que resolvemos
            </a>
            <a href="#stats" className="hover:text-gray-900 transition-colors">
              Resultados
            </a>
          </nav>
          <Link
            href="/dashboard"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
          >
            Acessar Plataforma <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-brand-100">
          <Zap className="w-4 h-4" />
          Inteligência Artificial para PMEs de Construção no Canadá
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Construa mais.
          <br />
          <span className="text-brand-600">Administre menos.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          A plataforma de IA que resolve os maiores gargalos dos pequenos e médios empreiteiros
          canadenses — orçamentação, contratos, segurança, cronograma e conformidade com Prompt
          Payment em um único sistema.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            Acessar a Plataforma <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Ver funcionalidades
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
                <div className="text-brand-200 text-sm">{stat.label}</div>
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
              Reconhece esses problemas?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              99,9% das empresas de construção no Canadá são PMEs. Todas enfrentam os mesmos
              gargalos estruturais que drenam produtividade e margem.
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
                <span className="text-gray-700 text-sm">{point}</span>
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
              Um assistente digital para todo o projeto
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada módulo ataca diretamente uma dor específica, integrados em uma plataforma
              coesa que acompanha o ciclo completo do projeto.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grants section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-3xl mx-auto">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Financiamento disponível para PMEs canadenses
            </h2>
            <p className="text-gray-600 mb-6">
              O CDAP oferece até <strong>$15.000 em subsídios</strong> e empréstimos a 0% de juros
              via BDC para adoção de tecnologia. O RAII subsidia até <strong>50% dos custos</strong>{" "}
              de implementação de IA para PMEs.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["CDAP", "RAII", "SR&ED Tax Credit", "AI Compute Access Fund"].map((grant) => (
                <span
                  key={grant}
                  className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full border border-green-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
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
            Pronto para multiplicar a capacidade da sua empresa?
          </h2>
          <p className="text-brand-200 mb-8 max-w-xl mx-auto">
            Acesse a plataforma agora e veja como a IA pode transformar a gestão do seu negócio de
            construção.
          </p>
          <Link
            href="/dashboard"
            className="bg-white text-brand-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition-colors inline-flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Acessar a Plataforma
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-700">BuildrAI</span>
          </div>
          <p>Construído para PMEs de construção canadenses. Ontário · BC · Alberta · Québec</p>
        </div>
      </footer>
    </div>
  );
}
