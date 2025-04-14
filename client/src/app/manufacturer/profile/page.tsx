'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { readContract } from 'thirdweb'
import { useActiveAccount } from 'thirdweb/react'
import { contract } from '@/lib/client'
import { useLoading } from '@/components/providers/loading-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Activity, ArrowLeft, Shirt } from 'lucide-react'
import Link from 'next/link'
import { Apparel } from '@/constants'

export default function ManufacturerProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [apparels, setApparels] = useState<Apparel[]>([])
  const [stats, setStats] = useState({
    totalAdded: 0,
    totalSold: 0,
    totalValue: 0,
  })

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()

  // Fetch apparels
  useEffect(() => {
    let isMounted = true

    const fetchApparels = async () => {
      if (!activeAccount?.address) return

      setIsLoading(true)

      try {
        // Get all apparels
        const apparelIds = await readContract({
          contract,
          method: 'function getALlApparels() view returns (uint256[])',
          params: [],
        })

        if (!apparelIds || apparelIds.length === 0) {
          setApparels([])
          return
        }

        // Fetch details for each apparel
        const apparelList: Apparel[] = []

        for (const id of apparelIds) {
          try {
            const apparelData = await readContract({
              contract,
              method:
                'function getApparel(uint256 apparelId) view returns ((uint256 id, address manufacturer, address distributor, string qrCode, uint256[] fabricIds, bool isAvailable, uint256 timestamp, string name, string category, string size, uint256 price, bool isUsedForPackagedStock))',
              params: [id],
            })

            if (apparelData && apparelData.manufacturer === activeAccount?.address) {
              apparelList.push(apparelData)
            }
          } catch (error) {
            console.error(`Error fetching apparel with ID ${id}:`, error)
            // Continue with other apparels even if one fails
          }
        }

        if (!isMounted) return

        setApparels(apparelList)

        // Calculate stats
        const totalAdded = apparelList.length
        const totalSold = apparelList.filter((a) => !a.isAvailable).length

        // Safely calculate total value with BigInt
        let totalValue = BigInt(0)
        for (const apparel of apparelList) {
          try {
            totalValue += apparel.price
          } catch (error) {
            console.error('Error adding price:', error)
          }
        }

        setStats({
          totalAdded,
          totalSold,
          totalValue: Number(totalValue) / 1e18, // Convert from Wei to ETH
        })
      } catch (error) {
        console.error('Error loading apparels:', error)
        if (isMounted) {
          toast.error('Failed to load apparels', {
            description: 'Please check your connection and try again',
          })
          setApparels([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (activeAccount?.address) {
      fetchApparels()
    }

    return () => {
      isMounted = false
    }
  }, [activeAccount])

  // Format price from Wei to ETH
  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(4)
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  // Get initials from address
  const getInitials = (address: string) => {
    return address.slice(2, 4).toUpperCase()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link href="/manufacturer" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Manufacturer Profile</h1>
              <p className="mt-1 text-sm text-gray-500">View your account details and activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Account Details</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Your manufacturer account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${activeAccount?.address}`} alt="Profile" />
                  <AvatarFallback>{activeAccount?.address ? getInitials(activeAccount.address) : 'MA'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Manufacturer Account</h3>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">{activeAccount?.address || 'Not connected'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-500">Account Type</h4>
                <p className="mt-1 text-lg font-medium text-gray-900">Manufacturer</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Apparel Stats</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Your apparel production activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-primary/10">
                    <Shirt className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-500">Total Added</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalAdded}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 bg-green-100 rounded-full">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-500">Total Sold</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalSold}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-100 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-500">Total Value</h4>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalValue.toFixed(4)} ETH</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Your latest apparel transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                  <span className="ml-2 text-gray-500">Loading activity...</span>
                </div>
              ) : apparels.length === 0 ? (
                <div className="py-8 text-center">
                  <Shirt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven't created any apparels yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/manufacturer/add-apparel')}>
                    Add Apparel
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {apparels.slice(0, 5).map((apparel) => (
                    <div key={apparel.id.toString()} className="flex items-start p-3 transition-colors border rounded-md hover:bg-gray-50">
                      <div className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full ${apparel.isAvailable ? 'bg-primary/10' : 'bg-green-100'}`}>
                        <Shirt className={`w-4 h-4 ${apparel.isAvailable ? 'text-primary' : 'text-green-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{apparel.name}</p>
                        <p className="text-xs text-gray-500">
                          {apparel.isAvailable ? 'Available' : 'Sold'} • {formatDate(apparel.timestamp)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{formatPrice(apparel.price)} ETH</div>
                    </div>
                  ))}
                  {apparels.length > 5 && (
                    <Button variant="outline" className="w-full" onClick={() => router.push('/manufacturer/transactions')}>
                      View All Activity
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
