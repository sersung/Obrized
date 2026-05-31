import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/estimating(.*)",
  "/contracts(.*)",
  "/safety(.*)",
  "/scheduling(.*)",
  "/payments(.*)",
  "/settings(.*)",
]);

const isClerkConfigured = !!process.env.CLERK_SECRET_KEY;

export default isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : async (req: any, ev: any) => {
      // Bypass/no-op middleware when Clerk keys are missing
      return;
    };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
