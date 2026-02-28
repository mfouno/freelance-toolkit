import DashboardHeader from "@/components/layout/DashboardHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";

export default function CalendarPage() {
    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <header className="flex h-14 items-center px-4 pt-safe sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
                <h1 className="text-xl font-semibold tracking-tight">Calendrier</h1>
            </header>
            <main className="flex-1 p-4 pb-24 md:max-w-4xl mx-auto w-full">
                <p className="text-sm text-muted-foreground mb-4">Sélectionnez vos jours travaillés pour générer le CA.</p>
                <CalendarGrid />
            </main>
        </div>
    );
}
