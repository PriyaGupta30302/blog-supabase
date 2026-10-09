import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "localhost:3000";
const defaultUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
  ? rawUrl
  : `https://${rawUrl}`;

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-300`}
        >
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
