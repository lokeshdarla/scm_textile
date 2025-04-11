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
    <div className="bg-primary text-white h-16 shadow-md">
      <nav className="h-full">
        <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="logo" width={120} height={40} className="brightness-0 invert" />
          </Link>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-white/80">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <Button onClick={handleLogin} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
