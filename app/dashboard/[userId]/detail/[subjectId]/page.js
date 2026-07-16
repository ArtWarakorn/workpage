import { decryptId } from "@/lib/encryptId";
import DetailClient from "./DetailClient";
import { notFound } from "next/navigation";

export default async function DetailPage({ params }) {
    const resolvedParams = await params;
    const { userId: encryptedUserId, subjectId } = resolvedParams;
    const userId = encryptedUserId ? decryptId(encryptedUserId) : null;

    if (!userId) {
        return notFound();
    }

    return <DetailClient userId={userId} encryptedUserId={encryptedUserId} subjectId={subjectId} />;
}
