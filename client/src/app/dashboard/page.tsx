'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { logout } from '@/actions/login'
import { useRouter } from 'next/navigation'
import { isLoggedIn as checkLoginStatus } from '@/actions/login'

const Dashboard = () => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 rounded-lg bg-gray-50">
            <h2 className="mb-2 text-xl font-semibold">Profile</h2>
            <p>Manage your account settings and preferences</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50">
            <h2 className="mb-2 text-xl font-semibold">Orders</h2>
            <p>View and track your orders</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50">
            <h2 className="mb-2 text-xl font-semibold">Notifications</h2>
            <p>Check your notifications and messages</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
