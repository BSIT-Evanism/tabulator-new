import prisma from '@/lib/db'
import { User, Users, Trash, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { AddJudgeForm } from './add-judge-form'
import { revalidatePath } from 'next/cache'
import { AddConstestantForm } from './add-constestand-form'
import Link from 'next/link'
import StateChanger from './state-changer'
import { JudgeStatusComponent } from './judge-status-component'
import { Suspense } from 'react'
import { ImageUpload } from './image-upload'
import { FormalAttireSubCategory, QuestionAndAnswerSubCategory, SwimwearSubCategory } from '@prisma/client'

export async function AdminDashboardComponent() {
  const judgesCount = await prisma.judge.count()
  const judges = await prisma.judge.findMany()
  const contestantsCount = await prisma.contestant.count()

  async function handleDeleteJudge(data: FormData) {
    'use server'
    const judgeId = data.get('judgeId') as string
    const session = await getSession()
    if (!session.session) redirect('/admin')
    await prisma.judge.delete({ where: { id: judgeId } })
    revalidatePath('/admin/dashboard')
  }

  async function handleDeleteContestant(data: FormData) {
    'use server'
    const contestantId = data.get('contestantId') as string
    const session = await getSession()
    if (!session.session) redirect('/admin')
    await prisma.contestant.delete({ where: { id: contestantId } })
    revalidatePath('/admin/dashboard')
  }

  const dataVars = await prisma.tabulationDesignVariables.findFirst()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <StateChanger />
          <JudgeStatusComponent initialJudges={judges.map((judge) => ({ id: judge.id, name: judge.name, isLoggedIn: judge.isLoggedIn }))} />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <DashboardCard
            title="Candidates"
            count={contestantsCount}
            icon={<Users className="h-8 w-8 text-pink-400" />}
          >
            <AddConstestantForm />
          </DashboardCard>
          <DashboardCard
            title="Judges"
            count={judgesCount}
            icon={<User className="h-8 w-8 text-blue-400" />}
          >
            <AddJudgeForm />
          </DashboardCard>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className='flex items-center justify-between mb-6'>
            <h2 className="text-2xl font-bold text-purple-800 tracking-tight">Score Tally</h2>
            <Link href={'/admin/dashboard/scores'}>
              <Button variant={'outline'} className="group hover:bg-purple-100 transition-colors duration-300">
                View Full Scores
                <ChevronRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
              </Button>
            </Link>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {[
              { href: '/admin/dashboard/scores/swimwear', label: 'Swimwear', icon: '🏊‍♀️' },
              { href: '/admin/dashboard/scores/formalAttire', label: 'Formal', icon: '👗' },
              { href: '/admin/dashboard/scores/questionAndAnswer', label: 'Q&A', icon: '🎤' },
              { href: '/admin/dashboard/scores/finalRound', label: 'Final Round', icon: '🏆' },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href}>
                <Button variant={'outline'} className="w-full h-full py-4 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-300">
                  <span className="text-2xl">{icon}</span>
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-purple-800">Upload Images</h2>
          <ImageUpload eventName={dataVars?.eventName ?? "Model Pageant 2024"} color={dataVars?.color ?? "#FFC8DD"} icon={dataVars?.iconName ?? "icon.png"} />
        </div>
      </div>
      <div className="space-y-6 row-span-full">
        <Suspense fallback={<div>Loading...</div>}>
          <QuickStats />
        </Suspense>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <JudgeList onDelete={handleDeleteJudge} />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <ContestantList onDelete={handleDeleteContestant} />
      </Suspense>
      <p className='text-xs text-gray-500 text-center'>
        Made with ❤️ by <Link href="https://github.com/BSIT-Evanism" className='text-purple-500 underline' target="_blank">Evan Solanoy</Link> and GDSC Bicol University.
      </p>
    </div>
  )
}



function DashboardCard({ title, count, icon, children }: { title: string, count: number, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold text-purple-800">{title}</h2>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-3xl font-bold text-purple-600">{count}</span>
      </div>
      {children}
    </div>
  )
}

function ScoreTable() {
  const candidates = [
    { name: "Alice", round1: 85, round2: 88, round3: 92 },
    { name: "Bob", round1: 78, round2: 82, round3: 80 },
    { name: "Charlie", round1: 90, round2: 87, round3: 89 },
    { name: "Diana", round1: 82, round2: 85, round3: 88 },
    { name: "Eva", round1: 88, round2: 90, round3: 91 },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-2 text-left font-semibold text-purple-800">Candidate</th>
            <th className="pb-2 text-center font-semibold text-purple-800">Round 1</th>
            <th className="pb-2 text-center font-semibold text-purple-800">Round 2</th>
            <th className="pb-2 text-center font-semibold text-purple-800">Round 3</th>
            <th className="pb-2 text-right font-semibold text-purple-800">Total</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-2 text-left text-gray-800">{candidate.name}</td>
              <td className="py-2 text-center text-gray-800">{candidate.round1}</td>
              <td className="py-2 text-center text-gray-800">{candidate.round2}</td>
              <td className="py-2 text-center text-gray-800">{candidate.round3}</td>
              <td className="py-2 text-right font-medium text-purple-600">
                {candidate.round1 + candidate.round2 + candidate.round3}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

async function QuickStats() {
  const contestants = await prisma.contestant.findMany()
  const judges = await prisma.judge.findMany()

  const [swimwearScores, formalAttireScores, questionAndAnswerScores] = await Promise.all([
    prisma.swimwearScores.findMany({ include: { contestant: true, judge: true } }),
    prisma.formalAttireScores.findMany({ include: { contestant: true, judge: true } }),
    prisma.questionAndAnswerScores.findMany({ include: { contestant: true, judge: true } }),
  ])

  const calculateAverage = (scores: number[]) =>
    scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  const organizedScores = contestants.map(contestant => {
    const contestantScores = {
      swimwear: swimwearScores.filter(s => s.contestantId === contestant.id),
      formalAttire: formalAttireScores.filter(s => s.contestantId === contestant.id),
      questionAndAnswer: questionAndAnswerScores.filter(s => s.contestantId === contestant.id),
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
    ]

    const overallAverage = calculateAverage([
      ...contestantScores.swimwear,
      ...contestantScores.formalAttire,
      ...contestantScores.questionAndAnswer,
    ].map(s => s.score))

    return { contestant, categories, overallAverage }
  })

  // Separate contestants by gender
  const maleContestants = organizedScores.filter(score => score.contestant.gender === 'MALE')
  const femaleContestants = organizedScores.filter(score => score.contestant.gender === 'FEMALE')

  // Sort each group separately
  maleContestants.sort((a, b) => b.overallAverage - a.overallAverage)
  femaleContestants.sort((a, b) => b.overallAverage - a.overallAverage)

  // Calculate best performers for each category
  const getBestByCategory = (contestants: typeof organizedScores, categoryName: string) => {
    return contestants.reduce((best, current) => {
      const categoryAverage = current.categories.find(c => c.name === categoryName)?.average || 0
      return categoryAverage > (best?.average || 0) ? { name: current.contestant.name, average: categoryAverage } : best
    }, { name: 'N/A', average: 0 })
  }

  const bestSwimwearMale = getBestByCategory(maleContestants, 'Swimwear')
  const bestSwimwearFemale = getBestByCategory(femaleContestants, 'Swimwear')
  const bestFormalMale = getBestByCategory(maleContestants, 'Formal Attire')
  const bestFormalFemale = getBestByCategory(femaleContestants, 'Formal Attire')
  const bestQAMale = getBestByCategory(maleContestants, 'Question and Answer')
  const bestQAFemale = getBestByCategory(femaleContestants, 'Question and Answer')

  // Get top overall performers
  const topMale = maleContestants[0]?.contestant.name || 'N/A'
  const topFemale = femaleContestants[0]?.contestant.name || 'N/A'

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg h-full">
      <h2 className="mb-6 text-2xl font-bold text-purple-800">Quick Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCategory title="Swimwear">
          <StatItem label="Best Male" value={bestSwimwearMale.name} />
          <StatItem label="Best Female" value={bestSwimwearFemale.name} />
        </StatCategory>
        <StatCategory title="Formal Attire">
          <StatItem label="Best Male" value={bestFormalMale.name} />
          <StatItem label="Best Female" value={bestFormalFemale.name} />
        </StatCategory>
        <StatCategory title="Q&A">
          <StatItem label="Best Male" value={bestQAMale.name} />
          <StatItem label="Best Female" value={bestQAFemale.name} />
        </StatCategory>
        <StatCategory title="Overall - Initial Round">
          <StatItem label="Top Male" value={topMale} />
          <StatItem label="Top Female" value={topFemale} />
        </StatCategory>
      </div>
    </div>
  )
}

function StatCategory({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-purple-50 p-4 rounded-lg col-span-2">
      <h3 className="text-lg font-semibold text-purple-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-md">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="font-bold text-purple-600">{value}</span>
    </div>
  )
}

async function JudgeList({ onDelete }: { onDelete: (data: FormData) => void }) {
  const judges = await prisma.judge.findMany()

  return (
    <div className='rounded-xl bg-white p-6 shadow-lg overflow-hidden min-h-80 col-span-full'>
      <h2 className='text-xl font-semibold text-purple-800 mb-4'>Judge list</h2>
      <div className="max-h-72 overflow-auto">
        <table className='w-full'>
          <thead>
            <tr>
              <th className='text-left font-semibold text-purple-800'>ID</th>
              <th className='text-left font-semibold text-purple-800'>Name</th>
              <th className='text-left font-semibold text-purple-800'>Option</th>
            </tr>
          </thead>
          <tbody className='min-h-64 overflow-x-scroll'>
            {judges.length > 0 ? judges.map((judge, index) => (
              <tr key={index}>
                <td className='text-gray-700'>{judge.id.slice(0, 6)}...</td>
                <td className='text-gray-700'>{judge.name}</td>
                <td className='text-gray-700'>
                  <form action={onDelete}>
                    <input type="hidden" name="judgeId" value={judge.id} />
                    <Button type='submit' variant="ghost" size="sm">
                      <Trash className='w-4 h-4' />
                    </Button>
                  </form>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className='text-gray-700 text-center'>No judges found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function ContestantList({ onDelete }: { onDelete: (data: FormData) => void }) {
  const contestants = await prisma.contestant.findMany()

  return (
    <div className='rounded-xl bg-white p-6 shadow-lg overflow-hidden min-h-80 col-span-full'>
      <h2 className='text-xl font-semibold text-purple-800 mb-4'>Contestant list</h2>
      <div className="max-h-72 overflow-auto">
        <table className='w-full'>
          <thead>
            <tr>
              <th className='text-left font-semibold text-purple-800'>Name</th>
              <th className='text-left font-semibold text-purple-800'>Department</th>
              <th className='text-left font-semibold text-purple-800'>Option</th>
            </tr>
          </thead>
          <tbody className='min-h-64 overflow-x-scroll'>
            {contestants.length > 0 ? contestants.map((contestant, index) => (
              <tr key={index}>
                <td className='text-gray-700'>{contestant.name}</td>
                <td className='text-gray-700'>{contestant.department}</td>
                <td className='text-gray-700'>
                  <form action={onDelete}>
                    <input type="hidden" name="contestantId" value={contestant.id} />
                    <Button type='submit' variant="ghost" size="sm">
                      <Trash className='w-4 h-4' />
                    </Button>
                  </form>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className='text-gray-700 text-center'>No contestants found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
