"use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    // Client-side mock will automatically authorize the demo user
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  // Check if Clerk is configured with environment variables
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="w-full max-w-md animate-fade-in flex flex-col items-center justify-center space-y-4">
      {isClerkConfigured ? (
        <div className="w-full flex flex-col items-center space-y-4">
          <SignIn
            routing="hash"
            signUpUrl="/register"
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
              <p className="text-[10px] text-brand-600 font-semibold mt-0.5">Test all features instantly with a single click</p>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="text-[10px] font-bold uppercase tracking-wide text-brand-700 bg-white border border-brand-200 px-3.5 py-1.75 rounded-lg hover:bg-brand-100 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <LogIn className="w-3 h-3" />
              {loading ? "Logging in..." : "Demo Login"}
            </button>
          </div>
        </div>
      ) : (
        // Standard Failsafe / Offline Mode card
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden w-full">
          <div className="px-8 pt-8 pb-6 border-b border-gray-50 text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">BuildrAI Login</h1>
            <p className="text-xs text-gray-400 font-semibold mt-1">Platform in Offline / Demo Mode</p>
          </div>

          <div className="px-8 py-8 space-y-6">
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 shadow-inner space-y-3">
              <p className="text-xs font-bold text-brand-850">Demo Credentials</p>
              <p className="text-[10px] text-brand-600 font-semibold">Use this account to test all features instantly, including quantity takeoffs, CCDC analysis, and invoice tracking.</p>
              <div className="text-[10px] bg-white border border-brand-200 rounded-xl p-3 font-semibold space-y-1 text-gray-700">
                <p>E-mail: <span className="font-bold text-brand-700">john.carter@jcconstruction.ca</span></p>
                <p>Password: <span className="font-bold text-brand-700">password123</span></p>
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all duration-200 shadow-md shadow-brand-600/10 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Entering Dashboard..." : "Log In with Demo Credentials"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
