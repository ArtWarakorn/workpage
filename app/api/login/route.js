import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const { data, error } = await supabase
            .schema('workpage')
            .from('users')
            .select('*')
            .eq('users_name', username)
            .eq('password', password)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
