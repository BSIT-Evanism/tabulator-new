'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TreePalm, Shirt, MessageSquare, LogOutIcon, Trophy, Heart, ThumbsDown, Lock } from 'lucide-react'
import { Contestant, Judge } from '@prisma/client'
import { useStateStore } from '@/lib/state-ws'
import { ScrollArea } from '@/components/ui/scroll-area'
import { judgeLogoutAction } from '../_actions/judge-logout'
import { submitSwimwearScore, submitFormalAttireScore, submitQuestionAndAnswerScore, submitFinalRoundScores } from '../_actions/judge-submit'
import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'
import { client } from '@/lib/treaty'
import { Badge } from '@/components/ui/badge'
import { CustomToast } from '@/components/custom-toast'
import { cn } from '@/lib/utils'

const categories = [
  {
    id: 'swimwear',
    name: 'Swimwear',
    icon: <TreePalm className="w-4 h-4" />,
    subCategories: ['BEAUTY_OF_FIGURE', 'STAGE_PRESENCE', 'POISE_AND_BEARING']
  },
  {
    id: 'formalAttire',
    name: 'Formal Attire',
    icon: <Shirt className="w-4 h-4" />,
    subCategories: ['ATTIRE_AND_CARRIAGE', 'STAGE_PRESENCE', 'POISE_AND_BEARING']
  },
  {
    id: 'questionAndAnswer',
    name: 'Q&A',
    icon: <MessageSquare className="w-4 h-4" />,
    subCategories: ['INTELLIGENCE', 'POISE_AND_PERSONALITY']
  },
  {
    id: 'finalRound',
    name: 'Final Round',
    icon: <Trophy className="w-4 h-4" />,
    subCategories: ['INTELLIGENCE_AND_WIT', 'POISE_CONFIDENCE_AND_PERSONALITY']
  }
]

const maxScoresOuter = {
  swimwear: {
    BEAUTY_OF_FIGURE: 15,
    STAGE_PRESENCE: 5,
    POISE_AND_BEARING: 5
  },
  formalAttire: {
    ATTIRE_AND_CARRIAGE: 15,
    STAGE_PRESENCE: 5,
    POISE_AND_BEARING: 5
  },
  questionAndAnswer: {
    INTELLIGENCE: 25,
    POISE_AND_PERSONALITY: 25
  },
  finalRound: {
    INTELLIGENCE_AND_WIT: 50,
    POISE_CONFIDENCE_AND_PERSONALITY: 50
  }
}

const ScoreInput = ({ category, contestant, subCategory, value, onChange }: { category: typeof categories[number], contestant: Contestant, subCategory: string, value: number, onChange: (contestantId: string, categoryId: string, subCategory: string, score: number | null) => void }) => {
  const [localValue, setLocalValue] = useState(value?.toString() ?? '')

  // Hard-coded max values
  const maxScores = {
    swimwear: {
      BEAUTY_OF_FIGURE: 15,
      STAGE_PRESENCE: 5,
      POISE_AND_BEARING: 5
    },
    formalAttire: {
      ATTIRE_AND_CARRIAGE: 15,
      STAGE_PRESENCE: 5,
      POISE_AND_BEARING: 5
    },
    questionAndAnswer: {
      INTELLIGENCE: 25,
      POISE_AND_PERSONALITY: 25
    },
    finalRound: {
      INTELLIGENCE_AND_WIT: 50,
      POISE_CONFIDENCE_AND_PERSONALITY: 50
    }
  }

  const maxScore = maxScores[category.id as keyof typeof maxScores]?.[subCategory as keyof (typeof maxScores)[keyof typeof maxScores]] ?? 25

  useEffect(() => {
    setLocalValue(value?.toString() ?? '')
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue === '' || (/^\d+$/.test(newValue) && parseInt(newValue) <= maxScore)) {
      setLocalValue(newValue)
      onChange(contestant.id, category.id, subCategory, newValue === '' ? null : Number(newValue))
    }
  }

  const getScoreColor = (score: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage === 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-green-400'
    if (percentage >= 50) return 'bg-yellow-400'
    if (percentage >= 25) return 'bg-orange-400'
    return 'bg-red-400'
  }

  return (
    <motion.div
      className="flex justify-center items-center gap-2 p-1 bg-white rounded-lg overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`absolute top-0 left-0 h-full z-0 transition-all duration-300 ${getScoreColor(Number(localValue))}`}
        style={{ width: `${(Number(localValue) / maxScore) * 100}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${(Number(localValue) / maxScore) * 100}%` }}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        id={`${category.id}-${contestant.id}-${subCategory}`}
        className="w-24 h-10 p-2 text-lg rounded-md bg-transparent z-10 focus:outline-none text-center"
        value={localValue}
        onChange={handleInputChange}
      />
      <span className="text-sm text-gray-500 absolute right-[-40px]">/{maxScore}</span>
      <AnimatePresence>
        {Number(localValue) === maxScore && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-2 z-20"
          >
            <Heart className="text-red-500 w-6 h-6 fill-current" />
          </motion.div>
        )}
        {Number(localValue) === 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-2 z-20"
          >
            <ThumbsDown className="text-blue-500 w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ScoringPageComponent({ contestants, judge, topMales, topFemales }: { contestants: Contestant[], judge: Judge | null, topMales: string[], topFemales: string[] }) {
  const [scores, setScores] = useState<Record<string, Record<string, Record<string, number>>>>({})
  const [initialScores, setInitialScores] = useState<Record<string, Record<string, Record<string, number>>>>({})
  const { currentState, connect, disconnect, isLocked } = useStateStore()
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({})

  // const { execute: executeGetScores } = useAction(getScores)
  const { execute: executeSubmitSwimwear } = useAction(submitSwimwearScore)
  const { execute: executeSubmitFormalAttire } = useAction(submitFormalAttireScore)
  const { execute: executeSubmitQuestionAndAnswer } = useAction(submitQuestionAndAnswerScore)
  const { execute: executeFinalRoundScores } = useAction(submitFinalRoundScores)

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  useEffect(() => {
    if (judge && currentState) {
      fetchScores(judge.id, currentState)
    }
  }, [judge, currentState])

  const fetchScores = async (judgeId: string, category: string) => {
    try {
      const result = await client.api.scores({ category }).get({ query: { judgeId } })
      if (result.data) {
        const formattedScores = result.data.scores.reduce((acc: Record<string, Record<string, number>>, score: any) => {
          if (!acc[score.contestantId]) {
            acc[score.contestantId] = {}
          }
          acc[score.contestantId][score.subCategory] = score.score
          return acc
        }, {} as Record<string, Record<string, number>>)
        setScores(prevScores => ({ ...prevScores, [category]: formattedScores }))
        setInitialScores(prevScores => ({ ...prevScores, [category]: JSON.parse(JSON.stringify(formattedScores)) }))
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
      toast.error('Failed to fetch scores')
    }
  }

  const handleScoreChange = (contestantId: string, category: string, subCategory: string, score: number | null) => {
    setScores(prevScores => ({
      ...prevScores,
      [category]: {
        ...prevScores[category],
        [contestantId]: {
          ...prevScores[category]?.[contestantId],
          [subCategory]: score
        }
      }
    }))

    // Check if the new score is different from the initial score
    const initialScore = initialScores[category]?.[contestantId]?.[subCategory]
    const hasChange = score !== initialScore
    setHasChanges(prev => ({ ...prev, [category]: hasChange || prev[category] || false }))
  }

  const handleSubmit = async (category: string) => {
    if (!judge) return

    const submitAction = {
      swimwear: executeSubmitSwimwear,
      formalAttire: executeSubmitFormalAttire,
      questionAndAnswer: executeSubmitQuestionAndAnswer,
      finalRound: executeFinalRoundScores
    }[category]

    if (!submitAction) {
      console.error('Invalid category')
      return
    }

    let changedScores = 0
    let failedSubmissions = 0

    for (const contestantId in scores[category]) {
      for (const subCategory in scores[category][contestantId]) {
        const newScore = scores[category][contestantId][subCategory]
        const oldScore = initialScores[category]?.[contestantId]?.[subCategory]

        if (newScore !== oldScore) {
          try {
            await submitAction({
              judgeId: judge.id,
              contestantId,
              // @ts-expect-error - subCategory type mismatch with API expectation
              subCategory: subCategory,
              score: newScore
            })
            changedScores++
          } catch (error) {
            console.error('Error submitting score:', error)
            failedSubmissions++
          }
        }
      }
    }

    if (changedScores > 0) {
      if (failedSubmissions > 0) {
        toast.custom((t) => <CustomToast title='Submission Failed' t={t} state="warning" message={`Submitted ${changedScores} changed scores, but ${failedSubmissions} submissions failed.`} />)
      } else {
        toast.custom((t) => <CustomToast title='Submission Successful' t={t} state="success" message={`Successfully submitted ${changedScores} changed scores.`} />)
      }
      // Update initialScores with the new scores
      setInitialScores(prevScores => ({
        ...prevScores,
        [category]: JSON.parse(JSON.stringify(scores[category]))
      }))
      setHasChanges(prev => ({ ...prev, [category]: false }))
    } else {
      toast.custom((t) => <CustomToast title='No Changes' t={t} state="info" message="No changes were made to the scores." />)
    }
  }

  const judgeLogout = async () => {
    await judgeLogoutAction()
  }

  // Add this sorting function
  const sortedContestants = [...contestants].sort((a, b) =>
    a.contestantNumber - b.contestantNumber
  );

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-8", isLocked ? 'cursor-not-allowed' : '')}>
      <Button variant="link" className='absolute top-4 right-4' onClick={judgeLogout}><LogOutIcon className="w-4 h-4 mr-2" />Logout</Button>
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">MMBU 2024 Scoring</h1>

      {/* Display current state */}
      <div className="mb-4 text-center">
        <span className="font-semibold">Current Stage: </span>
        <span className="text-purple-600">{currentState || 'Not set'}</span>
      </div>
      <AnimatePresence>
        {isLocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen backdrop-blur-sm bg-pink-100/70 fixed z-20 top-0 left-0 w-full h-full flex flex-col items-center justify-center p-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-col items-center mb-6">
                <Lock className="w-20 h-20 text-gray-600 mb-4" />
                <h1 className="text-3xl font-bold text-purple-700 mb-2">MMBU 2024 Scoring</h1>
                <p className="text-gray-600 text-center">
                  The scoring is currently hidden and locked. Please wait for tabulators to unlock the scoring.
                </p>
              </div>

              <div className="bg-gray-100 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-purple-700 mb-2">Notice</h2>
                <p className="text-gray-600">
                  This is to prevent judges from changing scores after the event has ended and making the results hidden.
                </p>
              </div>

              <div className="flex justify-center">
                <button className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition-colors duration-300" disabled>
                  Locked
                </button>
              </div>
            </motion.div>
          </motion.div>

        )}
      </AnimatePresence>

      <Tabs defaultValue={categories[0].id} value={currentState ?? categories[0].id} className="w-full max-w-7xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          {categories.map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center justify-center"
              disabled={currentState !== category.id}
            >
              {category.icon}
              <span className="ml-2">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <Card className='h-[75vh]'>
              <CardHeader>
                <CardTitle className="text-2xl text-purple-700">{category.name} Scoring</CardTitle>
                <CardDescription>Enter scores for each contestant in the {category.name} category.</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <ScrollArea className="h-[60vh] bg-slate-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        {currentState !== 'finalRound' ? sortedContestants
                          .filter(contestant =>
                            (contestant.gender === 'MALE'))
                          .map(contestant => (
                            <div key={contestant.id} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Contestant {contestant.contestantNumber}</h3>
                                <Badge variant="outline" className="text-sm uppercase rounded-full bg-blue-500 text-white">MALE</Badge>
                              </div>
                              {category.subCategories.map(subCategory => (
                                <div key={subCategory} className="flex items-center space-x-4 w-fit">
                                  <Label htmlFor={`${category.id}-${contestant.id}-${subCategory}`} className="w-40 text-right">{subCategory.replace(/_/g, ' ')}</Label>
                                  <ScoreInput
                                    category={category}
                                    contestant={contestant}
                                    subCategory={subCategory}
                                    value={scores[category.id]?.[contestant.id]?.[subCategory]}
                                    onChange={handleScoreChange}
                                  />
                                  <span className="text-sm text-gray-500 ml-2">
                                    Max: {maxScoresOuter[category.id as keyof typeof maxScoresOuter]?.[subCategory as keyof (typeof maxScoresOuter)[keyof typeof maxScoresOuter]] ?? 15}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )) : sortedContestants.filter(contestant => (contestant.gender === 'MALE' && topMales.includes(contestant.id))).map(contestant => (
                            <div key={contestant.id} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Contestant {contestant.contestantNumber}</h3>
                                <Badge variant="outline" className="text-sm uppercase rounded-full bg-blue-500 text-white">MALE</Badge>
                              </div>
                              {category.subCategories.map(subCategory => (
                                <div key={subCategory} className="flex items-center space-x-4 w-fit">
                                  <Label htmlFor={`${category.id}-${contestant.id}-${subCategory}`} className="w-40 text-right">{subCategory.replace(/_/g, ' ')}</Label>
                                  <ScoreInput
                                    category={category}
                                    contestant={contestant}
                                    subCategory={subCategory}
                                    value={scores[category.id]?.[contestant.id]?.[subCategory]}
                                    onChange={handleScoreChange}
                                  />
                                  <span className="text-sm text-gray-500 ml-2">
                                    Max: {maxScoresOuter[category.id as keyof typeof maxScoresOuter]?.[subCategory as keyof (typeof maxScoresOuter)[keyof typeof maxScoresOuter]] ?? 15}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                      </div>
                      <div className="space-y-4">
                        {currentState !== 'finalRound' ? sortedContestants
                          .filter(contestant =>
                            contestant.gender === 'FEMALE')
                          .map(contestant => (
                            <div key={contestant.id} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Contestant {contestant.contestantNumber}</h3>
                                <Badge variant="outline" className="text-sm uppercase rounded-full bg-pink-500 text-white">FEMALE</Badge>
                              </div>
                              {category.subCategories.map(subCategory => (
                                <div key={subCategory} className="flex items-center space-x-4 w-fit">
                                  <Label htmlFor={`${category.id}-${contestant.id}-${subCategory}`} className="w-40 text-right">{subCategory.replace(/_/g, ' ')}</Label>
                                  <ScoreInput
                                    category={category}
                                    contestant={contestant}
                                    subCategory={subCategory}
                                    value={scores[category.id]?.[contestant.id]?.[subCategory]}
                                    onChange={handleScoreChange}
                                  />
                                  <span className="text-sm text-gray-500 ml-2">
                                    Max: {maxScoresOuter[category.id as keyof typeof maxScoresOuter]?.[subCategory as keyof (typeof maxScoresOuter)[keyof typeof maxScoresOuter]] ?? 15}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )) : sortedContestants.filter(contestant => (contestant.gender === 'FEMALE' && topFemales.includes(contestant.id))).map(contestant => (
                            <div key={contestant.id} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Contestant {contestant.contestantNumber}</h3>
                                <Badge variant="outline" className="text-sm uppercase rounded-full bg-pink-500 text-white">FEMALE</Badge>
                              </div>
                              {category.subCategories.map(subCategory => (
                                <div key={subCategory} className="flex items-center space-x-4 w-fit">
                                  <Label htmlFor={`${category.id}-${contestant.id}-${subCategory}`} className="w-40 text-right">{subCategory.replace(/_/g, ' ')}</Label>
                                  <ScoreInput
                                    category={category}
                                    contestant={contestant}
                                    subCategory={subCategory}
                                    value={scores[category.id]?.[contestant.id]?.[subCategory]}
                                    onChange={handleScoreChange}
                                  />
                                  <span className="text-sm text-gray-500 ml-2">
                                    Max: {maxScoresOuter[category.id as keyof typeof maxScoresOuter]?.[subCategory as keyof (typeof maxScoresOuter)[keyof typeof maxScoresOuter]] ?? 15}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                      </div>
                    </div>
                  </ScrollArea>
                </motion.div>
                <p className='text-xs text-gray-500 text-center'>
                  Scroll to see more contestants
                </p>
              </CardContent>
            </Card>
            <Button
              className={`mt-6 w-full ${hasChanges[category.id]
                ? 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600'
                : 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600'
                } text-white`}
              onClick={() => handleSubmit(category.id)}
            >
              {hasChanges[category.id] ? 'Submit Changes' : 'No Changes to Submit'}
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
