'use client'

import AutoForm from "@/components/ui/auto-form"
import { contestantSchema } from "@/lib/zod-schema"
import { useAction } from "next-safe-action/hooks"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { CustomToast } from "@/components/custom-toast"
import { createContestantAction } from "../_actions/create-contestant"

export const AddConstestantForm = () => {

    const [open, setOpen] = useState(false)

    const { execute, status, result } = useAction(createContestantAction, {
        onSuccess: (ev) => {
            toast.custom((t) => <CustomToast title={t} state='success' message={`Contestant ${ev.data?.contestant.name} added successfully`} />)
            setOpen(false)
        },
        onError: (ev) => {
            toast.custom((t) => <CustomToast title={t} state='error' message={`Error: ${ev.error.serverError}`} />)
        }
    })


    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-blue-100 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Contestant
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Contestant</AlertDialogTitle>
                </AlertDialogHeader>
                <AutoForm
                    formSchema={contestantSchema}
                    onSubmit={execute}
                >
                    <Button disabled={status === 'executing'} type="submit">Add Contestant</Button>
                </AutoForm>
                {result.serverError && <div className="text-red-500">{result.serverError}</div>}
                <Button onClick={() => setOpen(false)}>Cancel</Button>
            </AlertDialogContent>
        </AlertDialog>
    )
}
