'use client'

import { useState } from "react"
import AutoForm from "@/components/ui/auto-form"
import { loginSchema } from "@/lib/zod-schema"
import { useAction } from "next-safe-action/hooks"
import { loginAction } from "../_actions/login-action"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminScreen() {

    const [error, setError] = useState<string | null>(null)

    const { execute, status } = useAction(loginAction, {
        onError: (error) => {
            console.log(error)
            setError(error.error.serverError || 'Something went wrong')
            toast.custom((t) => <div className="bg-red-500 text-white p-2 rounded-md">{error.error.serverError}</div>)
        }
    })


    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center w-1/4 h-1/2">
                <h1>Welcome to admin page</h1>
                <AutoForm onSubmit={execute} formSchema={loginSchema}>
                    <Button disabled={status === 'executing'} className={cn(status === 'hasErrored' && 'bg-red-500', status === 'hasSucceeded' && 'bg-green-500')} type="submit">Login</Button>
                </AutoForm>
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </div>
    )
}