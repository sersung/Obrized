import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Obrized | AI Construction Co-Pilot",
  description:
    "Learn how Obrized collects, uses, and protects your construction data. PIPEDA-compliant privacy practices for Canadian builders.",
  openGraph: {
    title: "Privacy Policy — Obrized",
    description:
      "Learn how Obrized collects, uses, and protects your construction data. PIPEDA-compliant privacy practices for Canadian builders.",
    url: "https://obrized.com/privacy",
    siteName: "Obrized",
    locale: "en_CA",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "information-collected",
      title: "1. Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an Obrized account, we collect your name, email address, company name, phone number, and billing information. For team accounts, we may also collect role designations and permission levels.",
        },
        {
          subtitle: "Construction Data",
          text: "Through your use of the platform, you may upload or generate construction-specific data including: blueprint files and architectural drawings, quantity takeoff calculations and estimates, project schedules and Gantt chart data, bid proposals and cost breakdowns, material lists and supplier information.",
        },
        {
          subtitle: "Contract & Compliance Data",
          text: "Obrized processes CCDC contract documents for AI-powered risk audits, Construction Act Prompt Payment tracking records, lien and holdback calculations, and change order documentation.",
        },
        {
          subtitle: "Safety & Field Logs",
          text: "The platform collects WSIB/WorkSafeBC daily safety log entries, toolbox talk records, incident and near-miss reports, site inspection checklists, COR audit documentation, and voice-recorded daily field reports processed through our AI transcription service.",
        },
        {
          subtitle: "Usage & Technical Data",
          text: "We automatically collect browser type and version, device information and screen resolution, IP address and approximate geographic location, pages visited and features used, session duration and interaction patterns, and error logs for debugging purposes.",
        },
      ],
    },
    {
      id: "how-we-use",
      title: "2. How We Use Your Information",
      content: [
        {
          subtitle: null,
          text: "Obrized uses the collected information to: provide and maintain our AI-powered construction management services; perform AI quantity takeoff analysis on uploaded blueprints using Google Gemini AI; generate CCDC contract risk audit reports; track Prompt Payment compliance deadlines under the Construction Act; generate safety compliance reports and WSIB/WorkSafeBC documentation; improve our AI models and algorithms (using anonymized, aggregated data only); process payments and manage subscriptions; send service-related notifications and updates; provide customer support and respond to inquiries; comply with legal obligations under Canadian law.",
        },
      ],
    },
    {
      id: "pipeda-compliance",
      title: "3. PIPEDA Compliance",
      content: [
        {
          subtitle: null,
          text: "Obrized is committed to complying with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA). We adhere to the ten fair information principles outlined in PIPEDA:",
        },
        {
          subtitle: "Accountability",
          text: "Obrized has designated a Privacy Officer responsible for compliance with this policy. You may contact our Privacy Officer at privacy@obrized.com.",
        },
        {
          subtitle: "Identifying Purposes",
          text: "We identify the purposes for which personal information is collected at or before the time of collection, as described in Section 2 of this policy.",
        },
        {
          subtitle: "Consent",
          text: "We obtain meaningful consent for the collection, use, and disclosure of personal information. By creating an account and using our services, you consent to the practices described in this policy.",
        },
        {
          subtitle: "Limiting Collection & Use",
          text: "We collect only the personal information necessary for the identified purposes. Information is not used or disclosed for purposes other than those for which it was collected, except with consent or as required by law.",
        },
        {
          subtitle: "Accuracy & Safeguards",
          text: "We take reasonable steps to ensure personal information is accurate, complete, and up-to-date. We protect personal information with security safeguards appropriate to the sensitivity of the data, including encryption and access controls.",
        },
      ],
    },
    {
      id: "data-retention",
      title: "4. Data Retention",
      content: [
        {
          subtitle: "Active Account Data",
          text: "We retain your personal information and construction data for as long as your account remains active and as needed to provide you with our services.",
        },
        {
          subtitle: "After Account Closure",
          text: "Upon account deletion request, we will delete or anonymize your personal information within 30 days. Construction project data and documents will be made available for export for 90 days following a deletion request before permanent removal.",
        },
        {
          subtitle: "Legal Retention Requirements",
          text: "Certain data may be retained longer to comply with legal obligations, including tax and financial records (7 years as required by CRA), construction safety records (as required by provincial workplace safety legislation), and audit trails required under the Construction Act.",
        },
        {
          subtitle: "Backup Data",
          text: "Backup copies of data may persist in our secure backup systems for up to 30 days after deletion from primary systems.",
        },
      ],
    },
    {
      id: "user-rights",
      title: "5. Your Rights",
      content: [
        {
          subtitle: null,
          text: "Under PIPEDA and applicable Canadian privacy legislation, you have the right to: access your personal information held by Obrized; request correction of inaccurate personal information; withdraw consent for data collection (subject to legal obligations); request deletion of your personal information; export your construction data in standard formats (CSV, PDF); lodge a complaint with the Office of the Privacy Commissioner of Canada. To exercise any of these rights, please contact us at privacy@obrized.com. We will respond to all legitimate requests within 30 days.",
        },
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies & Tracking Technologies",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "Required for authentication, session management, and security. These cannot be disabled while using the platform.",
        },
        {
          subtitle: "Analytics Cookies",
          text: "We use privacy-respecting analytics to understand how users interact with our platform. We do not sell analytics data to third parties.",
        },
        {
          subtitle: "Preference Cookies",
          text: "Store your language preference, dashboard layout choices, and notification settings for a personalized experience.",
        },
      ],
    },
    {
      id: "third-party-services",
      title: "7. Third-Party Services",
      content: [
        {
          subtitle: "Stripe (Payment Processing)",
          text: "We use Stripe to process subscription payments. Stripe collects and processes your payment card information directly; Obrized does not store your full card number. Stripe's handling of your data is governed by the Stripe Privacy Policy and Stripe is PCI-DSS Level 1 certified.",
        },
        {
          subtitle: "Supabase (Database & Authentication)",
          text: "Our application data is stored on Supabase infrastructure. Supabase provides database hosting, user authentication services, and real-time data synchronization. Data is encrypted at rest and in transit.",
        },
        {
          subtitle: "Google Gemini AI (AI Processing)",
          text: "We use Google's Gemini AI models to power our blueprint analysis, contract risk auditing, and intelligent scheduling features. When you upload a blueprint or document for AI analysis, the content is sent to Google's Gemini API for processing. Google does not use your data to train their models when accessed through API. All AI processing is subject to Google's Cloud Data Processing Addendum and data is encrypted in transit.",
        },
      ],
    },
    {
      id: "data-transfers",
      title: "8. International Data Transfers",
      content: [
        {
          subtitle: null,
          text: "Obrized primarily stores data within Canadian and North American data centres. Where data processing requires transfer outside Canada (such as AI processing via Google Cloud), we ensure appropriate safeguards are in place, including contractual data protection clauses and compliance with PIPEDA cross-border transfer requirements. We offer Canadian data residency options for enterprise customers requiring data to remain exclusively within Canadian borders.",
        },
      ],
    },
    {
      id: "changes",
      title: "9. Changes to This Policy",
      content: [
        {
          subtitle: null,
          text: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of any material changes by email and/or a prominent notice on our platform at least 30 days before the changes take effect. Your continued use of Obrized after the effective date constitutes acceptance of the updated policy.",
        },
      ],
    },
    {
      id: "contact",
      title: "10. Contact Us",
      content: [
        {
          subtitle: null,
          text: "If you have any questions about this Privacy Policy or our data practices, please contact us at: privacy@obrized.com. For formal privacy complaints, you may also contact the Office of the Privacy Commissioner of Canada at www.priv.gc.ca.",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Decorative gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-amber-500/[0.03] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-500/[0.03] blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/60">
          <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <Link
              href="/"
              className="font-display text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
            >
              Obrized
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Last updated: June 2026
              </p>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed max-w-2xl text-base">
            At Obrized, we are committed to protecting the privacy of Canadian
            builders, contractors, and construction professionals. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our AI-powered construction management
            platform.
          </p>
        </section>

        {/* Table of Contents */}
        <nav className="max-w-4xl mx-auto px-6 pb-12">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              Table of Contents
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-slate-300 hover:text-amber-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-800/40"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Content Sections */}
        <article className="max-w-4xl mx-auto px-6 pb-24 space-y-16">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 pb-3 border-b border-slate-800/60">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.content.map((item, idx) => (
                  <div key={idx}>
                    {item.subtitle && (
                      <h3 className="text-base font-semibold text-amber-400/90 mb-2">
                        {item.subtitle}
                      </h3>
                    )}
                    <p className="text-slate-300 leading-relaxed text-sm">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </article>

        {/* Footer */}
        <footer className="border-t border-slate-800/60">
          <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Obrized. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/security"
                className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                Security
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
