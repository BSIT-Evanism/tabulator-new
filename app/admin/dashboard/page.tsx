import { AdminDashboardComponent } from "../_components/admin-dashboard"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"



export default async function DashboardPage() {

    const session = await getSession()

    if (!session.session) {
        redirect('/admin')
    }

    return (
        <div>
            <AdminDashboardComponent />
        </div>
    )
}