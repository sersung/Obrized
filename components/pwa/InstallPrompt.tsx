"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Dismissed before
    if (localStorage.getItem("pwa-prompt-dismissed")) return;

    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // iOS: show share instructions
    if (isIOSDevice) {
      setIsIOS(true);
      const timer = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome: listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("pwa-prompt-dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-6 lg:w-80 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-lg">O</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight">
              Instalar Obrized
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Acesso rápido, funciona offline
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          // iOS Safari instructions
          <div className="space-y-2 text-xs text-gray-600">
            <p className="font-semibold text-gray-700">
              Para instalar no iPhone/iPad:
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-[10px]">
                1
              </div>
              <span>
                Toque em{" "}
                <Share className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" />{" "}
                <strong>Compartilhar</strong> no Safari
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-[10px]">
                2
              </div>
              <span>
                Selecione{" "}
                <Plus className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" />{" "}
                <strong>Adicionar à Tela de Início</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-[10px]">
                3
              </div>
              <span>
                Toque em <strong>Adicionar</strong>
              </span>
            </div>
          </div>
        ) : (
          // Android / Chrome install button
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-brand-600/30"
          >
            <Download className="w-4 h-4" />
            Baixar aplicativo
          </button>
        )}
      </div>
    </div>
  );
}
