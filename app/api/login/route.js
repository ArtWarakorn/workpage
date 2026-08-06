import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

import bcrypt from 'bcryptjs';
import { encryptId } from "@/lib/encryptId";

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const { data, error } = await supabase
            .schema('workpage')
            .from('users')
            .select('*')
            .eq('users_name', username)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, data.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        const encryptedId = encryptId(data.users_id);

        const response = NextResponse.json({ encryptedId });
        response.cookies.set('session', encryptedId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 วัน
        });
        return response;
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
        
    }
}
