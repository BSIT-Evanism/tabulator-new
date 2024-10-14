'use client'
import { useStateStore } from "@/lib/state-ws";
import { PalmtreeIcon, BookUser, MessageCircle, Trophy } from "lucide-react";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

enum State {
    swimwear = "swimwear",
    formalAttire = "formalAttire",
    questionAndAnswer = "questionAndAnswer",
    finalRound = "finalRound"
}

export default function StateChanger() {
    const { currentState, setState, connect, disconnect } = useStateStore()

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
            </CardContent>
        </Card>
    )
}