import DashboardHeader from "@/components/layout/DashboardHeader";
import { ExpenseAnalyzer } from "@/components/expenses/ExpenseAnalyzer";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AnnualCharges } from "@/components/expenses/AnnualCharges";

export default function ExpensesPage() {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-muted/20">
            <header className="flex h-14 items-center px-4 pt-safe sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
                <h1 className="text-xl font-semibold tracking-tight">Charges & Reçus</h1>
            </header>
            <main className="flex-1 p-4 pb-24 max-w-lg mx-auto w-full space-y-6">
                <div>
                    <p className="text-sm text-muted-foreground mb-4">Photographiez vos factures pour extraire les montants (via OCR local).</p>
                    <ExpenseAnalyzer />
                </div>

                <AnnualCharges />

                <ExpenseList />
            </main>
        </div>
    );
}
