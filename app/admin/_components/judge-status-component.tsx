'use client'

import { client } from "@/lib/treaty"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

export function JudgeStatusComponent({ initialJudges }: { initialJudges: { id: string, name: string, isLoggedIn: boolean }[] }) {
    const [judges, setJudges] = useState(initialJudges)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const fetchJudges = async () => {
            const fetchedJudges = await client.api["logged-in-judges"].get()
            console.log("fetchedJudges", fetchedJudges)
            setJudges(fetchedJudges?.data ?? [])
            setProgress(0)
        }

        fetchJudges()

        const intervalId = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    fetchJudges()
                    return 0
                }
                return Math.min(oldProgress + 2, 100)
            })
        }, 100)

        return () => clearInterval(intervalId)
    }, [])

    return (
        <div className='rounded-xl bg-white p-6 h-72 shadow-lg overflow-auto'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-purple-800'>Judge Status</h2>
                <Progress value={progress} className="w-[100px]" />
            </div>
            <ul className='space-y-2'>
                {judges.length > 0 ? judges.map((judge) => (
                    <li key={judge.id} className='flex items-center justify-between'>
                        <span className='text-gray-700'>{judge.name}</span>
                        {judge.isLoggedIn && (
                            <span className='px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full'>
                                Logged In
                            </span>
                        )}
                    </li>
                )) : (
                    <li className='text-gray-700'>No judges connected</li>
                )}
            </ul>
        </div>
    )
}
