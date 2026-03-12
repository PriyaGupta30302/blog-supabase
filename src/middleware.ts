import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/", "/blog(.*)", "/admin", "/api/public(.*)", "/sso-callback"]);
const isAdminRoute = createRouteMatcher(["/admin/create", "/admin/edit(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims as any)?.metadata?.role;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const userEmail = (sessionClaims as any)?.email || (sessionClaims as any)?.primary_email;

    const hasAdminRole = role === 'admin';
    const hasAdminEmail = !!(adminEmail && userEmail && userEmail.toLowerCase() === adminEmail.toLowerCase());

    // ONLY redirect if we are SURE they aren't an admin (i.e., we have their email and it doesn't match)
    // If userEmail is missing from claims, we let them through and let the page's checkIsAdmin (which is more robust) handle it.
    if (userEmail && adminEmail && userEmail.toLowerCase() !== adminEmail.toLowerCase() && !hasAdminRole) {
      console.log('Middleware Blocking:', { userEmail, adminEmail });
      const url = new URL('/admin', request.url);
      return Response.redirect(url);
    }
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
