import prisma from "@/lib/db"
import { SwimwearSubCategory, FormalAttireSubCategory, QuestionAndAnswerSubCategory, FinalRoundSubCategory } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";
import { Button } from "@/components/ui/button";

const formatText = (text: string) => {
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default async function ScoresPage() {
    const contestants = await prisma.contestant.findMany()
    const judges = await prisma.judge.findMany()

    const [swimwearScores, formalAttireScores, questionAndAnswerScores, finalRoundScores] = await Promise.all([
        prisma.swimwearScores.findMany({ include: { contestant: true, judge: true } }),
        prisma.formalAttireScores.findMany({ include: { contestant: true, judge: true } }),
        prisma.questionAndAnswerScores.findMany({ include: { contestant: true, judge: true } }),
        prisma.finalRoundScores.findMany({ include: { contestant: true, judge: true } })
    ])

    const calculateAverage = (scores: number[]) =>
        scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    const organizedScores = contestants.map(contestant => {
        const contestantScores = {
            swimwear: swimwearScores.filter(s => s.contestantId === contestant.id),
            formalAttire: formalAttireScores.filter(s => s.contestantId === contestant.id),
            questionAndAnswer: questionAndAnswerScores.filter(s => s.contestantId === contestant.id),
            finalRound: finalRoundScores.filter(s => s.contestantId === contestant.id)
        }

        const categories = [
            {
                name: "Swimwear",
                subCategories: Object.values(SwimwearSubCategory).map(subCategory => ({
                    name: subCategory,
                    judgeScores: judges.map(judge => ({
                        judge,
                        score: contestantScores.swimwear.find(s => s.subCategory === subCategory && s.judgeId === judge.id)?.score || 0
                    })),
                    average: calculateAverage(contestantScores.swimwear.filter(s => s.subCategory === subCategory).map(s => s.score))
                })),
                average: calculateAverage(contestantScores.swimwear.map(s => s.score))
            },
            {
                name: "Formal Attire",
                subCategories: Object.values(FormalAttireSubCategory).map(subCategory => ({
                    name: subCategory,
                    judgeScores: judges.map(judge => ({
                        judge,
                        score: contestantScores.formalAttire.find(s => s.subCategory === subCategory && s.judgeId === judge.id)?.score || 0
                    })),
                    average: calculateAverage(contestantScores.formalAttire.filter(s => s.subCategory === subCategory).map(s => s.score))
                })),
                average: calculateAverage(contestantScores.formalAttire.map(s => s.score))
            },
            {
                name: "Question and Answer",
                subCategories: Object.values(QuestionAndAnswerSubCategory).map(subCategory => ({
                    name: subCategory,
                    judgeScores: judges.map(judge => ({
                        judge,
                        score: contestantScores.questionAndAnswer.find(s => s.subCategory === subCategory && s.judgeId === judge.id)?.score || 0
                    })),
                    average: calculateAverage(contestantScores.questionAndAnswer.filter(s => s.subCategory === subCategory).map(s => s.score))
                })),
                average: calculateAverage(contestantScores.questionAndAnswer.map(s => s.score))
            },
            {
                name: "Final Round",
                subCategories: Object.values(FinalRoundSubCategory).map(subCategory => ({
                    name: subCategory,
                    judgeScores: judges.map(judge => ({
                        judge,
                        score: contestantScores.finalRound.find(s => s.subCategory === subCategory && s.judgeId === judge.id)?.score || 0
                    })),
                    average: calculateAverage(contestantScores.finalRound.filter(s => s.subCategory === subCategory).map(s => s.score))
                })),
                average: calculateAverage(contestantScores.finalRound.map(s => s.score))
            }
        ]

        const overallAverage = calculateAverage([
            ...contestantScores.swimwear,
            ...contestantScores.formalAttire,
            ...contestantScores.questionAndAnswer,
            ...contestantScores.finalRound
        ].map(s => s.score))

        return { contestant, categories, overallAverage }
    })

    // Separate contestants by gender
    const maleContestants = organizedScores.filter(score => score.contestant.gender === 'MALE')
    const femaleContestants = organizedScores.filter(score => score.contestant.gender === 'FEMALE')

    // Sort each group separately
    maleContestants.sort((a, b) => b.overallAverage - a.overallAverage)
    femaleContestants.sort((a, b) => b.overallAverage - a.overallAverage)

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">Detailed Scores</h1>
            <Link href="/admin/dashboard">
                <Button variant="outline" className="absolute top-[10vh] left-4">Back to Dashboard</Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 mb-8">
                    <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Male Contestants</h2>
                    {renderContestants(maleContestants)}
                </div>
                <div className="flex-1 mb-8">
                    <h2 className="text-2xl font-bold text-center text-pink-700 mb-4">Female Contestants</h2>
                    {renderContestants(femaleContestants)}
                </div>
            </div>
        </div>
    )
}

function renderContestants(contestants: any[]) {
    return contestants.map(({ contestant, categories, overallAverage }, index) => (
        <Card key={contestant.id} className={`rounded-lg mb-4 ${index === 0 ? 'bg-yellow-100 border-4 border-yellow-400' :
            index === 1 ? 'bg-gray-100 border-4 border-gray-400' :
                index === 2 ? 'bg-amber-100 border-4 border-amber-700' :
                    'bg-slate-50'
            }`}>
            <CardHeader>
                <CardTitle className="flex items-center">
                    {index === 0 && <span className="text-yellow-500 mr-2">🥇 1st</span>}
                    {index === 1 && <span className="text-gray-500 mr-2">🥈 2nd</span>}
                    {index === 2 && <span className="text-amber-700 mr-2">🥉 3rd</span>}
                    <span className="mr-2">#{index + 1}</span>
                    Contestant: {contestant.name} - Overall Average: {overallAverage.toFixed(2)}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {categories.map((category) => (
                    <div key={category.name} className="mb-8">
                        <h3 className="text-2xl font-semibold mb-4 text-indigo-700">
                            {formatText(category.name)} - Average: {category.average.toFixed(2)}
                        </h3>
                        {category.subCategories.map((subCategory) => (
                            <div key={subCategory.name} className="mb-6">
                                <h4 className="text-xl font-medium mb-3 text-indigo-600">
                                    {formatText(subCategory.name)} - Average: {subCategory.average.toFixed(2)}
                                </h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Judge</TableHead>
                                            <TableHead>Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subCategory.judgeScores.map(({ judge, score }) => (
                                            <TableRow key={judge.id}>
                                                <TableCell>Judge: {judge.name}</TableCell>
                                                <TableCell>Score: {score}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}
                    </div>
                ))}
            </CardContent>
        </Card>
    ))
}
