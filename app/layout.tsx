import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "WhatsApp Dashboard | Evolution API v2",
    template: "%s | WhatsApp Dashboard"
  },
  description: "Modern WhatsApp management dashboard powered by Evolution API v2. Manage instances, chats, contacts, and broadcasts efficiently.",
  keywords: ["WhatsApp", "Dashboard", "Evolution API", "CRM", "Messaging", "Marketing"],
  authors: [{ name: "WhatsAppX Team" }],
  creator: "WhatsAppX",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "WhatsApp Dashboard | Evolution API v2",
    description: "Modern WhatsApp management dashboard powered by Evolution API v2",
    siteName: "WhatsApp Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Dashboard",
    description: "Manage your WhatsApp instances and chats efficiently.",
    creator: "@whatsappx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
