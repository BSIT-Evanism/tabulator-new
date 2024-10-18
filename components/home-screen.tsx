
import { Crown, Star, Users, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import prisma from "@/lib/db"
import { cn } from "@/lib/utils"

export async function HomeScreen() {

  const data = await prisma.tabulationDesignVariables.findFirst()

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-pink-100 flex flex-col items-center justify-center p-4 relative overflow-hidden", data?.color ? data.color : "bg-pink-100")}>
      {/* Patterned Background */}
      <video className="fixed inset-0 opacity-10  h-full top-0" src="/uploads/bg-vid.mp4" autoPlay loop muted />

      {/* Main Content */}
      <div className="max-w-md w-full backdrop-blur-sm bg-white/30 rounded-xl p-6 space-y-8 text-center relative z-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-pink-600 flex items-center justify-center">
            {data?.iconName ? <img src={`/uploads/${data.iconName}`} alt="Event Icon" className="w-10 h-10 mr-2" /> : <Crown className="w-10 h-10 mr-2 text-yellow-400 animate-pulse" />}
            Welcome to {data?.eventName ? data.eventName : "Model Pageant 2024"}
          </h1>
          <p className="text-xl text-purple-500">Elegance in Motion</p>
        </div>

        {/* Animated Star Icon */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn("w-32 h-32 rounded-full flex items-center justify-center shadow-lg", data?.color ? data.color : "bg-pink-200")}>
              {data?.iconName ? <img src={`/uploads/${data.iconName}`} alt="Event Icon" className="w-40 h-40" /> : <Star className="w-20 h-20 text-yellow-400 animate-spin-slow" />}
            </div>
          </div>
          <div className="relative z-10 py-16" />
        </div>

        <div className="space-y-6">
          <p className="text-gray-600">Choose your role in this spectacular event:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/judges">
              <Button variant="outline" className="bg-pink-400 hover:bg-pink-500 text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105">
                <Users className="mr-2 h-4 w-4" />
                Judges Area
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="bg-purple-400 hover:bg-purple-500 text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105">
                <Camera className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pb-2 text-sm text-gray-600 relative z-10">
        © 2024 GDSC Bicol University. All rights reserved.
      </footer>
      <p className='text-xs absolute bottom-0 text-gray-500 text-center'>
        Made with ❤️ by <Link href="https://github.com/BSIT-Evanism" className='text-purple-500 underline' target="_blank">Evan Solanoy</Link> and GDSC Bicol University.
      </p>
    </div>
  )
}