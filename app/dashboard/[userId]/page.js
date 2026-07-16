import { decryptId } from "@/lib/encryptId";
import DashboardClient from "./DashboardClient";
import { notFound } from "next/navigation";

export default async function DashboardPage({ params }) {
    const resolvedParams = await params;
    const encryptedUserId = resolvedParams?.userId;
    const userId = encryptedUserId ? decryptId(encryptedUserId) : null;

    if (!userId) {
        return notFound();
    }

    return <DashboardClient userId={userId} encryptedUserId={encryptedUserId} />;
}
