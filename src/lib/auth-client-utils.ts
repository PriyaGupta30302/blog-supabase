export function isAdmin(user: any) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  // Robust check for email in multiple possible Clerk user object locations
  const userEmail = 
    user?.primaryEmailAddress?.emailAddress || 
    user?.emailAddresses?.[0]?.emailAddress ||
    user?.email;
  
  const hasAdminRole = user?.publicMetadata?.role === 'admin';
  const hasAdminEmail = !!(adminEmail && userEmail && userEmail.toLowerCase() === adminEmail.toLowerCase());
  
  return hasAdminRole || hasAdminEmail;
}
