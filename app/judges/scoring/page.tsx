import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ScoringPageComponent } from "../_components/scoring-page";
import prisma from "@/lib/db";
import { client } from "@/lib/treaty";

export const dynamic = 'force-dynamic'

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
    const topcontestant = await fetch(`${process.env.BACKEND_URL!}/api/topcontestants`)
    const topcontestants = await topcontestant.json()

    console.log("scoringtopcontestants", topcontestants.data?.topMales)

    return <ScoringPageComponent contestants={contestants} judge={judge} topFemales={topcontestants.topFemales.map((female: any) => female.contestant.id) ?? []} topMales={topcontestants.topMales.map((male: any) => male.contestant.id) ?? []} />
}
