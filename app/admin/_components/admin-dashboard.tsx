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
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className='flex items-center justify-between mb-4'>
            <h2 className="text-xl font-semibold text-purple-800">Score Tally</h2>
            <Link href={'/admin/dashboard/scores'}>
              <Button variant={'outline'}>
                View Full Scores <ChevronRight className='w-4 h-4 ml-2' />
              </Button>
            </Link>
          </div>
          <ScoreTable />
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
  const swimwearBest = await prisma.swimwearScores.groupBy({
    by: ['contestantId'],
    _avg: {
      score: true,
    },
    orderBy: {
      _avg: {
        score: 'desc',
      },
    },
    take: 1,
  });

  const formalBest = await prisma.formalAttireScores.groupBy({
    by: ['contestantId'],
    _avg: {
      score: true,
    },
    orderBy: {
      _avg: {
        score: 'desc',
      },
    },
    take: 1,
  });

  const qaBest = await prisma.questionAndAnswerScores.groupBy({
    by: ['contestantId'],
    _avg: {
      score: true,
    },
    orderBy: {
      _avg: {
        score: 'desc',
      },
    },
    take: 1,
  });

  const [bestSwimwearContestant, bestFormalContestant, bestQAContestant] = await Promise.all([
    prisma.contestant.findFirst({ where: { id: swimwearBest[0]?.contestantId }, select: { name: true } }),
    prisma.contestant.findFirst({ where: { id: formalBest[0]?.contestantId }, select: { name: true } }),
    prisma.contestant.findFirst({ where: { id: qaBest[0]?.contestantId }, select: { name: true } }),
  ]);

  const topCandidateResult = await prisma.$queryRaw`
    SELECT c.id, c.name,
      (COALESCE(s.avg_score, 0) + COALESCE(f.avg_score, 0) + COALESCE(q.avg_score, 0)) as total_score
    FROM "Contestant" c
    LEFT JOIN (
      SELECT "contestantId", AVG(score) as avg_score
      FROM "SwimwearScores"
      GROUP BY "contestantId"
    ) s ON c.id = s."contestantId"
    LEFT JOIN (
      SELECT "contestantId", AVG(score) as avg_score
      FROM "FormalAttireScores"
      GROUP BY "contestantId"
    ) f ON c.id = f."contestantId"
    LEFT JOIN (
      SELECT "contestantId", AVG(score) as avg_score
      FROM "QuestionAndAnswerScores"
      GROUP BY "contestantId"
    ) q ON c.id = q."contestantId"
    ORDER BY total_score DESC
    LIMIT 1
  `;

  //@ts-expect-error - topCandidateResult is typed as any
  const topCandidate = topCandidateResult[0];

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg h-full">
      <h2 className="mb-4 text-xl font-semibold text-purple-800">Quick Stats</h2>
      <div className="space-y-4">
        <StatItem label="Best in Swimwear" value={bestSwimwearContestant?.name ?? 'N/A'} />
        <StatItem label="Best in Formal" value={bestFormalContestant?.name ?? 'N/A'} />
        <StatItem label="Best in Q&A" value={bestQAContestant?.name ?? 'N/A'} />
        <StatItem label="Top Candidate" value={topCandidate?.name ?? 'N/A'} />
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium text-purple-600">{value}</span>
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
