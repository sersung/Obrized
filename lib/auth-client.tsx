"use client";

import { useUser, useClerk } from "@clerk/nextjs";

export function useSession() {
  let user: any = null;
  let isLoaded = false;
  let isSignedIn = false;

  try {
    const clerkUser = useUser();
    user = clerkUser.user;
    isLoaded = clerkUser.isLoaded;
    isSignedIn = !!clerkUser.isSignedIn;
  } catch (e) {
    // Failsafe demo mode if Clerk is unconfigured in development/offline
    return {
      data: {
        user: {
          id: "1",
          email: "john.carter@jcconstruction.ca",
          name: "John Carter",
          image: null,
          company: "JC Construction Ltd.",
        }
      },
      status: "authenticated" as const,
    };
  }

  if (!isLoaded) {
    return {
      data: null,
      status: "loading" as const,
    };
  }

  if (!isSignedIn) {
    // If Clerk is loaded but user is not logged in, return unauthenticated
    return {
      data: null,
      status: "unauthenticated" as const,
    };
  }

  return {
    data: {
      user: {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "User",
        image: user.imageUrl || null,
        company: (user.publicMetadata as any)?.company || "JC Construction Ltd.",
      }
    },
    status: "authenticated" as const,
  };
}

export function signOut(options?: { callbackUrl?: string }) {
  try {
    const { signOut: clerkSignOut } = useClerk();
    clerkSignOut().then(() => {
      window.location.href = options?.callbackUrl || "/login";
    });
  } catch (e) {
    window.location.href = options?.callbackUrl || "/login";
  }
}

export async function signIn(provider?: string, options?: any) {
  try {
    const { openSignIn } = useClerk();
    openSignIn();
  } catch (e) {
    // Bypass for offline test login
    window.location.href = "/dashboard";
  }
}
