"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, PiggyBank, Receipt, Briefcase, Activity, ChevronLeft, ChevronRight } from "lucide-react";

export function KPIGrid() {
    const { workDays, expenses, settings, salaries = {}, paidRevenues = {} } = useAppStore();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Filtrage des données par année
    const yearStr = selectedYear.toString();

    // Structuration des données mensuelles
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const monthlyData = months.map((monthName, index) => {
        const monthPrefix = `${yearStr}-${String(index + 1).padStart(2, '0')}`;

        let revenue = 0;
        let paid = 0;

        // CA facturé du mois
        Object.entries(workDays).forEach(([dateStr, day]) => {
            if (dateStr.startsWith(monthPrefix)) {
                revenue += day.tjm;
            }
        });

        // CA payé du mois
        if (paidRevenues[monthPrefix]) {
            paid += paidRevenues[monthPrefix];
        }

        return { month: monthName, revenue, paid };
    });

    // Hauteur maximum pour proportionner les barres (on évite 0)
    const maxRevenue = Math.max(...monthlyData.map(d => Math.max(d.revenue, d.paid, 1)));

    // Totaux Annuels
    const totalRevenueHt = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
    const totalPaidRevenuesHt = monthlyData.reduce((sum, d) => sum + d.paid, 0);

    // Filtrer les charges par année
    const totalExpensesHt = expenses
        .filter(e => e.date.startsWith(yearStr))
        .reduce((sum, e) => sum + e.amountHt, 0);

    // Filtrer les salaires par année
    const totalSalariesBrut = Object.entries(salaries)
        .filter(([monthStr]) => monthStr.startsWith(yearStr))
        .reduce((sum, [_, sal]) => sum + sal, 0);

    // Calculs EURL Annuels
    const cotisations = totalSalariesBrut * (settings.socialContributionRate / 100);
    const impots = totalSalariesBrut * (settings.incomeTaxRate / 100);
    const salaireNetApresImpot = totalSalariesBrut - cotisations - impots;

    const tresorerieRestante = totalPaidRevenuesHt - totalExpensesHt - totalSalariesBrut;

    const formatEuro = (val: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
    };

    const formatK = (val: number) => {
        if (val === 0) return "";
        if (val < 1000) return val.toString();
        // Exemple: 12500 -> 12,5k
        return (val / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + 'k';
    };

    const flatTax = tresorerieRestante > 0 ? tresorerieRestante * 0.30 : 0;
    const tresorerieNet = tresorerieRestante > 0 ? tresorerieRestante * 0.70 : 0;
    const distributionTotal = Math.max(totalExpensesHt + cotisations + impots + flatTax + tresorerieNet + salaireNetApresImpot, 1);

    const distData = [
        { label: "Charges", value: totalExpensesHt, color: "bg-orange-400" },
        { label: "Cotis.", value: cotisations, color: "bg-orange-500" },
        { label: "IR", value: impots, color: "bg-red-400" },
        { label: "Flat Tax", value: flatTax, color: "bg-red-500" },
        { label: "Tréso.", value: tresorerieNet, color: "bg-emerald-400" },
        { label: "Net", value: salaireNetApresImpot, color: "bg-emerald-600" },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6 mt-6">
            {/* Sélecteur de l'Année */}
            <div className="flex items-center justify-between bg-card p-3 rounded-xl shadow-sm border">
                <button onClick={() => setSelectedYear(y => y - 1)} className="p-2 hover:bg-muted rounded-full">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="text-lg font-bold text-primary">
                    Bilan Année {selectedYear}
                </div>
                <button onClick={() => setSelectedYear(y => y + 1)} className="p-2 hover:bg-muted rounded-full">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Section CA Facturé (Annuel + Graphique Mensuel) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CA Facturé HT</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-2 md:px-6">
                    <div className="text-3xl font-bold mb-4 text-blue-600">{formatEuro(totalRevenueHt)}</div>
                    {/* Graphique à barres CSS */}
                    <div className="flex items-end h-36 gap-1.5 md:gap-3 mt-2">
                        {monthlyData.map(d => (
                            <div key={`rev-${d.month}`} className="flex-1 flex flex-col justify-end items-center group relative cursor-pointer h-full">
                                <div
                                    className="bg-blue-600 w-full rounded-t-sm relative shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                                    style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                                >
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                        {formatK(d.revenue)}
                                    </span>
                                </div>
                                <div className="text-[9px] md:text-[11px] text-muted-foreground mt-2">{d.month}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Section CA Encaissé (Annuel + Graphique Mensuel) */}
            <Card className="col-span-1 bg-primary text-primary-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CA Encaissé HT</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-2 md:px-6">
                    <div className="text-3xl font-bold mb-4">{formatEuro(totalPaidRevenuesHt)}</div>
                    {/* Graphique à barres CSS */}
                    <div className="flex items-end h-36 gap-1.5 md:gap-3 mt-2">
                        {monthlyData.map(d => (
                            <div key={`paid-${d.month}`} className="flex-1 flex flex-col justify-end items-center group relative cursor-pointer h-full">
                                <div
                                    className="bg-emerald-600 w-full rounded-t-sm relative shadow-[0_0_10px_rgba(5,150,105,0.3)]"
                                    style={{ height: `${(d.paid / maxRevenue) * 100}%`, minHeight: '4px' }}
                                >
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-medium text-emerald-100/70 whitespace-nowrap">
                                        {formatK(d.paid)}
                                    </span>
                                </div>
                                <div className="text-[9px] md:text-[11px] text-emerald-100/80 mt-2 font-medium">{d.month}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Reste des KPIs en grille 2 colonnes */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Charges HT</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">{formatEuro(totalExpensesHt)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trésorerie</CardTitle>
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <div className="text-2xl font-bold text-emerald-400">{formatEuro(tresorerieRestante)}</div>

                        {tresorerieRestante > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3 text-center w-full max-w-[200px] mx-auto">
                                <div className="bg-red-500/10 rounded-md py-1.5 px-2">
                                    <div className="font-bold text-red-500 dark:text-red-400 text-sm">- {formatEuro(tresorerieRestante * 0.30)}</div>
                                    <div className="text-[10px] text-red-500/80 dark:text-red-400/80 uppercase tracking-wider font-semibold">Flat Tax</div>
                                </div>
                                <div className="bg-emerald-500/10 rounded-md py-1.5 px-2">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-500 text-sm">{formatEuro(tresorerieRestante * 0.70)}</div>
                                    <div className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 uppercase tracking-wider font-semibold">Net</div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Salaires Bruts</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <div className="text-lg font-bold">{formatEuro(totalSalariesBrut)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cotisations ({settings.socialContributionRate}%)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <div className="text-lg font-bold text-orange-500 dark:text-orange-500">{formatEuro(cotisations)}</div>
                    </CardContent>
                </Card>

                <Card className="col-span-2 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenu net (après IR ~{settings.incomeTaxRate}%)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{formatEuro(salaireNetApresImpot)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Barre de répartition du CA */}
            {totalPaidRevenuesHt > 0 && (
                <Card className="mt-6 border-primary/20">
                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-sm font-medium">Répartition du CA encaissé</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="flex w-full h-8 mb-4 shadow-inner bg-muted rounded-full">
                            {distData.map((d, i) => {
                                const percent = (d.value / distributionTotal) * 100;
                                const isFirst = i === 0;
                                const isLast = i === distData.length - 1;
                                return (
                                    <div
                                        key={i}
                                        className={`${d.color} group relative cursor-pointer flex items-center justify-center text-[10px] font-bold text-white transition-all border-r border-white/20 last:border-r-0 ${isFirst ? 'rounded-l-full' : ''} ${isLast ? 'rounded-r-full' : ''}`}
                                        style={{ width: `${percent}%` }}
                                    >
                                        {percent > 6 ? formatK(d.value) : ""}

                                        {/* Infobulle Desktop/Mobile */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                            <span className="font-semibold">{d.label}</span> : {formatEuro(d.value)} ({percent.toFixed(1)}%)
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-foreground"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs justify-center mt-2">
                            {distData.map((d, i) => (
                                <div key={`legend-${i}`} className="flex items-center gap-1.5">
                                    <div className={`w-3 h-3 rounded-full ${d.color} shadow-sm`}></div>
                                    <span className="text-muted-foreground font-medium">{d.label} {((d.value / distributionTotal) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
