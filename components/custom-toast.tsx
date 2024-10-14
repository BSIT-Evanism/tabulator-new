import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { toast } from "sonner"


export const CustomToast = ({
    title, state, message
}: {
    title: string | number
    state: 'success' | 'error' | 'info' | 'warning'
    message: string
}) => {
    return (
        <div className={cn(" w-72 flex flex-col justify-center items-center h-20 p-4 border-dashed border-4  bg-white relative", state === 'success' ? 'border-green-500' : state === 'error' ? 'border-red-500' : state === 'info' ? 'border-blue-500' : state === 'warning' ? 'border-yellow-500' : '')}>
            <button onClick={() => toast.dismiss(title)} className="absolute top-2 right-2">
                <X className="w-4 h-4" />
            </button>
            <p className=" text-lg text-center font-medium">
                {message}
            </p>
        </div>
    )
}