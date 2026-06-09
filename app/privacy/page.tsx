import Link from "next/link";
import { HardHat } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Obrized",
  description: "Privacy Policy for the Obrized AI Construction Co-Pilot platform.",
  alternates: { canonical: "https://obrized.com/privacy" },
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: January 1, 2026</p>
        </div>

        {[
          {
            title: "1. Information We Collect",
            body: "We collect information you provide when creating an account (name, email, company name, province), information generated through your use of the Service (blueprints uploaded, contracts analyzed, safety logs created), and standard usage data (pages visited, features used, device type). We do not sell your personal information to third parties.",
          },
          {
            title: "2. How We Use Your Information",
            body: "We use your information to provide and improve the Service, process payments, send product updates and support communications (with your consent), and comply with legal obligations. AI analysis results are used to improve model accuracy only in anonymized, aggregated form.",
          },
          {
            title: "3. Data Storage and Security",
            body: "All data is stored on Canadian servers (Ontario region) in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA). We use encryption in transit (TLS 1.3) and at rest (AES-256). Blueprints and project files are stored in isolated, access-controlled environments.",
          },
          {
            title: "4. Data Sharing",
            body: "We share your data only with: (a) service providers necessary to operate the platform (payment processors, cloud infrastructure) under strict data processing agreements; (b) law enforcement when required by Canadian law; (c) with your explicit consent for any other purpose. We do not share your blueprints, contracts, or safety records with any third party for commercial purposes.",
          },
          {
            title: "5. Cookies and Tracking",
            body: "We use cookies to maintain your session, remember your language preference, and analyze platform usage. We use Google Analytics 4 to understand aggregate usage patterns. You can disable cookies in your browser settings, though this may affect platform functionality.",
          },
          {
            title: "6. Your Rights (PIPEDA)",
            body: "Under PIPEDA, you have the right to: access the personal information we hold about you; correct inaccurate information; withdraw consent for non-essential data use; and request deletion of your account and associated data. To exercise these rights, contact privacy@obrized.com.",
          },
          {
            title: "7. Data Retention",
            body: "We retain your account data for the duration of your subscription plus 90 days after cancellation, unless you request earlier deletion. Blueprint files and analysis results are retained for 12 months. Safety logs are retained for 36 months to support potential audits.",
          },
          {
            title: "8. Children's Privacy",
            body: "The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors.",
          },
          {
            title: "9. Changes to This Policy",
            body: "We may update this Privacy Policy from time to time. We will notify you of material changes by email or through a prominent notice in the platform at least 30 days before the change takes effect.",
          },
          {
            title: "10. Contact",
            body: "For privacy inquiries or to exercise your PIPEDA rights, contact our Privacy Officer at privacy@obrized.com or write to: Obrized, Privacy Officer, Toronto, Ontario, Canada.",
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
