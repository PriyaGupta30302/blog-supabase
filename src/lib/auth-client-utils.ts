export function isAdmin(user: any) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  return user?.publicMetadata?.role === 'admin' || (userEmail && userEmail === adminEmail);
}
