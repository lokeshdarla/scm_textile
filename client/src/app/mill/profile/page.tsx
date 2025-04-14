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
import { Package, User, Activity, ArrowLeft, Scissors } from 'lucide-react'
import Link from 'next/link'

// Define the Fabric type based on the smart contract struct
interface Fabric {
  id: bigint
  mill: string
  manufacturer: string
  qrCode: string
  rawMaterialIds: readonly bigint[]
  isAvailable: boolean
  timestamp: bigint
  name: string
  composition: string
  price: bigint
}

export default function MillProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [stats, setStats] = useState({
    totalAdded: 0,
    totalSold: 0,
    totalValue: 0,
  })

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()

  // Check if user is connected
  // useEffect(() => {
  //   if (!activeAccount?.address) {
  //     toast.error('No wallet connected', {
  //       description: 'Please connect your wallet to access the dashboard',
  //       duration: 5000,
  //     })
  //     router.push('/login')
  //     return
  //   }
  // }, [activeAccount, router])

  // Fetch fabrics
  useEffect(() => {
    const fetchFabrics = async () => {
      if (!activeAccount?.address) return

      setIsLoading(true)

      try {
        // Get all fabrics
        const fabricIds = await readContract({
          contract,
          method: 'function getAllFabrics() view returns (uint256[])',
          params: [],
        })

        if (!fabricIds || fabricIds.length === 0) {
          setFabrics([])
          return
        }

        // Fetch details for each fabric
        const fabricList: Fabric[] = []

        for (const id of fabricIds) {
          try {
            const fabricData = await readContract({
              contract,
              method:
                'function getFabric(uint256 fabricId) view returns ((uint256 id, address mill, address manufacturer, string qrCode, uint256[] rawMaterialIds, bool isAvailable, uint256 timestamp, string name, string composition, uint256 price))',
              params: [id],
            })

            if (fabricData && fabricData.mill === activeAccount?.address) {
              fabricList.push(fabricData)
            }
          } catch (error) {
            console.error(`Error fetching fabric with ID ${id}:`, error)
            // Continue with other fabrics even if one fails
          }
        }

        setFabrics(fabricList)

        // Calculate stats
        const totalAdded = fabricList.length
        const totalSold = fabricList.filter((f) => !f.isAvailable).length
        const totalValue = fabricList.reduce((sum, f) => sum + f.price, BigInt(0))

        setStats({
          totalAdded,
          totalSold,
          totalValue: Number(totalValue) / 1e18, // Convert from Wei to ETH
        })
      } catch (error) {
        console.error('Error loading fabrics:', error)
        toast.error('Failed to load fabrics', {
          description: 'Please check your connection and try again',
        })
        setFabrics([])
      } finally {
        setIsLoading(false)
      }
    }

    if (activeAccount?.address) {
      fetchFabrics()
    }
  }, [activeAccount, hideLoading, showLoading])

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
    <div className="flex flex-col min-h-screen bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link href="/mill" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Mill Profile</h1>
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
              <CardDescription className="mt-1 text-sm text-gray-500">Your mill account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${activeAccount?.address}`} alt="Profile" />
                  <AvatarFallback>{activeAccount?.address ? getInitials(activeAccount.address) : 'MI'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Mill Account</h3>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">{activeAccount?.address || 'Not connected'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-500">Account Type</h4>
                <p className="mt-1 text-lg font-medium text-gray-900">Mill</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Fabric Stats</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Your fabric production activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-primary/10">
                    <Scissors className="w-5 h-5 text-primary" />
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
              <CardDescription className="mt-1 text-sm text-gray-500">Your latest fabric transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                  <span className="ml-2 text-gray-500">Loading activity...</span>
                </div>
              ) : fabrics.length === 0 ? (
                <div className="py-8 text-center">
                  <Scissors className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven't created any fabrics yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/mill/add-fabric')}>
                    Add Fabric
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fabrics.slice(0, 5).map((fabric) => (
                    <div key={fabric.id.toString()} className="flex items-start p-3 transition-colors border rounded-md hover:bg-gray-50">
                      <div className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full ${fabric.isAvailable ? 'bg-primary/10' : 'bg-green-100'}`}>
                        <Scissors className={`w-4 h-4 ${fabric.isAvailable ? 'text-primary' : 'text-green-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{fabric.name}</p>
                        <p className="text-xs text-gray-500">
                          {fabric.isAvailable ? 'Available' : 'Sold'} • {formatDate(fabric.timestamp)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{formatPrice(fabric.price)} ETH</div>
                    </div>
                  ))}
                  {fabrics.length > 5 && (
                    <Button variant="outline" className="w-full" onClick={() => router.push('/mill/transactions')}>
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
