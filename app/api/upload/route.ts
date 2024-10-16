import { NextRequest, NextResponse } from 'next/server'
import { writeFile, access, unlink } from 'fs/promises'
import path from 'path'
import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const eventName: string | null = data.get('eventName') as string | null
    const color: string | null = data.get('color') as string | null
    const action: string | null = data.get('action') as string | null

    if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = file.name
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

    try {
        // Check if file already exists
        try {
            await access(filepath)
            // If we reach here, the file exists
            if (!action) {
                // If no action is specified, return that the file exists
                return NextResponse.json({ success: false, fileExists: true, filename })
            } else {
                // Delete the existing file
                await unlink(filepath)
                console.log(`Deleted existing file: ${filepath}`)
            }
        } catch (error) {
            // File doesn't exist, continue with normal upload
        }

        // Upload the new file
        await writeFile(filepath, buffer)
        console.log(`Uploaded file saved to ${filepath}`)
        console.log(eventName, color)
        const savedFile = await prisma.tabulationDesignVariables.update({
            where: {
                id: 1
            },
            data: {
                iconName: filename,
                eventName: eventName ?? "Model Pageant 2024",
                color: color ?? "#FFC8DD"
            }
        })
        revalidatePath("/")
        return NextResponse.json({ success: true, filename: savedFile.iconName })
    } catch (error) {
        console.error('Error saving file:', error)
        return NextResponse.json({ success: false, error: 'Error saving file' })
    }
}
