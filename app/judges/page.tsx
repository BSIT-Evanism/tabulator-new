import { getSession } from "@/lib/session";
import { JudgesScreen } from "./_components/judge-screen";
import { redirect } from "next/navigation";



export default async function Judges() {

    const session = await getSession()

    if (session.session) {
        redirect("/judges/scoring")
    }

    return <JudgesScreen />

}