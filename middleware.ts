import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/estimating/:path*",
    "/contracts/:path*",
    "/safety/:path*",
    "/scheduling/:path*",
    "/payments/:path*",
  ],
};
