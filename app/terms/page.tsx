import Link from 'next/link';
import { FileText, Scale, Shield, Database, CreditCard, Activity, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Termos de Serviço | Obrized',
  description: 'Termos de Serviço e condições de uso da plataforma Obrized.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center text-amber-500 hover:text-amber-400 transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar para o início
        </Link>
        
        <header className="mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-xl mb-6">
            <FileText className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6 tracking-tight">Termos de Serviço</h1>
          <p className="text-slate-400 text-lg">Última atualização: Junho de 2026</p>
        </header>

        <div className="space-y-12 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-100">
              <Scale className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">1. Uso Aceitável</h2>
            </div>
            <p>Ao utilizar o Obrized, você concorda em usar nossa plataforma exclusivamente para o gerenciamento lícito de projetos de construção, equipes e finanças. É estritamente proibido o uso da plataforma para atividades ilegais, violação de direitos de terceiros ou distribuição de código malicioso.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-100">
              <Shield className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">2. Responsabilidades da Conta</h2>
            </div>
            <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrem sob sua conta. O Obrized deve ser notificado imediatamente sobre qualquer uso não autorizado de sua conta.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-100">
              <FileText className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">3. Propriedade Intelectual</h2>
            </div>
            <p>A plataforma Obrized, incluindo seu código, design e marca, é de propriedade exclusiva de nossa empresa. Concedemos a você uma licença limitada, não exclusiva e intransferível para acessar e usar o software durante o período de assinatura.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-100">
              <Activity className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">4. Disponibilidade do Serviço</h2>
            </div>
            <p>Esforçamo-nos para manter o Obrized disponível 99,9% do tempo. No entanto, não garantimos serviço ininterrupto. Manutenções programadas serão comunicadas com antecedência sempre que possível.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-100">
              <CreditCard className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">5. Assinatura e Faturamento</h2>
            </div>
            <p>Os serviços são cobrados com base na assinatura escolhida. Pagamentos não são reembolsáveis, exceto quando exigido por lei. Nos reservamos o direito de suspender o acesso caso o pagamento não seja efetuado.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-100">
              <Database className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">6. Propriedade dos Dados</h2>
            </div>
            <p>Você retém todos os direitos e propriedade sobre os dados de construção inseridos na plataforma. O Obrized apenas processa esses dados para fornecer o serviço a você. Não vendemos ou compartilhamos seus dados com terceiros não autorizados.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-100">
              <Scale className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">7. Lei Aplicável</h2>
            </div>
            <p>Estes termos são regidos pelas leis da província de Ontário e pelas leis federais do Canadá aplicáveis. Qualquer disputa será resolvida nos tribunais localizados em Ontário, Canadá.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
