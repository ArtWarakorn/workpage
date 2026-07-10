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

export async function POST(request) {
    const { users_id, users_name, password, users_profile_url } = await request.json();

    const { data, error } = await supabase
        .schema('workpage')
        .from('users')
        .insert({ users_id, users_name, password, users_profile_url })

    if(error) { 
        return NextResponse.json({error: error.message}, {status: 500}) 
    }

    return NextResponse.json(data)
}