import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/providers";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "Obrized — AI Construction Co-Pilot for Canadian Builders",
  description:
    "Engineered specifically for Canadian local laws. Automate blueprints quantity takeoffs, CCDC contract risk audits, WSIB/WorkSafeBC safety logs, and Construction Act Prompt Payment tracking.",
  keywords: [
    "Obrized",
    "Obrized construction AI",
    "Canadian construction software",
    "AI quantity takeoff software Canada",
    "construction estimating software Canada",
    "blueprint quantity takeoff automation",
    "CCDC contract review software",
    "CCDC-2 risk audit tool",
    "WSIB safety log app Ontario",
    "WorkSafeBC COR audit checklist",
    "construction site daily log app",
    "Canada Construction Act Prompt Payment tracker",
    "construction payment tracker Ontario",
    "construction scheduling software Gantt",
    "NBC National Building Code compliance checker",
    "construction software for Canadian builders",
    "construction management app Ontario",
    "construction app British Columbia",
    "CDAP grant eligible software",
    "AI construction co-pilot",
    "Procore alternative Canada",
    "Buildertrend alternative Canada",
    "construction AI tool",
    "AI estimating tool general contractor",
    "AI Quantity Takeoff tool",
    "Canadian Builders Estimating App",
  ],
  authors: [{ name: "Obrized team", url: "https://obrized.com" }],
  metadataBase: new URL("https://obrized.com"),
  openGraph: {
    title: "Obrized — AI Construction Co-Pilot for Canadian Builders",
    description:
      "Automate blueprints quantity takeoffs, CCDC contract risk audits, WSIB/WorkSafeBC daily logs, and Prompt Payment tracking in a single, cohesive system.",
    url: "https://obrized.com",
    siteName: "Obrized",
    images: [
      {
        url: "https://obrized.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Obrized — AI Construction Co-Pilot for Canadian Builders",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obrized — AI Construction Co-Pilot",
    description:
      "Engineered specifically for Canadian local laws. Automate takeoff estimates, CCDC contracts, and WSIB safety compliance.",
    images: ["https://obrized.com/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Obrized",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://obrized.com",
  description:
    "AI-powered construction co-pilot engineered specifically for Canadian local laws — automating quantity takeoffs, CCDC contract audits, WSIB safety logs, and Prompt Payment compliance.",
  inLanguage: ["en-CA", "fr-CA"],
  author: {
    "@type": "Organization",
    name: "Obrized",
    url: "https://obrized.com",
    logo: "https://obrized.com/og-image.png",
    sameAs: ["https://obrized.com"],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "47",
    reviewCount: "47",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "CAD",
      description:
        "3 AI blueprint analyses, 2 active projects, CCDC templates, basic WSIB safety logs.",
    },
    {
      "@type": "Offer",
      name: "Starter Plan",
      price: "79",
      priceCurrency: "CAD",
      description:
        "10 active projects, 30 AI blueprint analyses/month, Gantt scheduling, WSIB compliance templates.",
    },
    {
      "@type": "Offer",
      name: "Pro Plan",
      price: "189",
      priceCurrency: "CAD",
      description:
        "Unlimited projects and AI takeoffs, voice logs, NBC compliance checks, QuickBooks/Xero integration.",
    },
  ],
  featureList: [
    "AI Quantity Takeoff from Blueprints",
    "CCDC Contract Risk Audit",
    "WSIB / WorkSafeBC Safety Logs",
    "Construction Act Prompt Payment Tracking",
    "Gantt Scheduling with Critical Path",
    "CDAP Funding Eligibility Guide",
    "NBC 2025 Building Code Compliance",
    "Voice AI Daily Field Reports",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* viewport — explicit tag ensures mobile browsers render at device width */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="canonical" href="https://obrized.com" />
      </head>
      <body className="antialiased font-sans">
        <Script
          id="json-ld-software"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
