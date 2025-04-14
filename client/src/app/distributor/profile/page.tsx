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
import { Package, User, Activity, ArrowLeft, Truck } from 'lucide-react'
import Link from 'next/link'

// Define the PackagedStock type based on the smart contract struct
interface PackagedStock {
  id: bigint
  distributor: string
  apparelId: bigint
  qrCode: string
  isAvailable: boolean
  timestamp: bigint
  name: string
  brand: string
  price: bigint
  fabricIds: readonly bigint[]
  category: string
  size: string
  isUsedForPackagedStock: boolean
}

export default function DistributorProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [packagedStocks, setPackagedStocks] = useState<PackagedStock[]>([])
  const [stats, setStats] = useState({
    totalAdded: 0,
    totalSold: 0,
    totalValue: 0,
  })

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()

  // Check if user is connected
  useEffect(() => {
    if (!activeAccount?.address) {
      toast.error('No wallet connected', {
        description: 'Please connect your wallet to access the dashboard',
        duration: 5000,
      })
      router.push('/login')
      return
    }
  }, [activeAccount, router])

  // Fetch packaged stocks
  useEffect(() => {
    const fetchPackagedStocks = async () => {
      if (!activeAccount?.address) return

      setIsLoading(true)

      try {
        // Get all packaged stocks
        const packagedStockIds = await readContract({
          contract,
          method: 'function getAllPackagedStocks() view returns (uint256[])',
          params: [],
        })

        if (!packagedStockIds || packagedStockIds.length === 0) {
          setPackagedStocks([])
          return
        }

        // Fetch details for each packaged stock
        const packagedStockList: PackagedStock[] = []

        for (const id of packagedStockIds) {
          try {
            const packagedStockData = await readContract({
              contract,
              method:
                'function getPackagedStock(uint256 packagedStockId) view returns ((uint256 id, address distributor, uint256 apparelId, string qrCode, bool isAvailable, uint256 timestamp, string name, string brand, uint256 price, uint256[] fabricIds, string category, string size, bool isUsedForPackagedStock))',
              params: [id],
            })

            if (packagedStockData && packagedStockData.distributor === activeAccount?.address) {
              packagedStockList.push(packagedStockData)
            }
          } catch (error) {
            console.error(`Error fetching packaged stock with ID ${id}:`, error)
            // Continue with other packaged stocks even if one fails
          }
        }

        setPackagedStocks(packagedStockList)

        // Calculate stats
        const totalAdded = packagedStockList.length
        const totalSold = packagedStockList.filter((p) => !p.isAvailable).length
        const totalValue = packagedStockList.reduce((sum, p) => sum + p.price, BigInt(0))

        setStats({
          totalAdded,
          totalSold,
          totalValue: Number(totalValue) / 1e18, // Convert from Wei to ETH
        })
      } catch (error) {
        console.error('Error loading packaged stocks:', error)
        toast.error('Failed to load packaged stocks', {
          description: 'Please check your connection and try again',
        })
        setPackagedStocks([])
      } finally {
        setIsLoading(false)
      }
    }

    if (activeAccount?.address) {
      fetchPackagedStocks()
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
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link href="/distributor" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Distributor Profile</h1>
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
              <CardDescription className="mt-1 text-sm text-gray-500">Your distributor account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${activeAccount?.address}`} alt="Profile" />
                  <AvatarFallback>{activeAccount?.address ? getInitials(activeAccount.address) : 'DI'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Distributor Account</h3>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">{activeAccount?.address || 'Not connected'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-500">Account Type</h4>
                <p className="mt-1 text-lg font-medium text-gray-900">Distributor</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Packaged Stock Stats</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Your packaged stock activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-primary/10">
                    <Package className="w-5 h-5 text-primary" />
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
              <CardDescription className="mt-1 text-sm text-gray-500">Your latest packaged stock transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                  <span className="ml-2 text-gray-500">Loading activity...</span>
                </div>
              ) : packagedStocks.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven't created any packaged stocks yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/distributor/add-packaged-stock')}>
                    Add Packaged Stock
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {packagedStocks.slice(0, 5).map((stock) => (
                    <div key={stock.id.toString()} className="flex items-start p-3 transition-colors border rounded-md hover:bg-gray-50">
                      <div className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full ${stock.isAvailable ? 'bg-primary/10' : 'bg-green-100'}`}>
                        <Package className={`w-4 h-4 ${stock.isAvailable ? 'text-primary' : 'text-green-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{stock.name}</p>
                        <p className="text-xs text-gray-500">
                          {stock.isAvailable ? 'Available' : 'Sold'} • {formatDate(stock.timestamp)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{formatPrice(stock.price)} ETH</div>
                    </div>
                  ))}
                  {packagedStocks.length > 5 && (
                    <Button variant="outline" className="w-full" onClick={() => router.push('/distributor/transactions')}>
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
