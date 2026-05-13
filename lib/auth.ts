import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
    .insert({ email: email.toLowerCase(), name, company, password_hash })
    .select()
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.company = (user as any).company;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).company = token.company;
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
