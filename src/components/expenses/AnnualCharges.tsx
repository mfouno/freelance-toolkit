"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/store";
import { Plus, Trash2, ChevronLeft, ChevronRight, Paperclip, Loader2, Check } from "lucide-react";

export function AnnualCharges() {
    const { annualCharges = [], addAnnualCharge, deleteAnnualCharge } = useAppStore();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isAdding, setIsAdding] = useState(false);
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState(0);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingChargeId, setPendingChargeId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState(0);

    const chargesForYear = annualCharges.filter(c => c.year === selectedYear);
    const totalAnnuel = chargesForYear.reduce((sum, c) => sum + c.amountHt, 0);
    const totalMensuel = Math.round(totalAnnuel / 12);

    const handleAdd = () => {
        if (!label || amount <= 0) return;
        addAnnualCharge({
            id: crypto.randomUUID(),
            label,
            amountHt: amount,
            year: selectedYear,
        });
        setLabel("");
        setAmount(0);
        setIsAdding(false);
    };

    const handleAttachFile = (chargeId: string) => {
        setPendingChargeId(chargeId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !pendingChargeId) return;

        setUploadingId(pendingChargeId);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("month", `${selectedYear}-charges`);
            formData.append("category", "charges-annuelles");

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                // Update the charge in the store with the document URL
                const charge = annualCharges.find(c => c.id === pendingChargeId);
                if (charge) {
                    // Delete the old one and re-add with documentUrl
                    deleteAnnualCharge(pendingChargeId);
                    addAnnualCharge({ ...charge, documentUrl: data.path });
                }
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploadingId(null);
            setPendingChargeId(null);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="bg-card border rounded-xl p-4 space-y-3">
            {/* Hidden global file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Header avec sélecteur d'année */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Charges Annuelles Récurrentes</h3>
                <div className="flex items-center gap-1">
                    <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 hover:bg-muted rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold text-primary min-w-[3rem] text-center">{selectedYear}</span>
                    <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 hover:bg-muted rounded-full">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Totaux */}
            <div className="flex gap-3">
                <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Total annuel HT</p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{totalAnnuel.toLocaleString('fr-FR')} €</p>
                </div>
                <div className="flex-1 bg-muted/50 border rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Soit / mois</p>
                    <p className="text-sm font-bold text-foreground">{totalMensuel.toLocaleString('fr-FR')} €</p>
                </div>
            </div>

            {/* Liste des charges */}
            {chargesForYear.length > 0 ? (
                <div className="space-y-1.5">
                    {chargesForYear.map(charge => (
                        <div key={charge.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                            <div className="min-w-0">
                                <span className="text-sm font-medium truncate block">{charge.label}</span>
                                <span className="text-xs text-muted-foreground">({Math.round(charge.amountHt / 12)} €/mois)</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {editingId === charge.id ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            autoFocus
                                            type="number"
                                            value={editAmount || ""}
                                            onChange={(e) => setEditAmount(Number(e.target.value))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    deleteAnnualCharge(charge.id);
                                                    addAnnualCharge({ ...charge, amountHt: editAmount });
                                                    setEditingId(null);
                                                }
                                            }}
                                            className="w-20 text-base md:text-sm bg-background border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                            onClick={() => {
                                                deleteAnnualCharge(charge.id);
                                                addAnnualCharge({ ...charge, amountHt: editAmount });
                                                setEditingId(null);
                                            }}
                                            className="bg-primary text-primary-foreground p-1 rounded-md hover:opacity-90"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingId(charge.id);
                                            setEditAmount(charge.amountHt);
                                        }}
                                        className="text-sm font-bold hover:underline hover:text-primary transition-colors"
                                    >
                                        {charge.amountHt.toLocaleString('fr-FR')} €
                                    </button>
                                )}

                                {/* Bouton d'attachement PDF */}
                                <button
                                    onClick={() => handleAttachFile(charge.id)}
                                    disabled={uploadingId === charge.id}
                                    className={`p-1.5 rounded-md transition-colors ${charge.documentUrl
                                        ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                                        }`}
                                    title={charge.documentUrl ? "Remplacer le justificatif" : "Joindre un justificatif"}
                                >
                                    {uploadingId === charge.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Paperclip className="h-3.5 w-3.5" />
                                    )}
                                </button>

                                {/* Bouton de suppression */}
                                <button
                                    onClick={() => {
                                        if (confirm(`Supprimer "${charge.label}" ?`)) {
                                            deleteAnnualCharge(charge.id);
                                        }
                                    }}
                                    className="text-red-400 hover:text-red-600 p-1"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Aucune charge annuelle pour {selectedYear}.</p>
            )}

            {/* Formulaire d'ajout (simplifié, sans upload) */}
            {isAdding ? (
                <div className="space-y-2 pt-2 border-t">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Libellé (ex: Loyer bureau)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full text-base md:text-sm bg-muted rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Montant annuel HT"
                            value={amount || ""}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="flex-1 text-base md:text-sm bg-muted rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-primary text-primary-foreground font-semibold rounded-md px-4 py-2 text-sm hover:opacity-90"
                        >
                            Ajouter
                        </button>
                    </div>
                    <button onClick={() => setIsAdding(false)} className="text-xs text-muted-foreground hover:underline w-full text-center">
                        Annuler
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg py-2 border border-dashed border-primary/30"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter une charge
                </button>
            )}
        </div>
    );
}
