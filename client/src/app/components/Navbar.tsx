'use client'
import React, { useEffect, useState } from 'react'
import WalletConnect from './WalletConnect'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { isLoggedIn as checkLoginStatus } from '../../actions/login'

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkLogin = async () => {
      setIsLoggedIn(await checkLoginStatus())
    }
    checkLogin()
  }, [])

  return (
    <div className="bg-green-600 text-white h-16">
      <nav className="h-full">
        <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="logo" width={120} height={40} className="brightness-0 invert" />
          </Link>
          <div className="flex items-center gap-4">
            <WalletConnect />

            <Button onClick={() => redirect('/login')} variant="outline" className="bg-white h-full text-green-600 hover:cursor-pointer hover:bg-green-50">
              Register
            </Button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
