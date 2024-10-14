import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { Bell, LogOut } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";



export default async function DashboardLayout({ children }: { children: React.ReactNode }) {

    async function handleLogout() {
        'use server'

        try {

            const session = await getSession()

            if (!session.session) {
                redirect('/admin')
            }

            await prisma.admin.update({
                data: {
                    isLoggedIn: false
                },
                where: {
                    id: session.session.id as string
                }
            })

            cookies().set('mmbutoken', '')

            redirect('/admin')
        } catch (error) {
            console.log(error)
            cookies().set('mmbutoken', '')
            redirect('/admin')
        }

    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-8">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-purple-800">MMBU Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <Bell className="h-6 w-6 text-purple-600" />
                    <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-full bg-pink-300" />
                        <span className="text-sm font-medium text-purple-800">Admin User</span>
                        <form action={handleLogout}>
                            <Button type='submit' variant={'ghost'}>
                                <LogOut className='w-4 h-4' />
                            </Button>
                        </form>
                    </div>
                </div>
            </header>
            {children}
        </div>
    )
}