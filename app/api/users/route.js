import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {

    const { data, error } = await supabase
        .schema('workpage')
        .from('users')
        .select('*')

    if(error) { 
        return NextResponse.json({error: error.message}, {status: 500}) 
    }

    return NextResponse.json(data)
}

import bcrypt from 'bcryptjs';

export async function POST(request) {
    const { users_id, users_name, password, users_profile_url } = await request.json();

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
        .schema('workpage')
        .from('users')
        .insert({ users_id, users_name, password: hashedPassword, users_profile_url })

    if(error) { 
        return NextResponse.json({error: error.message}, {status: 500}) 
    }

    return NextResponse.json(data)
}