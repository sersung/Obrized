import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Obrized — AI Construction Co-Pilot for Canadian Builders",
  description:
    "Engineered specifically for Canadian local laws. Automate blueprints quantity takeoffs, CCDC contract risk audits, WSIB/WorkSafeBC safety logs, and Construction Act Prompt Payment tracking.",
  keywords: [
    // Brand / Core
    "Obrized",
    "Obrized construction AI",
    "Canadian construction software",
    // Feature-specific long-tail
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
    // Location + audience
    "construction software for Canadian builders",
    "construction management app Ontario",
    "construction app British Columbia",
    "CDAP grant eligible software",
    "AI construction co-pilot",
    // Tech-savvy / competitive keywords
    "Procore alternative Canada",
    "Buildertrend alternative Canada",
    "construction AI tool",
    "AI estimating tool general contractor",
    "AI Quantity Takeoff tool",
    "Canadian Builders Estimating App"
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

// JSON-LD Structured Data for Google Rich Snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Obrized",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://obrized.com",
  "description": "AI-powered construction co-pilot engineered specifically for Canadian local laws — automating quantity takeoffs, CCDC contract audits, WSIB safety logs, and Prompt Payment compliance.",
  "inLanguage": ["en-CA", "fr-CA"],
  "author": {
    "@type": "Organization",
    "name": "Obrized",
    "url": "https://obrized.com",
    "logo": "https://obrized.com/og-image.png",
    "sameAs": ["https://obrized.com"]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "47",
    "reviewCount": "47"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Plan",
      "price": "0",
      "priceCurrency": "CAD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "0",
        "priceCurrency": "CAD",
        "unitCode": "MON"
      },
      "description": "3 AI blueprint analyses, 2 active projects, CCDC templates, basic WSIB safety logs."
    },
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "79",
      "priceCurrency": "CAD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "79",
        "priceCurrency": "CAD",
        "unitCode": "MON"
      },
      "description": "10 active projects, 30 AI blueprint analyses/month, Gantt scheduling, WSIB compliance templates."
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "price": "189",
      "priceCurrency": "CAD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "189",
        "priceCurrency": "CAD",
        "unitCode": "MON"
      },
      "description": "Unlimited projects and AI takeoffs, voice logs, NBC compliance checks, QuickBooks/Xero integration."
    }
  ],
  "featureList": [
    "AI Quantity Takeoff from Blueprints",
    "CCDC Contract Risk Audit",
    "WSIB / WorkSafeBC Safety Logs",
    "Construction Act Prompt Payment Tracking",
    "Gantt Scheduling with Critical Path",
    "CDAP Funding Eligibility Guide",
    "NBC 2025 Building Code Compliance",
    "Voice AI Daily Field Reports"
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Performance: Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://q.stripe.com" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://obrized.com" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#020617" />
        <meta name="color-scheme" content="dark" />
        
        {/* Google Fonts preload for Outfit (display font) */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* JSON-LD Structured Data */}
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
