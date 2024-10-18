'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { z } from 'zod'
import { useAction } from 'next-safe-action/hooks'
import { updateVarsAction } from '../_actions/update-vars'
import { toast } from 'sonner'

const tabulationVariablesSchema = z.object({
    eventName: z.string().min(1),
    color: z.string().min(1),
    iconName: z.string().min(1)
})

export function ImageUpload({ eventName, color, icon }: { eventName: string, color: string, icon: string }) {

    const [name, setEventName] = useState<string>(eventName)
    const [eventColor, setEventColor] = useState<string>(color)
    const [iconName, setIconName] = useState<string>(icon)
    const { execute } = useAction(updateVarsAction, {
        onSuccess: () => {
            toast.success('Tabulation variables updated')
        },
        onError: (error) => {
            toast.error(error.error.serverError ?? 'Something went wrong')
        }
    })

    const handleSubmit = () => {
        const result = tabulationVariablesSchema.safeParse({ eventName: name, color: eventColor, iconName: iconName })

        console.log(result.data)

        if (result.success) {
            execute(result.data)
        } else {
            console.log(result.error)
        }
    }


    return (
        <div className="space-y-4">
            <Input
                type="text"
                value={name}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Event Name"
            />
            <Input
                type="color"
                value={eventColor}
                onChange={(e) => setEventColor(e.target.value)}
            />
            <div className='flex w-full'>
                <Input
                    type="text"
                    defaultValue={icon}
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    placeholder="Icon Name"
                />
                <img src={`/uploads/${icon}`} alt="main" className='w-10 h-10' />
            </div>
            <Button onClick={handleSubmit}>Submit</Button>
        </div>
    )
}
