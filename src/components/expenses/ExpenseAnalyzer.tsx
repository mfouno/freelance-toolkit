"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Check, Loader2, Plus, X, Camera } from "lucide-react";
import { useAppStore } from "@/store";
import { ExpenseCategory } from "@/store/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ExpenseAnalyzer() {
    const { addExpense } = useAppStore();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Champs du formulaire
    const [month, setMonth] = useState<string>(
        new Date().toISOString().substring(0, 7) // "YYYY-MM"
    );
    const [clientName, setClientName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("Autre");
    const [amountHt, setAmountHt] = useState<number | "">("");
    const [tva, setTva] = useState<number | "">("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        // Création d'une URL de preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setFileType(file.type);

        // Remise à zéro
        setDescription("Facture / Reçu");
        setCategory("Autre");
        setAmountHt("");
        setTva("");

        if (file.type.startsWith('image/')) {
            await processImage(file);
        } else if (file.type === "application/pdf") {
            await processPdf(file);
        } else {
            alert("Format non supporté pour l'analyse automatique. Merci de vérifier vos saisies.");
        }
    };

    const processPdf = async (file: File) => {
        setIsProcessing(true);
        try {
            // Import dynamique de pdfjs uniquement côté client
            const pdfjsLib = await import('pdfjs-dist');
            // Utiliser le worker du CDN pour éviter les problèmes de configuration locale/build Next.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // On analyse uniquement la première page pour une facture simple
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 pour une meilleure qualité OCR

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error("Impossible de créer le canvas");

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Convertir le canvas en blob (image) pour Tesseract
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));

            if (blob) {
                const previewUrl = URL.createObjectURL(blob);
                setImagePreview(previewUrl);

                const imageFile = new File([blob], "pdf-page.jpg", { type: "image/jpeg" });
                await processImage(imageFile); // On réutilise processImage pour extraire le texte
            } else {
                setIsProcessing(false);
            }
        } catch (error) {
            console.error("Erreur parsing PDF :", error);
            setIsProcessing(false);
        }
    };

    const processImage = async (file: File) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/ocr", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Erreur lors de l'analyse");
            }

            const data = await response.json();

            // Appliquer les données extraites par Gemini
            if (data.merchantName && data.merchantName !== "null") setDescription(data.merchantName);
            if (data.category && data.category !== "null") setCategory(data.category as ExpenseCategory);
            if (data.totalHT && data.totalHT !== "null") setAmountHt(Number(data.totalHT));
            if (data.totalTVA && data.totalTVA !== "null") setTva(Number(data.totalTVA));
            // Bonus: si Gemini trouve la date exacte, on pourrait aussi setter le mois, 
            // mais on garde le comportement actuel pour l'instant pour ne pas perturber la logique de mois en cours.

        } catch (error) {
            console.error("Erreur API OCR :", error);
            alert("Impossible d'extraire les données automatiquement. Merci de remplir manuellement.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (amountHt === "" || tva === "") return;

        // Create a date string for the chosen month (using 01 as default day)
        // or just keep today's date if it matches the chosen month.
        const today = new Date();
        const currentMonthStr = today.toISOString().substring(0, 7);
        const expenseDate = month === currentMonthStr
            ? today.toISOString().split('T')[0]
            : `${month}-01`;

        let uploadedUrl = undefined;

        if (selectedFile) {
            setIsProcessing(true);
            try {
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("month", month);
                formData.append("category", category);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.path) {
                        uploadedUrl = data.path; // e.g. /api/files?path=...
                    }
                } else {
                    console.error("Upload failed", await response.text());
                    alert("Le fichier n'a pas pu être uploadé sur le cloud sécurisé, mais la dépense sera enregistrée.");
                }
            } catch (error) {
                console.error("Upload error", error);
            } finally {
                setIsProcessing(false);
            }
        }

        addExpense({
            id: Date.now().toString(),
            date: expenseDate,
            description: description || "Facture",
            category: category,
            clientName: clientName.trim() || undefined,
            amountHt: Number(amountHt),
            tva: Number(tva),
            receiptUrl: uploadedUrl || imagePreview || undefined // fallback to local base64 if upload fails
        });

        // Reset après save
        setImagePreview(null);
        setSelectedFile(null);
        setDescription("");
        setClientName("");
        setAmountHt("");
        setTva("");
        // Keep the same month to make adding multiple expenses easier
        alert("Charge sauvegardée avec succès !");
    };

    return (
        <div className="space-y-6">
            {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/50 rounded-2xl bg-card hover:bg-muted/50 cursor-pointer transition-colors px-6 text-center shadow-sm">
                    <FileText className="h-8 w-8 text-primary mb-3" />
                    <span className="text-sm font-medium">Uploader une facture (PDF ou Image)</span>
                    <span className="text-xs text-muted-foreground mt-1 text-balance">Sélectionner un fichier</span>
                    <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*,.pdf,application/pdf"
                        className="hidden"
                    />
                </label>
            ) : (
                <Card className="border shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                            Créer la Dépense
                            {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </CardTitle>
                        <CardDescription>Vérifiez les données extraites par l'IA locale.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="flex justify-center mb-4">
                            {fileType.includes('pdf') && imagePreview ? (
                                <img src={imagePreview} alt="Aperçu reçu PDF" className="h-32 object-contain rounded-md border shadow-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsModalOpen(true)} />
                            ) : fileType.includes('pdf') ? (
                                <div className="h-32 w-32 flex flex-col items-center justify-center p-4 bg-muted/50 rounded-md border shadow-sm">
                                    <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                                    <span className="text-[10px] text-muted-foreground">Document PDF</span>
                                </div>
                            ) : (
                                <img src={imagePreview!} alt="Aperçu reçu" className="h-32 object-contain rounded-md border shadow-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsModalOpen(true)} />
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Mois</label>
                                    <input
                                        type="month"
                                        value={month}
                                        onChange={e => setMonth(e.target.value)}
                                        className="w-full mt-1 px-3 h-10 bg-muted text-black rounded-md text-base border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Catégorie</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value as ExpenseCategory)}
                                        className="w-full mt-1 px-3 h-10 bg-muted text-black rounded-md text-base border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="Restaurant / Repas">Restaurant / Repas</option>
                                        <option value="Transport (Train, Avion, Taxi)">Transport</option>
                                        <option value="Hébergement (Hôtel)">Hébergement</option>
                                        <option value="Logiciels & Licences">Logiciels & Licences</option>
                                        <option value="Matériel & Fournitures">Matériel</option>
                                        <option value="Téléphone & Internet">Téléphone & Internet</option>
                                        <option value="Frais Bancaires">Frais bancaires</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Client (Optionnel)</label>
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        className="w-full mt-1 px-3 h-10 bg-muted text-black rounded-md text-base border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Nom du client"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="w-full mt-1 px-3 h-10 bg-muted text-black rounded-md text-base border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Ex: Repas d'affaires, Train..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Montant HT (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amountHt}
                                    onChange={e => setAmountHt(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full mt-1 px-3 py-2 bg-muted text-black rounded-md text-base border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">TVA (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tva}
                                    onChange={e => setTva(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full mt-1 px-3 py-2 bg-muted text-black rounded-md text-base border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={() => {
                                    setImagePreview(null);
                                    setSelectedFile(null);
                                }}
                                className="flex-1 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isProcessing || amountHt === ""}
                                className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold flex flex-row items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Enregistrer
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal d'agrandissement de l'image */}
            {isModalOpen && imagePreview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
                    onClick={() => setIsModalOpen(false)}
                    style={{ touchAction: 'pinch-zoom' }}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw] flex items-center justify-center">
                        <img
                            src={imagePreview}
                            alt="Aperçu agrandi"
                            className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors flex items-center gap-2"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Fermer
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
