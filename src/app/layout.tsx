import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

import { ThemeProvider } from "@/context/ThemeContext";
import { FeedbackProvider } from "@/context/FeedbackContext";
import { getSiteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "BlogApp - Create & Share Stories",
  description: "Discover the latest thoughts, ideas, and stories from our community.",
  openGraph: {
    title: "BlogApp - Create & Share Stories",
    description: "Discover the latest thoughts, ideas, and stories from our community.",
    siteName: "BlogApp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlogApp - Create & Share Stories",
    description: "Discover the latest thoughts, ideas, and stories from our community.",
  },
};

// Runs before first paint so a saved theme never flashes the default (mint) first.
const themeInitScript = `(function(){try{var t=localStorage.getItem('app-theme-v2');if(t){var r=document.documentElement;r.setAttribute('data-theme',t);if(t==='dark'){r.classList.add('dark');}}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-300`}
        >
          <ThemeProvider>
            <FeedbackProvider>{children}</FeedbackProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
