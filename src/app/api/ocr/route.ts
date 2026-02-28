import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the SDK. It will automatically use the GEMINI_API_KEY environment variable.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Configuration API Gemini manquante. Ajoutez GEMINI_API_KEY dans .env.local" },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
        }

        // Convert the File object to a base64 string for Gemini
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');

        const prompt = `Tu es un expert-comptable très précis spécialisé dans l'analyse de tickets de caisse et de factures en France.
Ton seul rôle est d'extraire les informations clefs du document visuel fourni avec une justesse mathématique totale.

** RÈGLES STRICTES POUR L'EXTRACTION MATHEMATIQUE : **
1. Le "totalTTC" correspond au montant final payé par le client (souvent appelé TOTAL, TTC, Montant, ou la plus haute valeur sur le ticket).
2. Le "totalTVA" correspond au montant absolu cumulé des taxes (souvent identifié sous "TVA", "T.V.A", ou "TAX"). S'il y a plusieurs lignes de TVA, tu DOIS les additionner pour trouver le total. 
3. Le "totalHT" correspond au montant hors taxes. 
4. Si tu trouves le TTC et la TVA, mais pas le HT de façon explicite, tu DOIS le calculer toi-même avec cette formule stricte : HT = TTC - TVA.
5. S'il n'y a aucune trace de TVA sur le document (ex: franchise de TVA, Uber sans TVA), alors indique "totalTVA": 0 et "totalHT" égal au "totalTTC".
6. Réponds avec des nombres décimaux (. pas ,) et pas avec des chaînes de caractères.
7. Tu DOIS déduire la catégorie de la dépense en choisissant STRICTEMENT l'une de ces options exactes : "Restaurant / Repas", "Transport (Train, Avion, Taxi)", "Hébergement (Hôtel)", "Logiciels & Licences", "Matériel & Fournitures", "Téléphone & Internet", "Frais Bancaires", ou "Autre".

Réponds UNIQUEMENT sous cette structure JSON stricte (sans écrire le mot json autour, ni faire de markdown) :
{
  "merchantName": "Nom de l'entreprise ou du commerçant tout en haut",
  "category": "Une des catégories exactes listées ci-dessus",
  "date": "YYYY-MM-DD",
  "totalTTC": 120.50,
  "totalHT": 100.42,
  "totalTVA": 20.08
}`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: file.type // "image/jpeg", "application/pdf" etc..
            },
        };

        let responseText = "";

        // On essaye plusieurs modèles Gemini en cascade car selon la région ou l'ancienneté 
        // de la clef API, certains alias peuvent retourner une erreur 404 (Not Found)
        const modelsToTry = [
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash"
        ];
        let result = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent([prompt, imagePart]);
                responseText = result.response.text();
                console.log(`[OCR] Succès avec le modèle : ${modelName}`);
                break; // Si ça marche, on sort de la boucle
            } catch (err: any) {
                console.warn(`[OCR] Le modèle ${modelName} a échoué :`, err?.message);
                lastError = err;
            }
        }

        if (!result) {
            throw new Error(`Aucun modèle Gemini n'est disponible pour cette clé API. Dernière erreur : ${lastError?.message}`);
        }

        // Gemini sometimes wraps JSON in markdown blocks (`​`​`json ... `​`​`). We need to clean it.
        const cleanedJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(cleanedJsonText);
        } catch (e) {
            console.error("Gemini a retourné un JSON invalide :", responseText);
            return NextResponse.json({ error: "Echec de l'analyse du reçu (Format inattendu)." }, { status: 500 });
        }

        console.log("Données extraites par l'IA :", parsedData);
        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("Erreur API OCR Gemini:", error);
        return NextResponse.json(
            { error: error?.message || "Une erreur inattendue s'est produite." },
            { status: 500 }
        );
    }
}
