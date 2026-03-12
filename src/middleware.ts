import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/", "/blog(.*)", "/admin", "/api/public(.*)", "/sso-callback"]);
const isAdminRoute = createRouteMatcher(["/admin/create", "/admin/edit(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims as any)?.metadata?.role;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    
    // Try to get email from diverse possible claim locations
    const userEmail = (sessionClaims as any)?.email || (sessionClaims as any)?.primary_email;

    // Log for debugging if needed (standard Next.js logs)
    // console.log('Middleware Auth Check:', { role, userEmail, adminEmail });

    // Allow access if user has admin role OR their email matches the admin email.
    // If we can't find the email in claims, we'll allow the page to load 
    // and let the server-side checkIsAdmin() in actions.ts handle the security.
    if (role !== 'admin' && adminEmail && userEmail && userEmail !== adminEmail) {
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
