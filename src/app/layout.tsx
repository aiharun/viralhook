import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViralHook AI - Generate Viral TikTok Hooks & Scripts in Seconds",
  description: "Stop posting videos no one watches. Get AI-powered viral hooks, complete scripts, and visual direction for TikTok & Reels in seconds.",
  keywords: ["TikTok", "viral hooks", "content creator", "AI scripts", "Reels", "social media"],
  openGraph: {
    title: "ViralHook AI - Generate Viral TikTok Hooks & Scripts",
    description: "Get AI-powered viral hooks, complete scripts, and visual direction for TikTok & Reels in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
