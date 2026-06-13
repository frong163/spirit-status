import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spirit Status — Daily Tarot Rankings",
  description: "Draw a tarot card daily, grow your spiritual attributes, and rise through aura tiers on the global leaderboard.",
  keywords: "tarot, spiritual, daily game, leaderboard, aura, mystical",
  openGraph: {
    title: "Spirit Status",
    description: "Draw your daily tarot card and rise through the cosmic ranks.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spirit Status",
    description: "Daily tarot draws. Cosmic rankings. What's your aura today?",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0618",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-void text-oracle-light antialiased">
        {children}
      </body>
    </html>
  );
}
