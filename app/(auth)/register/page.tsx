"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDemoBypass = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="w-full max-w-md animate-fade-in flex flex-col items-center justify-center space-y-4">
      {isClerkConfigured ? (
        <div className="w-full flex flex-col items-center space-y-4">
          <SignUp
            routing="hash"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "shadow-sm border border-gray-150 rounded-2xl overflow-hidden bg-white",
              },
            }}
          />

          <div className="w-full bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-inner">
            <div>
              <p className="text-xs font-bold text-brand-850">Demo Bypass Mode</p>
              <p className="text-[10px] text-brand-600 font-semibold mt-0.5">Skip registration and try the platform instantly</p>
            </div>
            <button
              onClick={handleDemoBypass}
              disabled={loading}
              className="text-[10px] font-bold uppercase tracking-wide text-brand-700 bg-white border border-brand-200 px-3.5 py-1.75 rounded-lg hover:bg-brand-100 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {loading ? "Entering..." : "Demo Access"}
            </button>
          </div>
        </div>
      ) : (
        // Standard Failsafe / Offline Mode card
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden w-full">
          <div className="px-8 pt-8 pb-6 border-b border-gray-50 text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-xs text-gray-400 font-semibold mt-1">Platform in Offline / Demo Mode</p>
          </div>

          <div className="px-8 py-8 space-y-6">
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 shadow-inner space-y-3">
              <p className="text-xs font-bold text-brand-850">Demo Credentials Available</p>
              <p className="text-[10px] text-brand-600 font-semibold">Registration is disabled in offline mode. Please use the pre-configured demo account to explore all features instantly.</p>
              <div className="text-[10px] bg-white border border-brand-200 rounded-xl p-3 font-semibold space-y-1 text-gray-700">
                <p>E-mail: <span className="font-bold text-brand-700">john.carter@jcconstruction.ca</span></p>
                <p>Password: <span className="font-bold text-brand-700">password123</span></p>
              </div>
            </div>

            <button
              onClick={handleDemoBypass}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all duration-200 shadow-md shadow-brand-600/10 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Entering Dashboard..." : "Enter Dashboard as Demo User"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
