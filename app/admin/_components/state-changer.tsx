'use client'
import { useStateStore } from "@/lib/state-ws";
import { PalmtreeIcon, BookUser, MessageCircle, Trophy, Unlock, Lock } from "lucide-react";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

enum State {
    swimwear = "swimwear",
    formalAttire = "formalAttire",
    questionAndAnswer = "questionAndAnswer",
    finalRound = "finalRound"
}

const AnimatedSwitch = ({ isOn, toggleSwitch }) => (
    <div className="flex items-center w-full p-4 bg-slate-200 rounded-lg">
        <motion.div
            className="w-14 h-8 bg-gray-300 rounded-full p-1 cursor-pointer relative"
            onClick={toggleSwitch}
        >
            <motion.div
                className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-md"
                animate={{
                    x: isOn ? 24 : 0,
                }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
            />
            <Unlock className={cn("w-4 h-4 text-gray-600 translate-x-1 -translate-y-5", isOn ? "opacity-0" : "opacity-100")} />
        </motion.div>
        <span className="ml-2 text-sm font-medium text-gray-900">
            Judge Lock: {isOn ? "Locked" : "Unlocked"}
        </span>
    </div>
);

export default function StateChanger() {
    const { currentState, setState, connect, disconnect, setLock, isLocked } = useStateStore()

    useEffect(() => {
        connect()
        return () => disconnect()
    }, [connect, disconnect])

    const handleStateChange = (state: State) => {
        setState(state)
    }

    const stateConfig = {
        [State.swimwear]: { icon: PalmtreeIcon, color: "text-blue-500" },
        [State.formalAttire]: { icon: BookUser, color: "text-purple-500" },
        [State.questionAndAnswer]: { icon: MessageCircle, color: "text-green-500" },
        [State.finalRound]: { icon: Trophy, color: "text-yellow-500" }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-purple-800">Current Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                    {currentState && stateConfig[currentState] ?
                        <>
                            {React.createElement(stateConfig[currentState].icon, {
                                className: `h-8 w-8 ${stateConfig[currentState].color}`
                            })}
                            <Badge variant="secondary" className="text-lg">
                                {currentState.split(/(?=[A-Z])/).join(" ")}
                            </Badge>
                        </> :
                        <span className="text-gray-500">Not set</span>
                    }
                </div>
                <Select onValueChange={handleStateChange} value={currentState}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a stage" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(State).map((state) => (
                            <SelectItem key={state} value={state}>
                                {state.split(/(?=[A-Z])/).join(" ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center justify-between">
                    <AnimatedSwitch isOn={isLocked} toggleSwitch={() => setLock(!isLocked)} />
                </div>
            </CardContent>
        </Card>
    )
}
