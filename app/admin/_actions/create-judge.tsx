'use server'

import prisma from "@/lib/db"
import { protectedClient } from "@/lib/safe-action"
import { judgeSchema } from "@/lib/zod-schema"
import { revalidatePath } from "next/cache"

export const createJudgeAction = protectedClient.use(async ({ ctx, next }) => {

    if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    return next()

}).schema(judgeSchema).action(async ({ parsedInput }) => {
    const { name, password } = parsedInput

    const judge = await prisma.judge.create({
        data: {
            name,
            generatedPassword: password,
            isLoggedIn: false,
        }
    })

    revalidatePath('/admin/dashboard')

    return {
        judge
    }

})