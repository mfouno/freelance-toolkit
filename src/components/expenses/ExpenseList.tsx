"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, ReceiptText, Calendar, ChevronDown, ChevronRight, Folder, FileText } from "lucide-react";
import { Expense } from "@/store/types";

export function ExpenseList() {
    const { expenses, deleteExpense } = useAppStore();

    // State to track which months/categories are expanded
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

    const formatEuro = (val: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    };

    if (expenses.length === 0) {
        return (
            <Card className="border shadow-sm border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <ReceiptText className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Aucune dépense enregistrée</p>
                    <p className="text-xs mt-1">Vos tickets scannés apparaîtront ici.</p>
                </CardContent>
            </Card>
        );
    }

    // Grouping Logic
    // 1. Group by Month (YYYY-MM)
    const groupedByMonth: Record<string, Expense[]> = {};
    expenses.forEach(exp => {
        const monthKey = exp.date.substring(0, 7); // extract "YYYY-MM"
        if (!groupedByMonth[monthKey]) groupedByMonth[monthKey] = [];
        groupedByMonth[monthKey].push(exp);
    });

    // Sort months descending
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

    const toggleMonth = (month: string) => {
        setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
    };

    const toggleCategory = (monthCatKey: string) => {
        setExpandedCategories(prev => ({ ...prev, [monthCatKey]: !prev[monthCatKey] }));
    };

    return (
        <Card className="border shadow-md">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                    Historique des Dépenses
                    <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-semibold">
                        {expenses.length}
                    </span>
                </CardTitle>
                <CardDescription>Consultez la décomposition de vos charges par mois et par catégorie.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedMonths.map((monthKey) => {
                        const monthExpenses = groupedByMonth[monthKey];
                        const monthTotalHt = monthExpenses.reduce((sum, e) => sum + e.amountHt, 0);
                        const monthTotalTva = monthExpenses.reduce((sum, e) => sum + e.tva, 0);
                        const monthTotalTtc = monthTotalHt + monthTotalTva;

                        const isMonthExpanded = expandedMonths[monthKey];

                        // 2. Group by Category within the month
                        const groupedByCategory: Record<string, Expense[]> = {};
                        monthExpenses.forEach(exp => {
                            const cat = exp.category || "Autre";
                            if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
                            groupedByCategory[cat].push(exp);
                        });

                        const sortedCategories = Object.keys(groupedByCategory).sort();

                        return (
                            <div key={monthKey} className="border rounded-xl overflow-hidden shadow-sm">
                                {/* LEVEL 1: MONTH HEADER */}
                                <div
                                    className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => toggleMonth(monthKey)}
                                >
                                    <div className="flex items-center gap-2">
                                        {isMonthExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <h3 className="font-bold text-sm capitalize">{formatMonth(monthKey)}</h3>
                                        <span className="text-[10px] bg-background border px-1.5 py-0.5 rounded text-muted-foreground">{monthExpenses.length}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-foreground">{formatEuro(monthTotalTtc)}</p>
                                    </div>
                                </div>

                                {/* LEVEL 2: CATEGORIES (Only visible if month is expanded) */}
                                {isMonthExpanded && (
                                    <div className="bg-card border-t divide-y">
                                        {sortedCategories.map(category => {
                                            const catExpenses = groupedByCategory[category];
                                            const catTotalTtc = catExpenses.reduce((sum, e) => sum + e.amountHt + e.tva, 0);
                                            const monthCatKey = `${monthKey}-${category}`;
                                            const isCatExpanded = expandedCategories[monthCatKey];

                                            return (
                                                <div key={monthCatKey} className="flex flex-col">
                                                    {/* CATEGORY ROW */}
                                                    <div
                                                        className="flex items-center justify-between p-3 pl-8 hover:bg-muted/30 cursor-pointer transition-colors"
                                                        onClick={() => toggleCategory(monthCatKey)}
                                                    >
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            {isCatExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                            <Folder className="h-3.5 w-3.5" />
                                                            <span className="font-medium">{category}</span>
                                                            <span className="text-[10px] ml-1 opacity-70">({catExpenses.length})</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-xs text-muted-foreground">{formatEuro(catTotalTtc)}</p>
                                                        </div>
                                                    </div>

                                                    {/* LEVEL 3: INDIVIDUAL EXPENSES (Only visible if category is expanded) */}
                                                    {isCatExpanded && (
                                                        <div className="bg-muted/10 divide-y border-t border-b border-primary/5">
                                                            {catExpenses.map(expense => {
                                                                const ttc = expense.amountHt + expense.tva;
                                                                return (
                                                                    <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 pl-14 hover:bg-muted/50 transition-colors gap-2">
                                                                        <div className="flex items-center gap-3">
                                                                            {expense.receiptUrl ? (
                                                                                <button onClick={(e) => { e.stopPropagation(); setViewingReceiptUrl(expense.receiptUrl!); }} className="shrink-0 group relative h-10 w-10 bg-muted/50 rounded-md border flex items-center justify-center overflow-hidden hover:border-primary transition-colors cursor-pointer">
                                                                                    {expense.receiptUrl.includes('.pdf') ? (
                                                                                        <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                                    ) : (
                                                                                        <img src={expense.receiptUrl} alt="Reçu" className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                                                    )}
                                                                                </button>
                                                                            ) : (
                                                                                <div className="shrink-0 h-10 w-10 bg-muted/20 rounded-md border border-dashed flex items-center justify-center">
                                                                                    <ReceiptText className="h-4 w-4 text-muted-foreground opacity-50" />
                                                                                </div>
                                                                            )}
                                                                            <div className="min-w-0 flex-1">
                                                                                {expense.receiptUrl ? (
                                                                                    <button onClick={(e) => { e.stopPropagation(); setViewingReceiptUrl(expense.receiptUrl!); }} className="hover:underline hover:text-primary transition-colors text-left cursor-pointer">
                                                                                        <h4 className="font-medium text-xs truncate text-foreground">{expense.description}</h4>
                                                                                    </button>
                                                                                ) : (
                                                                                    <h4 className="font-medium text-xs truncate text-foreground">{expense.description}</h4>
                                                                                )}
                                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                                    <p className="text-[10px] text-muted-foreground">{formatDate(expense.date)}</p>
                                                                                    {expense.clientName && (
                                                                                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                                                                                            Client: {expense.clientName}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                                                            <div className="text-right">
                                                                                <p className="font-bold text-xs text-foreground">{formatEuro(ttc)}</p>
                                                                                <p className="text-[9px] text-muted-foreground">{formatEuro(expense.amountHt)} HT</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={async (e) => {
                                                                                    e.stopPropagation();
                                                                                    // Si un reçu est attaché (et que c'est une image provenant de notre bucket)
                                                                                    if (expense.receiptUrl && expense.receiptUrl.startsWith('/api/files')) {
                                                                                        try {
                                                                                            await fetch('/api/delete', {
                                                                                                method: 'POST',
                                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                                body: JSON.stringify({ path: expense.receiptUrl })
                                                                                            });
                                                                                        } catch (err) {
                                                                                            console.error("Erreur lors de la suppression sur Supabase", err);
                                                                                        }
                                                                                    }
                                                                                    deleteExpense(expense.id);
                                                                                }}
                                                                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                                                                title="Supprimer la dépense"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            {/* Receipt Viewer Modal for PWA */}
            {viewingReceiptUrl && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10">
                        <h3 className="text-white font-medium">Reçu</h3>
                        <button
                            onClick={() => setViewingReceiptUrl(null)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 w-full h-full flex items-center justify-center">
                        {viewingReceiptUrl.includes('.pdf') ? (
                            <iframe
                                src={viewingReceiptUrl}
                                className="w-full h-full rounded-lg bg-white"
                                title="Visionneuse PDF"
                            />
                        ) : (
                            <img
                                src={viewingReceiptUrl}
                                alt="Reçu en plein écran"
                                className="w-full h-full object-contain rounded-lg shadow-2xl"
                            />
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
