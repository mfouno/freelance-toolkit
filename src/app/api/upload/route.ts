import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";

export async function POST(req: NextRequest) {
    noStore();
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const month = formData.get("month") as string;
        const category = formData.get("category") as string;

        if (!file || !month || !category) {
            return NextResponse.json({ error: "Fichier, mois ou catégorie manquants." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Clean filename, avoid weird chars that break URLs
        const ext = file.name.split('.').pop() || 'tmp';
        const originalName = file.name.split('.').slice(0, -1).join('-').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 30);
        const filename = `${Date.now()}-${originalName}.${ext}`;

        // Clean category name to remove accents and special chars
        const safeCategory = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '_');

        // Format path: "YYYY-MM/Category/timestamp-name.ext"
        const filePath = `${month}/${safeCategory}/${filename}`;

        const sb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data, error } = await sb
            .storage
            .from('receipts') // Must match the Private Bucket name created in Supabase
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false // Don't overwrite existing
            });

        if (error) {
            console.error("Supabase Error:", error);
            throw new Error(`Erreur Supabase: ${error.message}`);
        }

        // Return our secure proxy URL instead of the direct Supabase URL
        return NextResponse.json({
            success: true,
            path: `/api/files?path=${encodeURIComponent(filePath)}`
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Failed to upload file to Supabase" }, { status: 500 });
    }
}
