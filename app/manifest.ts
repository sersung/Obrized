import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Obrized — AI Construction Co-Pilot",
    short_name: "Obrized",
    description:
      "AI-powered construction co-pilot for Canadian builders — takeoffs, CCDC contracts, WSIB logs, and Prompt Payment tracking.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#020617",
    theme_color: "#2563eb",
    lang: "en-CA",
    categories: ["business", "productivity"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New Estimate",
        short_name: "Estimate",
        url: "/estimating/new",
        description: "Start a new AI quantity takeoff",
      },
      {
        name: "Daily Safety Log",
        short_name: "Safety Log",
        url: "/safety/new",
        description: "Create a new WSIB safety log",
      },
    ],
  };
}
