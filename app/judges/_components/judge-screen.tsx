'use client'

import { GlobeIcon, Eye, EyeOff, Loader2 } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAction } from "next-safe-action/hooks"
import { JudgeLoginAction } from "../_actions/judge-login"
import { CustomToast } from "@/components/custom-toast"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { TabulationDesignVariables } from "@prisma/client"
import { useStateStore } from "@/lib/state-ws"

export function JudgesScreen({ data }: { data: TabulationDesignVariables | null }) {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [strength, setStrength] = useState(0)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [eventTime,] = useState(new Date('2024-07-20T00:00:00'))
    const [showPassword, setShowPassword] = useState(false)
    const [greeting, setGreeting] = useState("")
    const backgroundColors = useMemo(() => [
        'purple-600 ',
        'pink-500 ',
        'red-500 ',
        'orange-500',
    ], []);

    const { isLocked, connect, disconnect } = useStateStore()

    useEffect(() => {
        connect()
        return () => {
            disconnect()
        }
    }, [connect, disconnect])

    const [currentColorIndex, setCurrentColorIndex] = useState(0);

    const { execute, status, } = useAction(JudgeLoginAction, {
        onSuccess: (ev) => {
            toast.custom((t) => <CustomToast title={data?.eventName || "Model Pageant 2024"} t={t} state='success' message={`Judge ${ev.data?.judge} logged-in successfully`} />)
            router.push("/judges/scoring")
        },
        onError: (ev) => {
            toast.custom((t) => <CustomToast title={data?.eventName || "Model Pageant 2024"} t={t} state='error' message={`Error: ${ev.error.serverError} ${ev.error.validationErrors}`} />)
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

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            setCurrentTime(now)

            // Update greeting based on time of day
            const hour = now.getHours()
            if (hour < 12) setGreeting("Good morning")
            else if (hour < 18) setGreeting("Good afternoon")
            else setGreeting("Good evening")
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentColorIndex((prevIndex) => (prevIndex + 1) % backgroundColors.length);
        }, 2000); // Change color every 2 seconds

        return () => clearInterval(intervalId);
    }, [backgroundColors.length]);

    return (
        <div className="flex flex-col justify-center items-center gap-4 w-full h-screen relative">
            <video className="w-full h-full object-cover absolute top-0 left-0 z-0" src="/uploads/bg-vid.mp4" autoPlay loop muted />
            <AnimatePresence>
                {isLocked && (
                    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-screen flex justify-center items-center bg-black/50 backdrop-blur-lg absolute top-0 left-0 z-20">
                        <motion.div layoutId="locker" className="w-4/5 h-4/5 rounded-[3rem] border-8 border-purple-400/30 flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 shadow-2xl z-10 p-12 space-y-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/path/to/glitter-texture.png')] opacity-20 mix-blend-overlay animate-pulse"></div>
                            <motion.h1 layoutId="greeting" className="text-white text-7xl font-black tracking-tighter mb-6 animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-gold-300 to-blue-500">
                                Prepare for Elegance!
                            </motion.h1>
                            <motion.div layoutId="timer" className="flex items-center space-x-6 bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                <span className="text-white text-3xl font-medium">Current Time:</span>
                                <span className="text-green-300 text-5xl font-extrabold animate-bounce-slow">{currentTime.toLocaleTimeString()}</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                layout
                className={cn(
                    "w-full h-full flex justify-center flex-col items-center gap-4 transition-colors duration-2000",
                    `bg-${backgroundColors[currentColorIndex]}`
                )}
            >
                <motion.div layout className="flex flex-col bg-white/20 backdrop-blur-3xl rounded-2xl justify-center items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {data?.iconName ? <img src={`/uploads/${data.iconName}`} alt="Event Icon" className="w-1/3 h-1/3  object-contain animate-spin-y-10" /> : <GlobeIcon className="w-1/4 h-1/4 text-white animate-spin-y-10" />}
                    <h1 className="scroll-m-20 z-10 text-5xl font-extrabold tracking-tight py-4 leading-relaxed p-4 lg:text-6xl text-transparent bg-clip-text bg-white animate-gradient-x">
                        Welcome to the Spectacular
                        <span className="block mt-2 text-7xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)] animate-pulse">
                            {data?.eventName || "Model Pageant 2024"}
                        </span>
                    </h1>
                    <div>
                        <div className="flex justify-center items-center gap-4 p-1 bg-white rounded-lg overflow-hidden relative">
                            <div
                                className={cn("absolute top-0 left-0 h-full bg-red-500 z-0 transition-all duration-300", strength > 0 && "bg-red-500", strength > 1 && "bg-orange-500", strength > 2 && "bg-yellow-500", strength > 3 && "bg-green-500")}
                                style={{ width: `${strength * 25}%` }}
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                className={cn("w-64 h-14 p-2 text-2xl rounded-md z-10 focus:outline-none bg-slate-200")}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    checkPasswordStrength(e.target.value)
                                }}
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className={cn("z-10 p-2 rounded-md bg-slate-200")}
                            >
                                {showPassword ? <EyeOff className="text-black" /> : <Eye className="text-black" />}
                            </button>
                        </div>
                    </div>
                </motion.div>
                {password.length > 0 && (
                    <motion.button disabled={status === 'executing' || strength < 4} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => execute(password)} className="bg-white w-64 h-14 text-sec font-bold text-xl flex justify-center items-center rounded-full p-2">{strength < 4 ? "Password is too weak" : "Enter"} {status === 'executing' && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}</motion.button>
                )}
            </motion.div>
            <AnimatePresence>
                {!isLocked && (
                    <motion.div
                        layoutId="locker"
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-4 text-white overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <motion.div layoutId="greeting" className="text-2xl font-bold">{greeting}, Judges!</motion.div>
                            <motion.div layoutId="timer" className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</motion.div>
                        </div>
                        <div className="mt-2 whitespace-nowrap animate-marquee-rtl">
                            <span className="inline-block px-4">Welcome to {data?.eventName || "Model Pageant 2024"}! We&apos;re excited to have you here. Get ready for an amazing event!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    )
}
