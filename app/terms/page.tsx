import Link from "next/link";
import { HardHat } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Obrized",
  description: "Terms of Service for the Obrized AI Construction Co-Pilot platform.",
  alternates: { canonical: "https://obrized.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <HardHat className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-extrabold text-white text-lg font-display">Obrized</span>
          </Link>
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div>
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-4">Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: January 1, 2026</p>
        </div>

        {[
          {
            title: "1. Acceptance of Terms",
            body: "By accessing or using the Obrized platform (\"Service\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. These terms govern your use of all features including AI quantity takeoff, CCDC contract analysis, WSIB safety logs, and Prompt Payment tracking.",
          },
          {
            title: "2. Description of Service",
            body: "Obrized provides an AI-powered construction management platform designed for Canadian contractors. The Service includes tools for blueprint quantity takeoff analysis, CCDC contract risk auditing, safety compliance logging, Gantt scheduling, and Construction Act Prompt Payment tracking. The Service is provided for informational and operational assistance purposes only and does not constitute legal advice.",
          },
          {
            title: "3. User Accounts",
            body: "You must create an account to access the Service. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. You must provide accurate and complete information when creating your account and must update it to keep it current.",
          },
          {
            title: "4. Subscription Plans and Billing",
            body: "Obrized offers Free, Starter ($79 CAD/mo), and Pro ($189 CAD/mo) subscription plans. Annual subscriptions are billed upfront and include approximately 15% discount. All prices are in Canadian dollars and subject to applicable taxes. Subscriptions renew automatically unless cancelled before the renewal date.",
          },
          {
            title: "5. AI Output Disclaimer",
            body: "AI-generated outputs — including takeoff estimates, contract risk flags, safety reports, and schedule recommendations — are provided as tools to assist your work, not as professional engineering, legal, or financial advice. You remain solely responsible for reviewing, validating, and acting on any AI-generated content. Always consult qualified professionals for legal or regulatory compliance matters.",
          },
          {
            title: "6. Data and Privacy",
            body: "Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of information as described therein. All data is stored on Canadian servers in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA).",
          },
          {
            title: "7. Intellectual Property",
            body: "The Service, including all software, content, and AI models, is the exclusive property of Obrized and its licensors. You are granted a limited, non-exclusive, non-transferable license to use the Service during your subscription term. You may not copy, modify, or distribute any part of the Service.",
          },
          {
            title: "8. Limitation of Liability",
            body: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, OBRIZED SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. Obrized's total liability shall not exceed the amount paid by you in the twelve months preceding the claim.",
          },
          {
            title: "9. Governing Law",
            body: "These Terms shall be governed by the laws of the Province of Ontario, Canada, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Ontario.",
          },
          {
            title: "10. Contact",
            body: "For questions about these Terms, please contact us at legal@obrized.com.",
          },
        ].map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg font-bold text-white">{section.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
