import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google'
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Song Search",
  description: "get song recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-VRZWVH7QG1" />
      <body className={inter.className}>
        <div className="font-['Telegraf']">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
