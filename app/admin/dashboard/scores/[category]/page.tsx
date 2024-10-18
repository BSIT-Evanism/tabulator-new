import prisma from "@/lib/db"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { client } from "@/lib/treaty"

const formatText = (text: string) => {
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

export const dynamic = 'force-dynamic';

export default async function CategoryScoresPage({ params }: { params: { category: string } }) {
    const category = params.category.toUpperCase()
    const contestants = await prisma.contestant.findMany()
    const judges = await prisma.judge.findMany()

    let scores
    switch (category) {
        case 'SWIMWEAR':
            scores = await prisma.swimwearScores.findMany({ include: { contestant: true, judge: true } })
            break
        case 'FORMALATTIRE':
            scores = await prisma.formalAttireScores.findMany({ include: { contestant: true, judge: true } })
            break
        case 'QUESTIONANDANSWER':
            scores = await prisma.questionAndAnswerScores.findMany({ include: { contestant: true, judge: true } })
            break
        case 'FINALROUND':
            scores = await prisma.finalRoundScores.findMany({ include: { contestant: true, judge: true } })
            break
        default:
            throw new Error(`Invalid category: ${category}`)
    }

    // const topcontestanttest = await client.api.topcontestants.get()
    const topcontestant = await fetch(`${process.env.BACKEND_URL!}/api/topcontestants`)
    const topcontestants = await topcontestant.json()

    console.log("topcontestantsfinalmale", topcontestants.topMales)
    console.log("topcontestantsfinalfemale", topcontestants.topFemales)

    const topMaleArray = topcontestants.topMales.map((male: any) => male.contestant.id) ?? []
    const topFemaleArray = topcontestants.topFemales.map((female: any) => female.contestant.id) ?? []

    const organizedScores = contestants.map(contestant => {
        const contestantScores = scores.filter(s => s.contestantId === contestant.id)

        const judgeScores = judges.map(judge => ({
            judge,
            score: contestantScores.filter(s => s.judgeId === judge.id).reduce((sum, s) => sum + s.score, 0)
        }))

        const totalScore = judgeScores.reduce((sum, js) => sum + js.score, 0)
        const averageScore = totalScore / judges.length

        return { contestant, judgeScores, totalScore, averageScore }
    })

    const maleContestants = organizedScores.filter(score =>
        score.contestant.gender === 'MALE' &&
        (category !== 'FINALROUND' || topMaleArray.includes(score.contestant.id))
    ).sort((a, b) => a.contestant.contestantNumber - b.contestant.contestantNumber)

    const femaleContestants = organizedScores.filter(score =>
        score.contestant.gender === 'FEMALE' &&
        (category !== 'FINALROUND' || topFemaleArray.includes(score.contestant.id))
    ).sort((a, b) => a.contestant.contestantNumber - b.contestant.contestantNumber)

    const addRankings = (contestants) => {
        return contestants.map((contestant, index, array) => ({
            ...contestant,
            rank: array.filter(c => c.totalScore > contestant.totalScore).length + 1
        }))
    }

    const rankedMaleContestants = addRankings(maleContestants)
    const rankedFemaleContestants = addRankings(femaleContestants)

    const renderTable = (contestants) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Candidate Number</TableHead>
                    <TableHead>Department</TableHead>
                    {judges.map(judge => (
                        <TableHead key={judge.id}>Judge {judge.name}</TableHead>
                    ))}
                    <TableHead>Total Score</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Rank</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {contestants.map(({ contestant, judgeScores, totalScore, averageScore, rank }) => (
                    <TableRow key={contestant.id}>
                        <TableCell>{contestant.contestantNumber}</TableCell>
                        <TableCell>{contestant.department}</TableCell>
                        {judgeScores.map(({ judge, score }) => (
                            <TableCell key={judge.id}>{score}</TableCell>
                        ))}
                        <TableCell>{totalScore}</TableCell>
                        <TableCell>{averageScore.toFixed(2)}</TableCell>
                        <TableCell>{rank}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">{formatText(category)} Scores</h1>
            <Link href="/admin/dashboard/scores">
                <Button variant="outline" className="absolute top-[10vh] left-4">Back to All Scores</Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Male Contestants</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderTable(rankedMaleContestants)}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Female Contestants</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderTable(rankedFemaleContestants)}
                </CardContent>
            </Card>
        </div>
    )
}
