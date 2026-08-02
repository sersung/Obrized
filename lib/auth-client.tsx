"use client";

import { useCallback } from "react";
import { signOut as nextSignOut } from "next-auth/react";
export { useSession, signOut, signIn } from "next-auth/react";

export function useLogout(callbackUrl = "/login") {
  return useCallback(() => {
    nextSignOut({ callbackUrl });
  }, [callbackUrl]);
}
