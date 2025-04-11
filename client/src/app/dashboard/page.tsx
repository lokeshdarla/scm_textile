'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { logout } from '@/actions/login'
import { useRouter } from 'next/navigation'
import { isLoggedIn as checkLoginStatus } from '@/actions/login'

const Dashboard = () => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = await checkLoginStatus()
      setIsLoggedIn(loggedIn)

      if (!loggedIn) {
        router.push('/')
      }
    }
    checkLogin()
  }, [router])

  const handleLogout = async () => {
    await logout()
    setIsLoggedIn(false)
    router.push('/')
  }

  if (!isLoggedIn) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p>Manage your account settings and preferences</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p>View and track your orders</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Notifications</h2>
            <p>Check your notifications and messages</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
