import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "BuildrAI — Plataforma de IA para Construtores Canadenses",
  description:
    "Orçamentos precisos, análise de contratos, segurança no canteiro e conformidade com Prompt Payment — tudo em um só lugar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
