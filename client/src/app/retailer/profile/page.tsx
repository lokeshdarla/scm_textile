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
import { Package, User, Activity, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

// Define the RetailProduct type based on the smart contract struct
interface RetailProduct {
  id: bigint
  retailer: string
  customer: string
  qrCode: string
  packagedStockIds: readonly bigint[]
  isAvailable: boolean
  timestamp: bigint
  name: string
  price: bigint
  brand: string
  isUsedForCustomer: boolean
}

export default function RetailerProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [retailProducts, setRetailProducts] = useState<RetailProduct[]>([])
  const [stats, setStats] = useState({
    totalAdded: 0,
    totalSold: 0,
    totalValue: 0,
  })

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()

  // Fetch retail products
  useEffect(() => {
    const fetchRetailProducts = async () => {
      if (!activeAccount?.address) return

      setIsLoading(true)

      try {
        // Get all retail products
        const retailProductIds = await readContract({
          contract,
          method: 'function getAllRetailProducts() view returns (uint256[])',
          params: [],
        })

        if (!retailProductIds || retailProductIds.length === 0) {
          setRetailProducts([])
          return
        }

        // Fetch details for each retail product
        const retailProductList: RetailProduct[] = []

        for (const id of retailProductIds) {
          try {
            const retailProductData = await readContract({
              contract,
              method:
                'function getRetailProduct(uint256 retailProductId) view returns ((uint256 id, address retailer, address customer, string qrCode, uint256[] packagedStockIds, bool isAvailable, uint256 timestamp, string name, uint256 price, string brand, bool isUsedForCustomer))',
              params: [id],
            })

            if (retailProductData && retailProductData.retailer === activeAccount?.address) {
              retailProductList.push(retailProductData)
            }
          } catch (error) {
            console.error(`Error fetching retail product with ID ${id}:`, error)
            // Continue with other retail products even if one fails
          }
        }

        setRetailProducts(retailProductList)

        // Calculate stats
        const totalAdded = retailProductList.length
        const totalSold = retailProductList.filter((p) => !p.isAvailable).length

        // Safely calculate total value with BigInt
        let totalValue = BigInt(0)
        for (const product of retailProductList) {
          try {
            totalValue += product.price
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
        console.error('Error loading retail products:', error)
        toast.error('Failed to load retail products', {
          description: 'Please check your connection and try again',
        })
        setRetailProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    if (activeAccount?.address) {
      fetchRetailProducts()
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
            <Link href="/retailer" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Retailer Profile</h1>
              <p className="mt-1 text-sm text-gray-500">View your account details and activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Profile</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">{activeAccount?.address ? getInitials(activeAccount.address) : 'R'}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Retailer Account</h3>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">{activeAccount?.address || 'Not connected'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Statistics</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Your retail product statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50">
                  <Activity className="w-5 h-5 mb-1 text-primary" />
                  <span className="text-2xl font-semibold text-gray-900">{stats.totalAdded}</span>
                  <span className="text-xs text-gray-500">Total Added</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50">
                  <ShoppingBag className="w-5 h-5 mb-1 text-green-600" />
                  <span className="text-2xl font-semibold text-gray-900">{stats.totalSold}</span>
                  <span className="text-xs text-gray-500">Total Sold</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50">
                  <Package className="w-5 h-5 mb-1 text-blue-600" />
                  <span className="text-2xl font-semibold text-gray-900">{stats.totalValue.toFixed(4)}</span>
                  <span className="text-xs text-gray-500">Total Value (ETH)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Your latest retail products</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                  <span className="ml-2 text-gray-500">Loading activity...</span>
                </div>
              ) : retailProducts.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No retail products yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by adding retail products for sale</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/retailer/add-for-sale')}>
                    Add Retail Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {retailProducts.slice(0, 5).map((product) => (
                    <div key={product.id.toString()} className="flex items-start p-3 transition-colors border rounded-md hover:bg-gray-50">
                      <div className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full ${product.isAvailable ? 'bg-primary/10' : 'bg-green-100'}`}>
                        <ShoppingBag className={`w-4 h-4 ${product.isAvailable ? 'text-primary' : 'text-green-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.isAvailable ? 'Available' : 'Sold'} • {formatDate(product.timestamp)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{formatPrice(product.price)} ETH</div>
                    </div>
                  ))}
                  {retailProducts.length > 5 && (
                    <Button variant="outline" className="w-full" onClick={() => router.push('/retailer/transactions')}>
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
