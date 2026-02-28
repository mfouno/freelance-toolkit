"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard", icon: Home },
        { href: "/calendar", label: "Calendrier", icon: Calendar },
        { href: "/expenses", label: "Charges", icon: Receipt },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background/80 backdrop-blur-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
