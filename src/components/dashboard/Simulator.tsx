"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export function Simulator() {
    const { settings } = useAppStore();

    const [simulatedCA, setSimulatedCA] = useState<number>(100000);
    const [simulatedMonthlySalary, setSimulatedMonthlySalary] = useState<number>(3000);
    const [simulatedExpenses, setSimulatedExpenses] = useState<number>(5000);

    // Calculs Simulés
    const annualSalaryNet = simulatedMonthlySalary * 12;
    // Brut = Net / (1 - (TauxCotis + TauxImpot))
    const combinedRate = (settings.socialContributionRate + settings.incomeTaxRate) / 100;
    const annualSalaryBrut = combinedRate < 1 ? annualSalaryNet / (1 - combinedRate) : 0;

    const cotisations = annualSalaryBrut * (settings.socialContributionRate / 100);
    const impots = annualSalaryBrut * (settings.incomeTaxRate / 100);
    const monthlySalaryBrut = annualSalaryBrut / 12;

    const tresorerie = simulatedCA - simulatedExpenses - annualSalaryBrut;
    const flatTax = tresorerie > 0 ? tresorerie * 0.30 : 0;
    const tresorerieNet = tresorerie > 0 ? tresorerie * 0.70 : 0;

    const formatEuro = (val: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
    };

    const formatK = (val: number) => {
        if (val === 0) return "";
        if (val < 1000) return val.toString();
        return (val / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + 'k';
    };

    const distributionTotal = Math.max(simulatedExpenses + cotisations + impots + flatTax + tresorerieNet + annualSalaryNet, 1);

    const distData = [
        { label: "Charges", value: simulatedExpenses, color: "bg-orange-400" },
        { label: "Cotis.", value: cotisations, color: "bg-orange-500" },
        { label: "IR", value: impots, color: "bg-red-400" },
        { label: "Flat Tax", value: flatTax, color: "bg-red-500" },
        { label: "Tréso.", value: tresorerieNet, color: "bg-emerald-400" },
        { label: "Net", value: annualSalaryNet, color: "bg-emerald-600" },
    ].filter(d => d.value > 0);

    return (
        <Card className="mt-8 border-dashed border-2 bg-muted/30">
            <CardHeader className="flex flex-row items-center space-x-2 pb-4">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold">Simulateur de Scénario</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">CA Encaissé Prévisionnel</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={simulatedCA || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedCA(Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-input bg-background py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-3 pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Charges (Annuel)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={simulatedExpenses || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedExpenses(Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-input bg-background py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-3 pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Salaire Mensuel Net Souhaité</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={simulatedMonthlySalary || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedMonthlySalary(Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-input bg-background py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-3 pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-xl">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Salaire Brut Mensuel (Équiv.)</span>
                        <span className="text-xl font-bold">{formatEuro(monthlySalaryBrut)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Cotisations Annuelles</span>
                        <span className="text-xl font-bold text-orange-500 dark:text-orange-400">{formatEuro(cotisations)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Impôt (IR) Annuel</span>
                        <span className="text-xl font-bold text-red-500 dark:text-red-400">{formatEuro(impots)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Trésorerie Restante</span>
                        {tresorerie > 0 ? (
                            <div>
                                <span className="text-xl font-bold text-emerald-400">{formatEuro(tresorerie)}</span>
                                <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold">
                                    <span className="text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">NET: {formatEuro(tresorerieNet)}</span>
                                    <span className="text-red-500 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">FLAT: -{formatEuro(flatTax)}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-xl font-bold">{formatEuro(tresorerie)}</span>
                        )}
                    </div>
                </div>

                {/* Barre de répartition du CA simulé */}
                {simulatedCA > 0 && (
                    <div className="mt-8 border-t pt-6 border-primary/10">
                        <h4 className="text-sm font-medium text-center mb-4">Répartition du CA prévisionnel</h4>
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
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
