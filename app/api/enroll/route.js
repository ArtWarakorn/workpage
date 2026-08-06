import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptId } from "@/lib/encryptId";

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
        const { userId, subject_id, enroll_day, start_time, end_time } = body;

        // Validate required fields
        if (!userId || !subject_id || !enroll_day || !start_time || !end_time) {
            return NextResponse.json(
                { error: "Missing required fields: userId, subject_id, enroll_day, start_time, end_time" },
                { status: 400 }
            );
        }

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


export async function PATCH(request) {
    try {
        // ตรวจสอบ session ownership
        const cookieStore = await cookies();
        const session = cookieStore.get('session')?.value;
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const sessionUserId = decryptId(session);

        const body = await request.json();
        const { userId, subject_id, enroll_day, start_time, end_time } = body;

        if (!userId || !subject_id) {
            return NextResponse.json({ error: "userId and subject_id required" }, { status: 400 });
        }

        // ตรวจสอบว่า session เป็นเจ้าของ userId ที่ส่งมา
        if (!sessionUserId || String(sessionUserId) !== String(userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { data, error } = await supabase
            .schema('workpage')
            .from('enroll')
            .update({ enroll_day, start_time, end_time })
            .eq('users_id', parseInt(userId))
            .eq('subject_id', subject_id)
            .select();

        if (error) throw error;
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
        // ตรวจสอบ session ownership
        const cookieStore = await cookies();
        const session = cookieStore.get('session')?.value;
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const sessionUserId = decryptId(session);

        // ตรวจสอบว่า session เป็นเจ้าของ userId ที่ส่งมา
        if (!sessionUserId || String(sessionUserId) !== String(userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

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
