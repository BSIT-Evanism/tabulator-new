'use server'

import prisma from "@/lib/db"
import { actionClient } from "@/lib/safe-action"
import { client } from "@/lib/treaty"
import { loginSchema } from "@/lib/zod-schema"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"



export const loginAction = actionClient.schema(loginSchema).action(async ({ parsedInput }) => {

    const setCookie = cookies()

    const admin = await prisma.admin.findFirst({
        where: {
            email: parsedInput.email,
            password: parsedInput.password,
            isLoggedIn: false
        }
    })

    if (!admin) {
        setCookie.set('mmbutoken', '')
        throw new Error('Invalid email/password or user already logged in')
    }

    const token = await client.api["generate-token"].post({
        id: admin.id,
        role: 'admin'
    })

    if (!token.data) {
        setCookie.set('mmbutoken', '')
        throw new Error('Failed to generate token')
    }

    setCookie.set('mmbutoken', token.data.token)
    await prisma.admin.update({
        data: {
            isLoggedIn: true
        },
        where: {
            id: admin.id
        }
    })

    revalidatePath('/admin')

})