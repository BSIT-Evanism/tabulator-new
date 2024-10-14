'use server'

import prisma from "@/lib/db";
import { actionClient } from "@/lib/safe-action"
import { client } from "@/lib/treaty";
import { flattenValidationErrors } from "next-safe-action";
import { cookies } from "next/headers";
import { z } from "zod"


export const JudgeLoginAction = actionClient.schema(z.string().min(10), {
    handleValidationErrorsShape: (ve,) => flattenValidationErrors(ve).fieldErrors
}).action(async ({ parsedInput }) => {

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const judge = await prisma.$transaction(async (tx) => {

        const judge = await tx.judge.findFirst({
            where: {
                generatedPassword: parsedInput,
            }
        })

        if (!judge) {
            throw new Error("Invalid password")
        }

        if (judge.isLoggedIn) {
            throw new Error("Judge already logged in")
        }

        const token = await client.api["generate-token"].post({
            id: judge.id,
            role: "judge",
        })

        await tx.judge.update({
            where: {
                id: judge.id
            },
            data: {
                isLoggedIn: true
            }
        })

        cookies().set("mmbutoken", token.data?.token ?? "")

        return {
            success: true,
            judge: judge.name
        }

    })

    return judge

})