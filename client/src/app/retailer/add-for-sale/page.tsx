'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { Package, Plus, Search, ShoppingBag } from 'lucide-react'
import { isLoggedIn } from '@/actions/login'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Define the PackagedStock type based on the smart contract struct
interface PackagedStock {
  id: bigint
  distributor: string
  retailer: string
  qrCode: string
  apparelIds: readonly bigint[]
  isAvailable: boolean
  timestamp: bigint
  name: string
  quantity: bigint
  price: bigint
}

export default function AddForSalePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set())

  // Form state
  const [qrCode, setQrCode] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [brand, setBrand] = useState('')

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()
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

  // Fetch retailer's packaged stocks
  const { data: retailerStockIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getAllPackagedStocks() view returns (uint256[])',
    params: [],
  })

  // State for packaged stocks
  const [packagedStocks, setPackagedStocks] = useState<PackagedStock[]>([])

  // Fetch details for each packaged stock
  useEffect(() => {
    const fetchStockDetails = async () => {
      if (!retailerStockIds || !isIdsFetched || !activeAccount?.address) return

      setIsLoading(true)

      try {
        const stockList: PackagedStock[] = []

        for (const id of retailerStockIds) {
          try {
            const stockData = await readContract({
              contract,
              method:
                'function getPackagedStock(uint256 packagedStockId) view returns ((uint256 id, address distributor, address retailer, string qrCode, uint256[] apparelIds, bool isAvailable, uint256 timestamp, string name, uint256 quantity, uint256 price))',
              params: [id],
            })

            if (stockData && stockData.retailer === activeAccount?.address) {
              stockList.push(stockData)
            }
          } catch (error) {
            console.error(`Error fetching packaged stock with ID ${id}:`, error)
            // Continue with other stocks even if one fails
          }
        }

        setPackagedStocks(stockList)
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

    if (activeAccount?.address && retailerStockIds && isIdsFetched) {
      fetchStockDetails()
    }
  }, [activeAccount, retailerStockIds, isIdsFetched, hideLoading, showLoading])

  // Filter stocks based on search term
  const filteredStocks = packagedStocks.filter((stock) => stock.name.toLowerCase().includes(searchTerm.toLowerCase()) || stock.qrCode.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle stock selection
  const handleStockSelection = (stockId: string) => {
    const newSelectedStocks = new Set(selectedStocks)
    if (newSelectedStocks.has(stockId)) {
      newSelectedStocks.delete(stockId)
    } else {
      newSelectedStocks.add(stockId)
    }
    setSelectedStocks(newSelectedStocks)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!qrCode || !name || !price || !brand || selectedStocks.size === 0) {
      toast.error('Please fill in all fields and select at least one packaged stock', {
        description: 'All fields are required to create a new retail product',
      })
      return
    }

    // Validate price is a positive number
    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Invalid price', {
        description: 'Please enter a valid positive number for the price',
      })
      return
    }

    setIsSubmitting(true)
    showLoading('Creating new retail product...')

    try {
      // Convert selected stock IDs to bigint array
      const packagedStockIds = Array.from(selectedStocks).map((id) => BigInt(id))

      // Convert price to Wei (assuming price is in ETH)
      const priceInWei = BigInt(Math.floor(priceValue * 1e18))

      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function addRetailProduct(string qrCode, uint256[] packagedStockIds, string name, uint256 price, string brand)',
        params: [qrCode, packagedStockIds, name, priceInWei, brand],
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Retail product created successfully!', {
          description: `Your new product "${name}" has been created`,
          duration: 5000,
        })

        // Reset form
        setQrCode('')
        setName('')
        setPrice('')
        setBrand('')
        setSelectedStocks(new Set())

        // Navigate back to retailer dashboard
        router.push('/retailer')
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error creating retail product:', error)
      toast.error('Failed to create retail product', {
        description: 'Please try again or check your wallet connection',
      })
    } finally {
      setIsSubmitting(false)
      hideLoading()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add Product for Sale</h1>
            <p className="mt-1 text-sm text-gray-500">Create a new retail product from your packaged stocks</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Product Details Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Product Details</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Enter the details of your retail product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qrCode">QR Code</Label>
                  <Input id="qrCode" placeholder="Enter QR code for the product" value={qrCode} onChange={(e) => setQrCode(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="Enter product name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" placeholder="Enter brand name" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input id="price" type="number" step="0.0001" min="0" placeholder="Enter price in ETH" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            {/* Packaged Stock Selection Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Select Packaged Stocks</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Choose the packaged stocks to include in this product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search packaged stocks by name or QR code..."
                    className="h-10 pl-10 text-sm bg-white border-gray-200 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                    <span className="ml-2 text-gray-500">Loading packaged stocks...</span>
                  </div>
                ) : filteredStocks.length === 0 ? (
                  <div className="py-8 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No packaged stocks available</h3>
                    <p className="mt-1 text-sm text-gray-500">You need to purchase packaged stocks before creating a retail product</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/retailer')}>
                      Go to Marketplace
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[400px] border rounded-md">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="w-10 h-12 px-4 text-xs font-medium text-gray-500"></TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">QR Code</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStocks.map((stock) => (
                          <TableRow key={stock.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                            <TableCell className="p-4">
                              <Checkbox checked={selectedStocks.has(stock.id.toString())} onCheckedChange={() => handleStockSelection(stock.id.toString())} />
                            </TableCell>
                            <TableCell className="p-4 text-sm font-medium text-gray-900">{stock.name}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">{stock.qrCode}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">{stock.quantity.toString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push('/retailer')} className="border-gray-200">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting || selectedStocks.size === 0}>
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
