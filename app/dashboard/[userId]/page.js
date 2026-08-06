import { decryptId } from "@/lib/encryptId";
import DashboardClient from "./DashboardClient";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export default async function DashboardPage({ params }) {
    const resolvedParams = await params;
    const encryptedUserId = resolvedParams?.userId;
    const userId = encryptedUserId ? decryptId(encryptedUserId) : null;

    if (!userId) {
        return notFound();
    }

    // ตรวจสอบ cookie session
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
        redirect('/login');
    }

    // ตรวจสอบว่า session ตรงกับ userId ใน URL
    const sessionUserId = decryptId(session);
    if (!sessionUserId || sessionUserId !== userId) {
        redirect('/login');
    }

    // Server-side pre-fetching ทั้ง 3 queries พร้อมกัน
    const [userRes, enrollRes, subjectRes] = await Promise.all([
        supabase.schema('workpage').from('users').select('users_id, users_name, users_profile_url').eq('users_id', userId).single(),
        supabase.schema('workpage').from('enroll').select('*, subject(subject_name, subject_detail)').eq('users_id', userId),
        supabase.schema('workpage').from('subject').select('*')
    ]);

    const initialUser = userRes.data || null;
    const initialEnrollments = enrollRes.data || [];
    const initialSubjects = subjectRes.data || [];

    return (
        <DashboardClient
            userId={userId}
            encryptedUserId={encryptedUserId}
            initialUser={initialUser}
            initialEnrollments={initialEnrollments}
            initialSubjects={initialSubjects}
        />
    );
}
