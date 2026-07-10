import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/work?subjectId=CSCXXX&userId=123
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const userId = searchParams.get('userId');

    if (!subjectId || !userId) {
        return NextResponse.json({ error: "subjectId and userId required" }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .schema('workpage')
            .from('work')
            .select('*')
            .eq('subject_id', subjectId)
            .eq('users_id', userId)
            .order('work_date_end', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/work  — insert new work
export async function POST(request) {
    try {
        const body = await request.json();
        const { subject_id, users_id, work_title, work_date_end, work_detail, work_status } = body;

        if (!subject_id || !work_title || !users_id) {
            return NextResponse.json({ error: "subject_id, users_id and work_title required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .schema('workpage')
            .from('work')
            .insert({
                subject_id,
                users_id,
                work_title,
                work_date_end: work_date_end || null,
                work_detail: work_detail || null,
                work_status: work_status ?? false,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
