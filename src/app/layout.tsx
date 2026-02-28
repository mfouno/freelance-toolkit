import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { StoreInitializer } from "@/components/layout/StoreInitializer";

export const metadata: Metadata = {
    title: "Freelance Toolkit",
    description: "Gérez votre activité EURL simplement",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Freelance",
    }
};

export const viewport: Viewport = {
    themeColor: "#09090b",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="dark">
            <body className="font-sans bg-background text-foreground antialiased min-h-[100dvh] pb-16">
                <StoreInitializer />
                {children}
                <BottomNav />
            </body>
        </html>
    );
}
