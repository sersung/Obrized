import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase";
import type { Profile } from "./supabase";

export async function getUserByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  company: string
): Promise<Profile | null> {
  const existing = await getUserByEmail(email);
  if (existing) return null;

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("profiles")
    .insert({ email: email.toLowerCase(), name, company, password_hash, provider: "credentials" })
    .select()
    .single();

  if (error || !data) return null;
  return data as Profile;
}

async function upsertOAuthUser(
  email: string,
  name: string,
  avatar_url: string | null | undefined,
  provider: string
): Promise<Profile | null> {
  const existing = await getUserByEmail(email);
  if (existing) {
    // Update avatar if changed
    if (avatar_url && existing.avatar_url !== avatar_url) {
      await supabase
        .from("profiles")
        .update({ avatar_url, name })
        .eq("email", email.toLowerCase());
    }
    return existing;
  }
  // First-time OAuth login — create profile
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      email: email.toLowerCase(),
      name: name ?? "Usuário",
      company: "",
      password_hash: "",
      provider,
      avatar_url: avatar_url ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return data as Profile;
}

const providers = [];

// Google OAuth (optional — only added when env vars are set)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account" } },
    })
  );
}

// GitHub OAuth (optional — only added when env vars are set)
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

// Always include email/password
providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await getUserByEmail(credentials.email);
      if (!user || !user.password_hash) return null;
      const valid = await bcrypt.compare(credentials.password, user.password_hash);
      if (!valid) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar_url ?? null,
        company: user.company,
      } as any;
    },
  })
);

export const authOptions: AuthOptions = {
  providers: providers as any,

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, provision the user in Supabase on first login
      if (account?.provider && account.provider !== "credentials") {
        if (!user.email) return false;
        await upsertOAuthUser(
          user.email,
          user.name ?? "Usuário",
          user.image,
          account.provider
        );
      }
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.company = (user as any).company ?? "";
        token.picture = user.image ?? null;
      }
      // On OAuth sign-in, fetch company from DB (may be empty for new users)
      if (account?.provider && account.provider !== "credentials" && token.email) {
        const profile = await getUserByEmail(token.email as string);
        token.company = profile?.company ?? "";
        token.picture = profile?.avatar_url ?? token.picture ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).company = token.company;
        (session.user as any).image = token.picture ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
