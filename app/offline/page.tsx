"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-6">
        <WifiOff className="w-8 h-8 text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sem conexão</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        Verifique sua internet e tente novamente. Seus dados locais estão
        seguros.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Tentar novamente
      </button>
    </div>
  );
}
