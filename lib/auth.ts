import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export { authOptions };

export type Profile = {
  id: string;
  email: string;
  name: string;
  company: string;
  avatar_url: string | null;
  created_at: string;
};

export async function getServerSession(_options?: any): Promise<any> {
  return nextAuthGetServerSession(authOptions);
}
