import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/clients(.*)",
    "/jobs(.*)",
    "/team(.*)",
    "/estimating(.*)",
    "/quotes(.*)",
    "/payments(.*)",
    "/contracts(.*)",
    "/safety(.*)",
    "/scheduling(.*)",
    "/reports(.*)",
    "/settings(.*)",
  ],
};
