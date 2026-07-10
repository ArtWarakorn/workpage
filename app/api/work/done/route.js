import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// DELETE /api/work/done?subjectId=CSCXXX&userId=123  — delete ALL done works for a subject
export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const userId = searchParams.get('userId');

    if (!subjectId || !userId) {
        return NextResponse.json({ error: "subjectId and userId required" }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .schema('workpage')
            .from('work')
            .delete()
            .eq('subject_id', subjectId)
            .eq('users_id', userId)
            .eq('work_status', true);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
