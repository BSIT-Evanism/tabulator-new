import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ScoringPageComponent } from "../_components/scoring-page";
import prisma from "@/lib/db";
import { client } from "@/lib/treaty";


export default async function ScoringPage() {

    const session = await getSession()

    if (!session.session) {
        redirect("/judges")
    }

    if (session.session.role !== "judge") {
        redirect("/judges")
    }

    const judge = await prisma.judge.findUnique({
        where: {
            id: session.session.id as string
        }
    })

    const contestants = await prisma.contestant.findMany()
    const topcontestants = await client.api.topcontestants.get()


    console.log(contestants)


    return <ScoringPageComponent contestants={contestants} judge={judge} topFemales={topcontestants.data?.topFemales.map(female => female.contestant.id) ?? []} topMales={topcontestants.data?.topMales.map(male => male.contestant.id) ?? []} />
}
