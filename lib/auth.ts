import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// In-memory user store — for demo. Replace with a real DB (Supabase, Planetscale, etc.)
export type AppUser = {
  id: string;
  email: string;
  name: string;
  company: string;
  passwordHash: string;
};

// Seed one demo account — always available
const DEMO_HASH = bcrypt.hashSync("buildr2025", 10);
const users: AppUser[] = [
  {
    id: "demo-1",
    email: "demo@buildr.ai",
    name: "Demo User",
    company: "BuildrAI Demo",
    passwordHash: DEMO_HASH,
  },
];

export function getUserByEmail(email: string) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function createUser(
  email: string,
  password: string,
  name: string,
  company: string
): AppUser | null {
  if (getUserByEmail(email)) return null; // already exists
  const user: AppUser = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    name,
    company,
    passwordHash: bcrypt.hashSync(password, 10),
  };
  users.push(user);
  return user;
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
        const user = getUserByEmail(credentials.email);
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, company: user.company } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.company = (user as any).company;
      }
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
