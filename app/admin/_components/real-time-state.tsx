'use client'

import { useStateStore } from "@/lib/state-ws"
import { useEffect } from "react"

export default function RealTimeState() {
    const { currentState } = useStateStore()

    useEffect(() => {
        console.log("currentState", currentState)
    }, [currentState])

    return <div>{currentState}</div>
}