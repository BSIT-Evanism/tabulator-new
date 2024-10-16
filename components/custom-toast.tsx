import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export const CustomToast = ({
    t,
    state,
    message,
    title
}: {
    t: string | number
    state: 'success' | 'error' | 'info' | 'warning'
    message: string
    title: string
}) => {
    const stateColor = {
        success: 'border-green-500 text-green-600',
        error: 'border-red-500 text-red-600',
        info: 'border-blue-500 text-blue-600',
        warning: 'border-yellow-500 text-yellow-600'
    }[state]

    return (
        <div className={cn(
            "w-full max-w-sm bg-white overflow-hidden border-2 border-dashed p-8",
            stateColor
        )}>
            <div className="flex justify-between items-start">
                <div className="grid gap-1">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-sm text-gray-500">{message}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 rounded-md"
                    onClick={() => toast.dismiss(t)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Button>
            </div>
        </div>
    )
}
