import { decryptId } from "@/lib/encryptId";
import DetailClient from "./DetailClient";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export default async function DetailPage({ params }) {
    const resolvedParams = await params;
    const { userId: encryptedUserId, subjectId } = resolvedParams;
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

    // Server-side pre-fetching
    const [subjectRes, worksRes] = await Promise.all([
        supabase.schema('workpage').from('subject').select('*').eq('subject_id', subjectId).single(),
        supabase.schema('workpage').from('work').select('*, subject:subject_id(subject_name)').eq('subject_id', subjectId).eq('users_id', userId).order('work_date_end', { ascending: true })
    ]);

    const initialSubject = subjectRes.data || null;
    const initialWorks = worksRes.data || [];

    return (
        <DetailClient
            userId={userId}
            encryptedUserId={encryptedUserId}
            subjectId={subjectId}
            initialSubject={initialSubject}
            initialWorks={initialWorks}
        />
    );
}
