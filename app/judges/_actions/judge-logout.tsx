'use server'

import prisma from "@/lib/db"
import { actionClient } from "@/lib/safe-action"
import { client } from "@/lib/treaty"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const judgeLogoutAction = actionClient.action(async () => {

    const token = cookies().get("mmbutoken")?.value

    if (!token) {
        cookies().set("mmbutoken", "")
        redirect("/judges")
    }

    const res = await client.api.verify.get({
        query: {
            token: token
        }
    })

    if (!res.data?.session) {
        cookies().set("mmbutoken", "")
        redirect("/judges")
    }

    await prisma.judge.update({
        where: {
            id: res.data.session.id as string
        },
        data: {
            isLoggedIn: false
        }
    })

    cookies().set("mmbutoken", "")
    redirect("/judges")
})