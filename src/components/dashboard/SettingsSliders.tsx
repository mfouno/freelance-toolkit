"use client";

import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsSliders() {
    const { settings, updateSettings } = useAppStore();

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-lg">Réglages EURL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium">Taux de Cotisations (URSSAF)</label>
                        <span className="text-sm font-bold">{settings.socialContributionRate}%</span>
                    </div>
                    <input
                        type="range"
                        min="30" max="60" step="1"
                        value={settings.socialContributionRate}
                        onChange={(e) => updateSettings({ socialContributionRate: Number(e.target.value) })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-xs text-muted-foreground">En % de la rémunération nette (généralement ~45%)</p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium">Taux d'Impôt sur le Revenu</label>
                        <span className="text-sm font-bold">{settings.incomeTaxRate}%</span>
                    </div>
                    <input
                        type="range"
                        min="0" max="45" step="1"
                        value={settings.incomeTaxRate}
                        onChange={(e) => updateSettings({ incomeTaxRate: Number(e.target.value) })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-xs text-muted-foreground">Taux moyen d'imposition estimé</p>
                </div>


            </CardContent>
        </Card>
    );
}
