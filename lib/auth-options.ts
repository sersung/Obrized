import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabase } from "@/lib/supabase";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (!user?.password_hash) return null;

        const valid = await compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id:      user.id,
          email:   user.email,
          name:    user.name    || "",
          company: user.company || "",
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn:  "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id;
        token.company = (user as any).company ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id      = token.id;
        (session.user as any).company = token.company;
      }
      return session;
    },
  },
};
