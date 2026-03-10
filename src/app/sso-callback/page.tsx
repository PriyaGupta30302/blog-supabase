import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground/50 font-medium italic">Completing your secure sign-in...</p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
