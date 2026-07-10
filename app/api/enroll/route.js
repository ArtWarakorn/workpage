import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    try {
        const { data, error } = await supabase
            .schema('workpage')
            .from('enroll')
            .select(`
                *,
                subject (
                    subject_name,
                    subject_detail
                )
            `)
            .eq('users_id', userId);

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, subject_id, subject_name, subject_detail, enroll_day, start_time, end_time } = body;

        // We no longer upsert the subject here because subjects are managed by admin.
        
        // Insert enroll
        const { data, error: enrollError } = await supabase
            .schema('workpage')
            .from('enroll')
            .insert({
                users_id: userId,
                subject_id,
                enroll_day,
                start_time,
                end_time
            })
            .select();

        if (enrollError) throw enrollError;

        return NextResponse.json(data[0]);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    try {
        const { error } = await supabase
            .schema('workpage')
            .from('enroll')
            .delete()
            .eq('users_id', parseInt(userId));

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
