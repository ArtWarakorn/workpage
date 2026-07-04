import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    try {
        const { data, error } = await supabase
            .schema('workpage')
            .from('users')
            .select('users_id, users_name, users_profile_url')
            .eq('users_id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
