import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Server-side check to see if the current user is an admin.
 * Throws an error if the user is not an admin.
 */
export async function checkIsAdmin() {
  const { sessionClaims } = await auth();
  const user = await currentUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  
  // Check Clerk metadata for role: 'admin'
  const role = (sessionClaims as any)?.metadata?.role;
  
  if (role !== 'admin' && !(userEmail && userEmail === adminEmail)) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return true;
}
