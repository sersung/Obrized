import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export type Profile = {
  id: string;
  email: string;
  name: string;
  company: string;
  avatar_url: string | null;
  created_at: string;
};

// Mock NextAuth options to prevent type check errors
export const authOptions = {};

// Server-side session retrieval using Clerk
export async function getServerSession(options?: any): Promise<any> {
  try {
    // Check if client-side bypass is enabled via cookies
    const cookieStore = cookies();
    const demoBypass = (cookieStore instanceof Promise ? await cookieStore : cookieStore).get("obrized_demo_bypass")?.value === "true";
    if (demoBypass) {
      return {
        user: {
          id: "1",
          email: "john.carter@jcconstruction.ca",
          name: "John Carter",
          image: null,
          company: "JC Construction Ltd.",
        }
      };
    }
  } catch (e) {
    // Ignore and proceed
  }

  try {
    const user = await currentUser();
    if (!user) return null;

    return {
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        image: user.imageUrl || null,
        company: (user.publicMetadata as any)?.company || "JC Construction Ltd.",
      }
    };
  } catch (e) {
    // Failsafe local demo user session for offline development
    return {
      user: {
        id: "1",
        email: "john.carter@jcconstruction.ca",
        name: "John Carter",
        image: null,
        company: "JC Construction Ltd.",
      }
    };
  }
}
