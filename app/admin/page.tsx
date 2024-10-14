import AdminScreen from "./_components/admin-screen";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Admin() {

    const auth = await getSession()

    if (auth.session) {
        redirect('/admin/dashboard')
    }

    return <AdminScreen />
}