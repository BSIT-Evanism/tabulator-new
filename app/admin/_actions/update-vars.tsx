'use server'

import prisma from "@/lib/db"
import { protectedClient } from "@/lib/safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const tabulationVariablesSchema = z.object({
    eventName: z.string().min(1),
    color: z.string().min(1),
    iconName: z.string().min(1)
})

export const updateVarsAction = protectedClient.use(async ({ ctx, next }) => {

    if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    return next({ ctx })

}).schema(tabulationVariablesSchema).action(async ({ parsedInput }) => {
    const { eventName, color, iconName } = parsedInput

    const vars = await prisma.tabulationDesignVariables.update({
        where: { id: 1 },
        data: { eventName, color, iconName }
    })

    revalidatePath('/admin/dashboard')

})