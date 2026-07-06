import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// PATCH /api/work/[workId]  — toggle status
export async function PATCH(request, { params }) {
    try {
        const { workId } = await params;
        const body = await request.json();
        const { work_status } = body;

        const { data, error } = await supabase
            .schema('workpage')
            .from('work')
            .update({ work_status })
            .eq('work_id', parseInt(workId))
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE /api/work/[workId]  — delete one work
export async function DELETE(request, { params }) {
    try {
        const { workId } = await params;

        const { error } = await supabase
            .schema('workpage')
            .from('work')
            .delete()
            .eq('work_id', parseInt(workId));

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
