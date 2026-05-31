"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useCallback } from "react";

// ─── useSession hook ────────────────────────────────────────────────────────
// Returns current session data, works with and without Clerk configured.
export function useSession() {
  let user: ReturnType<typeof useUser>["user"] = null;
  let isLoaded = false;
  let isSignedIn = false;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const clerkUser = useUser();
    user = clerkUser.user;
    isLoaded = clerkUser.isLoaded;
    isSignedIn = !!clerkUser.isSignedIn;
  } catch {
    // Clerk is not configured — return demo session (offline/dev mode)
    return {
      data: {
        user: {
          id: "1",
          email: "john.carter@jcconstruction.ca",
          name: "John Carter",
          image: null,
          company: "JC Construction Ltd.",
        },
      },
      status: "authenticated" as const,
    };
  }

  if (!isLoaded) {
    return { data: null, status: "loading" as const };
  }

  if (!isSignedIn) {
    return { data: null, status: "unauthenticated" as const };
  }

  return {
    data: {
      user: {
        id: user!.id,
        email: user!.primaryEmailAddress?.emailAddress ?? "",
        name: user!.fullName ?? "User",
        image: user!.imageUrl ?? null,
        company: (user!.publicMetadata as { company?: string })?.company ?? "JC Construction Ltd.",
      },
    },
    status: "authenticated" as const,
  };
}

// ─── useLogout hook ─────────────────────────────────────────────────────────
// Returns a stable logout callback that works with or without Clerk.
// ✅ This is the CORRECT pattern — hooks must live inside components/hooks.
export function useLogout(callbackUrl = "/login") {
  let clerkSignOut: ReturnType<typeof useClerk>["signOut"] | null = null;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const clerk = useClerk();
    clerkSignOut = clerk.signOut;
  } catch {
    // Clerk not available (offline/dev mode)
    clerkSignOut = null;
  }

  const logout = useCallback(async () => {
    if (clerkSignOut) {
      try {
        await clerkSignOut();
        window.location.href = callbackUrl;
        return;
      } catch {
        // fall through to simple redirect
      }
    }
    // Offline/demo mode: just redirect
    window.location.href = callbackUrl;
  }, [clerkSignOut, callbackUrl]);

  return logout;
}

// ─── signOut (legacy - non-hook, only safe if Clerk is NOT configured) ──────
// ⚠️ Deprecated: use useLogout() hook inside components instead.
// Kept for backwards compatibility with any imports that still call it directly.
export function signOut(options?: { callbackUrl?: string }) {
  window.location.href = options?.callbackUrl ?? "/login";
}

// ─── signIn helper ──────────────────────────────────────────────────────────
export async function signIn(_provider?: string, _options?: Record<string, unknown>) {
  // Offline/demo mode fallback
  window.location.href = "/dashboard";
}
