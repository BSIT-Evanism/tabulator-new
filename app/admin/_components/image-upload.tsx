'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ImageUpload({ eventName, color, iconName }: { eventName: string, color: string, iconName: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [existingFile, setExistingFile] = useState<string | null>(null)
    const [name, setEventName] = useState<string>(eventName)
    const [eventColor, setEventColor] = useState<string>(color)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
            setExistingFile(null)
        }
    }

    const handleUpload = async (action?: string) => {
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)
        formData.append('eventName', name)
        formData.append('color', eventColor)
        if (action) {
            formData.append('action', action)
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (response.ok) {
                if (data.fileExists) {
                    setExistingFile(data.filename)
                } else {
                    console.log('File uploaded successfully:', data.filename)
                    setFile(null)
                    setExistingFile(null)
                    // You can add further logic here, like updating the UI or notifying the user
                }
            } else {
                console.error('Upload failed:', data.error)
            }
        } catch (error) {
            console.error('Error uploading file:', error)
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
            <input type="file" onChange={handleFileChange} accept="image/*" />
            {existingFile ? (
                <div className="space-y-2">
                    <p>File {existingFile} already exists. What would you like to do?</p>
                    <div className="flex gap-2">
                        <Button onClick={() => handleUpload('overwrite')}>Overwrite</Button>
                        <Button onClick={() => handleUpload('new')}>Upload a new file</Button>
                        <Button onClick={() => setExistingFile(null)}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <Button onClick={() => handleUpload()} disabled={!file}>
                    Upload Image
                </Button>
            )}
        </div>
    )
}
