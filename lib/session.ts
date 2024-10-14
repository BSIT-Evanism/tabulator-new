import { cookies } from "next/headers"
import { client } from "./treaty"
import { cache } from "react"


const getSession = cache(async () => {
    try {

        const token = cookies().get('mmbutoken')

        if (!token) {
            return {
                session: null
            }
        }

        const session = await client.api.verify.get({
            query: {
                token: token.value
            }
        })

        if (!session.data) {
            return {
                session: null
            }
        }

        return session.data
    } catch (error) {
        return {
            session: null
        }
    }
})

export { getSession }