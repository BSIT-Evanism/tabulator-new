'use client'

import { GlobeIcon, Eye, EyeOff, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAction } from "next-safe-action/hooks"
import { JudgeLoginAction } from "../_actions/judge-login"
import { CustomToast } from "@/components/custom-toast"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function JudgesScreen() {
    const router = useRouter()
    const [isOpen,] = useState('false')
    const [password, setPassword] = useState('')
    const [strength, setStrength] = useState(0)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [eventTime,] = useState(new Date('2024-07-20T00:00:00'))
    const [showPassword, setShowPassword] = useState(false)

    const { execute, status, } = useAction(JudgeLoginAction, {
        onSuccess: (ev) => {
            toast.custom((t) => <CustomToast title={t} state='success' message={`Judge ${ev.data?.judge} logged-in successfully`} />)
            router.push("/judges/scoring")
        },
        onError: (ev) => {
            toast.custom((t) => <CustomToast title={t} state='error' message={`Error: ${ev.error.serverError} ${ev.error.validationErrors}`} />)
        }
    })


    useEffect(() => {

        const interval = setInterval(() => {
            const now = new Date()
            setCurrentTime(now)
            // Update eventTime here

        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const checkPasswordStrength = (pass: string) => {
        let score = 0
        if (pass.length >= 10) score++
        if (/[A-Z]/.test(pass)) score++
        if (/[0-9]/.test(pass)) score++
        if (/[!@#$%^&*(),.?":{}|<>_]/.test(pass)) score++
        setStrength(score)
    }

    return (
        <div className="flex flex-col justify-center items-center gap-4 w-full h-screen relative">
            {isOpen === 'true' && (<div className="w-full h-screen flex justify-center items-center bg-white/30 backdrop-blur-sm absolute top-0 left-0 z-20">
                <div className="w-2/3 h-2/3 rounded-3xl border-4 border-slate-300 flex flex-col justify-center items-center bg-gradient-to-br from-main to-purple-800 shadow-2xl z-10 p-8 space-y-6">
                    <h1 className="text-white text-5xl font-extrabold tracking-tight mb-4 animate-pulse">The Event is About to Begin!</h1>
                    <p className="text-yellow-300 text-3xl font-semibold">Event Commences at {eventTime.toLocaleTimeString()}</p>
                    <div className="flex items-center space-x-4">
                        <span className="text-white text-2xl font-medium">Current Time:</span>
                        <span className="text-green-300 text-3xl font-bold animate-bounce">{currentTime.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>)}
            <AnimatePresence>
                <motion.div layout className="w-full h-full flex justify-center flex-col items-center bg-sec gap-4">
                    <motion.div layout className="flex flex-col justify-center items-center gap-4">
                        <GlobeIcon className="w-1/4 h-1/4 text-white animate-spin-y-10" />
                        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-white">Welcome to the MMBU 2024</h1>
                        <div>
                            <div className="flex justify-center items-center gap-4 p-1 bg-white rounded-lg overflow-hidden relative">
                                <div
                                    className={cn("absolute top-0 left-0 h-full bg-red-500 z-0 transition-all duration-300", strength > 0 && "bg-red-500", strength > 1 && "bg-orange-500", strength > 2 && "bg-yellow-500", strength > 3 && "bg-green-500")}
                                    style={{ width: `${strength * 25}%` }}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-64 h-14 p-2 text-2xl rounded-md bg-main z-10 focus:outline-none"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        checkPasswordStrength(e.target.value)
                                    }}
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="z-10 p-2 bg-main rounded-md"
                                >
                                    {showPassword ? <EyeOff className="text-white" /> : <Eye className="text-white" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                    {password.length > 0 && (
                        <motion.button disabled={status === 'executing' || strength < 4} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => execute(password)} className="bg-white w-64 h-14 text-sec font-bold text-xl flex justify-center items-center rounded-full p-2">{strength < 4 ? "Password is too weak" : "Enter"} {status === 'executing' && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}</motion.button>
                    )}
                </motion.div>
            </AnimatePresence>
        </div >
    )
}