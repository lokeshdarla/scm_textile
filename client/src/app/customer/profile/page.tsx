'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { readContract, prepareContractCall } from 'thirdweb'
import { useActiveAccount, useSendAndConfirmTransaction } from 'thirdweb/react'
import { contract } from '@/lib/client'
import { useLoading } from '@/components/providers/loading-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, User, History, RefreshCw, QrCode } from 'lucide-react'
import { RetailProduct } from '@/constants'
import Image from 'next/image'
import { generateQrFromUrl } from '@/constants/uploadToPinata'

export default function CustomerProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [purchasedProducts, setPurchasedProducts] = useState<RetailProduct[]>([])
  const [accountInfo, setAccountInfo] = useState<{
    address: string
    balance: string
  } | null>(null)
  const { mutateAsync: sendTx } = useSendAndConfirmTransaction()
  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()

  // Fetch purchased products
  const fetchPurchasedProducts = async () => {
    if (!activeAccount?.address) return

    setIsLoading(true)
    showLoading('Loading your purchased products...')

    try {
      // Get all retail product IDs
      let retailProductIds = await readContract({
        contract,
        method: 'function getAllRetailProducts() view returns (uint256[])',
        params: [],
      })

      // Fetch details for each retail product
      const products: RetailProduct[] = []

      for (const id of retailProductIds) {
        try {
          const productData = await readContract({
            contract,
            method:
              'function getRetailProduct(uint256 retailProductId) view returns ((uint256 id, address retailer, address customer, string qrCode, uint256[] packagedStockIds, bool isAvailable, uint256 timestamp, string name, uint256 price, string brand, bool isUsedForCustomer))',
            params: [id],
          })

          // Only include products purchased by the current user
          if (productData && productData.customer.toLowerCase() === activeAccount.address.toLowerCase() && !productData.isAvailable) {
            const qrCode = await generateQrFromUrl(productData.qrCode)
            products.push({ ...productData, qrCode })
          }
        } catch (error) {
          console.error(`Error fetching retail product with ID ${id}:`, error)
          // Continue with other products even if one fails
        }
      }

      setPurchasedProducts(products)
    } catch (error) {
      console.error('Error loading purchased products:', error)
      toast.error('Failed to load purchased products', {
        description: 'Please check your connection and try again',
      })
      setPurchasedProducts([])
    } finally {
      setIsLoading(false)
      hideLoading()
    }
  }

  // Fetch account information
  const fetchAccountInfo = async () => {
    if (!activeAccount?.address) return

    try {
      // Get account balance
      const balance = await readContract({
        contract,
        method: 'function getBalance() view returns (uint256)',
        params: [activeAccount.address],
      })

      setAccountInfo({
        address: activeAccount.address,
        balance: balance ? (Number(balance) / 1e18).toFixed(4) : '0',
      })
    } catch (error) {
      console.error('Error fetching account info:', error)
      setAccountInfo({
        address: activeAccount.address,
        balance: '0',
      })
    }
  }

  // Initial fetch
  useEffect(() => {
    if (activeAccount?.address) {
      fetchPurchasedProducts()
      fetchAccountInfo()
    } else {
      router.push('/')
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

  // Format address to show only first and last few characters
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customer Profile</h1>
            <p className="mt-1 text-sm text-gray-500">View your account information and purchased products</p>
          </div>
          <Button
            onClick={() => {
              fetchPurchasedProducts()
              fetchAccountInfo()
            }}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Tabs defaultValue="account" className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="account" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Purchased Products
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="w-4 h-4 mr-2" />
              Purchase History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="h-[calc(100%-60px)]">
            <Card className="h-full border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Account Information</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Your account details and balance</CardDescription>
              </CardHeader>
              <CardContent>
                {accountInfo ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">{formatAddress(accountInfo.address)}</p>
                        <p className="mt-1 text-xs text-gray-500">{accountInfo.address}</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Account Balance</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">{accountInfo.balance} ETH</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500">Account Summary</h3>
                      <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-500">Total Purchases</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">{purchasedProducts.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Spent</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">{purchasedProducts.reduce((total, product) => total + Number(product.price), 0) / 1e18} ETH</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {purchasedProducts.length > 0
                              ? formatDate(
                                  purchasedProducts.reduce((earliest, product) => (Number(product.timestamp) < Number(earliest.timestamp) ? product : earliest), purchasedProducts[0]).timestamp
                                )
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                    <span className="ml-2 text-gray-500">Loading account information...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="h-[calc(100%-60px)]">
            <Card className="h-full border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Purchased Products</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Products you have purchased</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                    <span className="ml-2 text-gray-500">Loading products...</span>
                  </div>
                ) : purchasedProducts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No purchased products</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't purchased any products yet</p>
                    <Button onClick={() => router.push('/customer')} className="mt-4 bg-primary hover:bg-primary/90">
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[600px] border rounded-md">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Brand</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">QR Code</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Purchase Date</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchasedProducts.map((product) => (
                          <TableRow key={product.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                            <TableCell className="p-4 text-sm font-medium text-gray-900">#{product.id.toString()}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-900">{product.name}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600 capitalize">{product.brand}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Image src={product.qrCode} alt="QR Code" width={100} height={100} />
                              </div>
                            </TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">{formatPrice(product.price)}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">{formatDate(product.timestamp)}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">
                              <Button onClick={() => router.push(`/customer/product/${product.id}`)} className="bg-primary hover:bg-primary/90">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="h-[calc(100%-60px)]">
            <Card className="h-full border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Purchase History</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Your recent purchase activity</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                    <span className="ml-2 text-gray-500">Loading history...</span>
                  </div>
                ) : purchasedProducts.length === 0 ? (
                  <div className="py-8 text-center">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No purchase history</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't made any purchases yet</p>
                    <Button onClick={() => router.push('/customer')} className="mt-4 bg-primary hover:bg-primary/90">
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedProducts
                      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                      .map((product) => (
                        <div key={product.id.toString()} className="p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.brand}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-medium text-gray-900">{formatPrice(product.price)} ETH</p>
                              <p className="text-sm text-gray-500">{formatDate(product.timestamp)}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                            <div className="flex items-center">
                              <Image src={product.qrCode} alt="QR Code" width={100} height={100} />
                            </div>
                            <Button onClick={() => router.push(`/customer/product/${product.id}`)} className="bg-primary hover:bg-primary/90">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
