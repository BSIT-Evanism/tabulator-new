'use client'

import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import Link from "next/link"

export function HomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-pink-600 mb-2 flex items-center justify-center">
          <Crown className="mr-2 h-8 w-8 text-yellow-400" />
          Cute Model Pageant
        </h1>
        <p className="text-xl text-purple-600">MMBU 2024</p>
      </header>

      <main className="text-center mb-12">
        <div className="mb-8">
          <svg
            className="w-48 h-48 mx-auto"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" fill="#FFC0CB" />
            <circle cx="70" cy="80" r="10" fill="#FFF" />
            <circle cx="130" cy="80" r="10" fill="#FFF" />
            <path d="M70 110 Q100 130 130 110" fill="none" stroke="#FF69B4" strokeWidth="5" />
          </svg>
        </div>
        <p className="text-lg text-gray-700 mb-8">
          Welcome to MMBU 2024
          <br />
          Choose your role to get started:
        </p>
      </main>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/judges">
          <Button className="w-48 h-16 text-lg bg-blue-400 hover:bg-blue-500 text-white rounded-full shadow-lg transition-transform transform hover:scale-105">
            Judges Area
          </Button>
        </Link>
        <Link href="/admin">
          <Button className="w-48 h-16 text-lg bg-purple-400 hover:bg-purple-500 text-white rounded-full shadow-lg transition-transform transform hover:scale-105">
            Admin Panel
          </Button>
        </Link>
      </div>

      <footer className="mt-12 text-center text-gray-500">
        <p>© 2023 Cute Model Pageant. All rights reserved.</p>
      </footer>
    </div>
  )
}