import Link from 'next/link';
import { ArrowLeft, Lock, Server, CreditCard, Users, RefreshCw, FileCheck, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Segurança e Conformidade | Obrized',
  description: 'Conheça nossos padrões de segurança, infraestrutura e conformidade.',
};

export default function SecurityPage() {
  const features = [
    {
      icon: Lock,
      title: 'Criptografia de Ponta',
      description: 'Todos os dados são criptografados em trânsito com TLS 1.3 e em repouso com AES-256, garantindo a proteção máxima de suas informações.'
    },
    {
      icon: Server,
      title: 'Infraestrutura em Nuvem',
      description: 'Hospedado no GCP e Supabase com residência de dados no Canadá, garantindo baixa latência e conformidade local.'
    },
    {
      icon: CreditCard,
      title: 'Segurança de Pagamentos',
      description: 'Transações processadas de forma segura através da Stripe, com total conformidade ao padrão PCI-DSS nível 1.'
    },
    {
      icon: Users,
      title: 'Controle de Acesso',
      description: 'Gerenciamento rigoroso de sessões e Controle de Acesso Baseado em Funções (RBAC) para garantir que apenas pessoas autorizadas vejam seus dados.'
    },
    {
      icon: RefreshCw,
      title: 'Backup & Recuperação',
      description: 'Backups diários automatizados com retenção de 30 dias e planos robustos de recuperação de desastres (DR).'
    },
    {
      icon: FileCheck,
      title: 'Conformidade',
      description: 'Projetado em conformidade com as leis canadenses PIPEDA e Construction Act, respeitando a privacidade e os regulamentos do setor.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-amber-500/30">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center text-amber-500 hover:text-amber-400 transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar para o início
        </Link>
        
        <header className="mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-2xl mb-8 ring-1 ring-amber-500/20">
            <ShieldCheck className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-100 mb-6 tracking-tight">Segurança e Conformidade</h1>
          <p className="text-slate-400 text-xl leading-relaxed">
            A segurança dos dados da sua construtora é nossa prioridade número um. Construímos o Obrized com arquitetura de nível empresarial para garantir tranquilidade total.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {features.map((feature, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:bg-slate-900 transition-colors hover:border-amber-500/30 group">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <section className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl font-bold text-slate-100 mb-6">Pronto para construir com segurança?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Junte-se às construtoras canadenses que confiam no Obrized para gerenciar suas operações diárias com segurança de ponta.
          </p>
          <Link href="/register" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]">
            Comece Gratuitamente
          </Link>
        </section>
      </div>
    </div>
  );
}
