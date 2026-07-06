import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// DELETE /api/work/done?subjectId=CSCXXX  — delete ALL done works for a subject
export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
        return NextResponse.json({ error: "subjectId required" }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .schema('workpage')
            .from('work')
            .delete()
            .eq('subject_id', subjectId)
            .eq('work_status', true);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
