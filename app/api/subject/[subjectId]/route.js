import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/subject/[subjectId]
export async function GET(request, { params }) {
    try {
        const { subjectId } = await params;

        const { data, error } = await supabase
            .schema('workpage')
            .from('subject')
            .select('subject_id, subject_name, subject_detail')
            .eq('subject_id', subjectId)
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
