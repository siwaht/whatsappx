import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "WhatsApp Dashboard | Manage Your Instances",
    description: "A powerful dashboard to manage your WhatsApp instances, contacts, and messages efficiently.",
    metadataBase: new URL("https://whatsappx.com"), // Replace with actual domain if known, or localhost for now
    openGraph: {
        title: "WhatsApp Dashboard",
        description: "Manage your WhatsApp instances and messages",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                inter.variable,
                outfit.variable
            )}>{children}</body>
        </html>
    );
}
