import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";

export async function POST(req: NextRequest) {
    noStore();
    try {
        const body = await req.json();
        const path = body.path;

        if (!path) {
            return NextResponse.json({ error: "Chemin du fichier manquant." }, { status: 400 });
        }

        // Clean up the path if it's the full proxy URL (/api/files?path=...)
        let storagePath = path;
        if (storagePath.startsWith('/api/files?path=')) {
            storagePath = decodeURIComponent(storagePath.split('/api/files?path=')[1]);
        }

        const sb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Delete the file using the service role key
        const { error } = await sb
            .storage
            .from('receipts')
            .remove([storagePath]);

        if (error) {
            console.error("Supabase Deletion Error:", error);
            throw new Error(`Erreur Supabase: ${error.message}`);
        }

        return NextResponse.json({ success: true, deleted: storagePath });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: error.message || "Impossible de supprimer le fichier" }, { status: 500 });
    }
}
