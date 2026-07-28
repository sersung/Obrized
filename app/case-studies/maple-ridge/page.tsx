import type { Metadata } from 'next';
import CaseStudyContent from './CaseStudyContent';

export const metadata: Metadata = {
  title:
    'Maple Ridge Construction Case Study — $180K+ Annual Savings | Obrized',
  description:
    'Learn how Maple Ridge Construction, a mid-size General Contractor in Ontario, reduced estimating time by 80%, achieved 95% takeoff accuracy, and saved $180K+ annually with Obrized AI construction software.',
  keywords: [
    'Obrized case study',
    'construction software Canada case study',
    'Maple Ridge Construction',
    'AI quantity takeoff results',
    'construction estimating Ontario',
    'CCDC contract review software',
    'WSIB compliance software',
    'Prompt Payment Act Ontario',
    'construction SaaS Canada',
    'general contractor software Ontario',
    'construction cost savings',
    'construction AI ROI',
    'Canadian construction technology',
    'Obrized customer success',
  ],
  openGraph: {
    title:
      'Maple Ridge Construction Case Study — $180K+ Annual Savings | Obrized',
    description:
      'A mid-size General Contractor in Ontario cut estimating time by 80%, achieved 95% takeoff accuracy, and saved $180K+ annually with Obrized.',
    url: 'https://obrized.com/case-studies/maple-ridge',
    siteName: 'Obrized',
    images: [
      {
        url: 'https://obrized.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Maple Ridge Construction Case Study — Obrized',
      },
    ],
    locale: 'en_CA',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maple Ridge Construction — $180K+ Saved with Obrized',
    description:
      '80% faster estimating, 95% takeoff accuracy, zero WSIB violations. See how Obrized transformed a mid-size Ontario GC.',
    images: ['https://obrized.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://obrized.com/case-studies/maple-ridge',
  },
};

export default function MapleRidgeCaseStudyPage() {
  return <CaseStudyContent />;
}
