import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Generate a unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name}`;

        // Upload to Supabase Storage in a bucket named "profiles"
        const { data, error } = await supabase
            .storage
            .from('profiles')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase
            .storage
            .from('profiles')
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrlData.publicUrl });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
