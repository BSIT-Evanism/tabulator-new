'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { SwimwearSubCategory, FormalAttireSubCategory, QuestionAndAnswerSubCategory, FinalRoundSubCategory } from '@prisma/client'
import { protectedClient } from '@/lib/safe-action'
import { z } from 'zod'

const scoreSchema = z.object({
    judgeId: z.string(),
    contestantId: z.string(),
    score: z.number().int().min(0).max(100),
    subCategory: z.enum(['BEAUTY_OF_FIGURE', 'STAGE_PRESENCE', 'POISE_AND_BEARING', 'ATTIRE_AND_CARRIAGE', 'INTELLIGENCE', 'POISE_AND_PERSONALITY', 'INTELLIGENCE_AND_WIT', 'POISE_CONFIDENCE_AND_PERSONALITY'])
})

export const getScores = protectedClient.schema(
    z.object({
        judgeId: z.string(),
        category: z.enum(['swimwear', 'formalAttire', 'questionAndAnswer'])
    })
).action(async ({ parsedInput: { judgeId, category } }) => {
    let scores;
    switch (category) {
        case 'swimwear':
            scores = await prisma.swimwearScores.findMany({
                where: {
                    judgeId
                }
            });
            break;
        case 'formalAttire':
            scores = await prisma.formalAttireScores.findMany({
                where: {
                    judgeId
                }
            });
            break;
        case 'questionAndAnswer':
            scores = await prisma.questionAndAnswerScores.findMany({
                where: {
                    judgeId
                }
            });
            break;
        default:
            throw new Error('Invalid category');
    }

    return { scores }
})

export const submitSwimwearScore = protectedClient.schema(scoreSchema).action(
    async ({ parsedInput: { judgeId, contestantId, score, subCategory } }) => {
        await prisma.$transaction(async (tx) => {
            const existingScore = await tx.swimwearScores.findFirst({
                where: {
                    judgeId,
                    contestantId,
                    subCategory: subCategory as SwimwearSubCategory
                }
            })

            if (existingScore) {
                await tx.swimwearScores.update({
                    where: { id: existingScore.id },
                    data: { score }
                })
            } else {
                await tx.swimwearScores.create({
                    data: {
                        judgeId,
                        contestantId,
                        subCategory: subCategory as SwimwearSubCategory,
                        score
                    }
                })
            }
        })

        revalidatePath('/judges/scoring')
        return { success: true }
    }
)

export const submitFormalAttireScore = protectedClient.schema(scoreSchema).action(
    async ({ parsedInput: { judgeId, contestantId, score, subCategory } }) => {
        await prisma.$transaction(async (tx) => {
            const existingScore = await tx.formalAttireScores.findFirst({
                where: {
                    judgeId,
                    contestantId,
                    subCategory: subCategory as FormalAttireSubCategory
                }
            })

            if (existingScore) {
                await tx.formalAttireScores.update({
                    where: { id: existingScore.id },
                    data: { score }
                })
            } else {
                await tx.formalAttireScores.create({
                    data: {
                        judgeId,
                        contestantId,
                        subCategory: subCategory as FormalAttireSubCategory,
                        score
                    }
                })
            }
        })

        revalidatePath('/judges/scoring')
        return { success: true }
    }
)

export const submitQuestionAndAnswerScore = protectedClient.schema(scoreSchema).action(
    async ({ parsedInput: { judgeId, contestantId, score, subCategory } }) => {
        await prisma.$transaction(async (tx) => {
            const existingScore = await tx.questionAndAnswerScores.findFirst({
                where: {
                    judgeId,
                    contestantId,
                    subCategory: subCategory as QuestionAndAnswerSubCategory
                }
            })

            if (existingScore) {
                await tx.questionAndAnswerScores.update({
                    where: { id: existingScore.id },
                    data: { score }
                })
            } else {
                await tx.questionAndAnswerScores.create({
                    data: {
                        judgeId,
                        contestantId,
                        subCategory: subCategory as QuestionAndAnswerSubCategory,
                        score
                    }
                })
            }
        })

        revalidatePath('/judges/scoring')
        return { success: true }
    }
)

export const submitFinalRoundScores = protectedClient.schema(scoreSchema).action(
    async ({ parsedInput: { judgeId, contestantId, score, subCategory } }) => {
        await prisma.$transaction(async (tx) => {
            const existingScore = await tx.finalRoundScores.findFirst({
                where: {
                    judgeId,
                    contestantId,
                    subCategory: subCategory as FinalRoundSubCategory
                }
            })

            if (existingScore) {
                await tx.finalRoundScores.update({
                    where: { id: existingScore.id },
                    data: { score }
                })
            } else {
                await tx.finalRoundScores.create({
                    data: {
                        judgeId,
                        contestantId,
                        subCategory: subCategory as FinalRoundSubCategory,
                        score
                    }
                })
            }
        })

        revalidatePath('/judges/scoring')
        return { success: true }
    }
)
