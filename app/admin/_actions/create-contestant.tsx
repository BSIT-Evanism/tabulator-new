'use server'

import prisma from "@/lib/db";
import { protectedClient } from "@/lib/safe-action";
import { contestantSchema } from "@/lib/zod-schema";
import { revalidatePath } from "next/cache";


export const createContestantAction = protectedClient.use(async ({ ctx, next }) => {

    if (ctx.user.role !== 'admin') {
        throw new Error('You are not authorized to create a contestant')
    }

    return next({ ctx })

}).schema(contestantSchema).action(async ({ parsedInput }) => {

    const { name, gender, age, department, contestantNumber } = parsedInput

    const contestant = await prisma.contestant.create({
        data: {
            name,
            gender,
            age,
            department,
            contestantNumber
        }
    })

    revalidatePath('/admin/dashboard')

    return {
        contestant
    }

})