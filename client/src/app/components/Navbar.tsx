'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { isLoggedIn as checkLoginStatus } from '../../actions/login'
import { Loader2 } from 'lucide-react'

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkLogin = async () => {
      try {
        setIsLoading(true)
        const loginStatus = await checkLoginStatus()
        setIsLoggedIn(loginStatus)
      } catch (error) {
        console.error('Error checking login status:', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkLogin()
  }, [])

  const handleLogin = () => {
    redirect('/login')
  }

  return (
    <div className="h-16 text-white shadow-md bg-primary">
      <nav className="px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          <div className="text-xl font-bold text-primary">TextileChain</div>
          <div className="hidden space-x-8 md:flex">
            <a href="#" className="text-muted-foreground hover:text-primary">
              Features
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              Benefits
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              About
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              Contact
            </a>
          </div>
          <button onClick={handleLogin} className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary/90 hover:cursor-pointer">
            Log in
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
