import DashboardHeader from "@/components/layout/DashboardHeader";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { SettingsSliders } from "@/components/dashboard/SettingsSliders";
import { Simulator } from "@/components/dashboard/Simulator";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <DashboardHeader />
            <main className="flex-1 p-4 pb-24 max-w-lg mx-auto w-full">
                <h2 className="text-xl font-semibold tracking-tight">Bonjour,</h2>
                <p className="text-sm text-muted-foreground mb-4">Voici l'état de votre activité.</p>

                <SettingsSliders />
                <KPIGrid />
                <Simulator />
            </main>
        </div>
    );
}
