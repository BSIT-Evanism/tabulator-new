import { getSession } from "@/lib/session";
import { JudgesScreen } from "./_components/judge-screen";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";



export default async function Judges() {

    const session = await getSession()
    const data = await prisma.tabulationDesignVariables.findUnique({
        where: {
            id: 1
        }
    })

    if (session.session) {
        if (session.session.role === 'judge') {
            redirect("/judges/scoring")
        }
    }

    return <JudgesScreen data={data} />

}