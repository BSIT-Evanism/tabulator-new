import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export const judgeSchema = z.object({
    name: z.string(),
    password: z.string()
})

export const contestantSchema = z.object({
    name: z.string(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    age: z.number(),
    department: z.string(),
    contestantNumber: z.number()
})