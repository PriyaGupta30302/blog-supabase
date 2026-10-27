import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ink border-t-primary mx-auto mb-4"></div>
        <p className="text-foreground/60 font-medium">Completing your secure sign-in...</p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
