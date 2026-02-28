import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
        return new NextResponse("Le chemin du fichier est manquant.", { status: 400 });
    }

    try {
        // Download the file privately using the service role key and bypasses RLS
        const { data, error } = await supabaseAdmin
            .storage
            .from('receipts')
            .download(path);

        if (error || !data) {
            console.error("Supabase File fetch error:", error);
            throw error || new Error("Fichier introuvable");
        }

        // Return the blob to the client
        // Add cache control headers since the receipts are immutable once uploaded
        return new NextResponse(data, {
            headers: {
                "Content-Type": data.type,
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        });
    } catch (error: any) {
        return new NextResponse("Fichier introuvable ou accès refusé.", { status: 404 });
    }
}
