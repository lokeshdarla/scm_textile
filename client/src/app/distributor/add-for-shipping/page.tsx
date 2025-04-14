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
import { Package, Search } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { parseEther } from 'viem'
import { uploadJsonDirect } from '@/constants/uploadToPinata'
// Define the Apparel type based on the smart contract struct
interface Apparel {
  id: bigint
  manufacturer: string
  distributor: string
  qrCode: string
  fabricIds: readonly bigint[]
  isAvailable: boolean
  timestamp: bigint
  name: string
  category: string
  size: string
  price: bigint
  isUsedForPackagedStock: boolean
}

export default function AddForShippingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApparel, setSelectedApparel] = useState<string>('')

  // Form state
  const [qrCode, setQrCode] = useState('')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()
  const router = useRouter()

  // Check if user is connected

  // Fetch purchased apparels
  const { data: availableApparelIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getALlApparels() view returns (uint256[])',
    params: [],
  })

  // State for purchased apparels
  const [purchasedApparels, setPurchasedApparels] = useState<Apparel[]>([])

  // Fetch details for each apparel
  useEffect(() => {
    const fetchApparelDetails = async () => {
      if (!availableApparelIds || !isIdsFetched || !activeAccount?.address) return
      setIsLoading(true)

      try {
        const apparelList: Apparel[] = []

        for (const apparelId of availableApparelIds) {
          try {
            const apparelData = await readContract({
              contract,
              method:
                'function getApparel(uint256 apparelId) view returns ((uint256 id, address manufacturer, address distributor, string qrCode, uint256[] fabricIds, bool isAvailable, uint256 timestamp, string name, string category, string size, uint256 price, bool isUsedForPackagedStock))',
              params: [apparelId],
            })

            console.log(apparelData)

            if (apparelData && apparelData.distributor === activeAccount?.address && apparelData.isUsedForPackagedStock === false) {
              apparelList.push(apparelData)
            }
          } catch (error) {
            console.error(`Error fetching apparel with ID ${apparelId}:`, error)
            // Continue with other apparels even if one fails
          }
        }

        setPurchasedApparels(apparelList)
      } catch (error) {
        console.error('Error loading apparels:', error)
        toast.error('Failed to load apparel products', {
          description: 'Please check your connection and try again',
        })
        setPurchasedApparels([])
      } finally {
        setIsLoading(false)
        hideLoading()
      }
    }

    if (activeAccount?.address && availableApparelIds && isIdsFetched) {
      fetchApparelDetails()
    }
  }, [activeAccount, availableApparelIds, isIdsFetched])

  // Filter apparels based on search term
  const filteredApparels = purchasedApparels.filter(
    (apparel) =>
      apparel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apparel.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apparel.size.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle apparel selection
  const handleApparelSelection = (apparelId: string) => {
    setSelectedApparel(apparelId)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!name || !quantity || !price || selectedApparel === '') {
      toast.error('Please fill in all fields and select at least one apparel product', {
        description: 'All fields are required to create a new packaged stock',
      })
      return
    }

    // Validate quantity is a positive integer
    const quantityValue = parseInt(quantity)
    if (isNaN(quantityValue) || quantityValue <= 0) {
      toast.error('Invalid quantity', {
        description: 'Please enter a valid positive number for the quantity',
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
    showLoading('Creating new packaged stock...')

    try {
      // Convert selected apparel IDs to bigint array
      const ids = []
      ids.push(selectedApparel)
      const apparelIds = ids.map((id) => BigInt(id))

      // Convert price to Wei (assuming price is in ETH)
      const priceInWei = parseEther(price)

      const apparel = filteredApparels.find((apparel) => apparel.id === apparelIds[0])

      // Convert BigInt values to strings for JSON serialization
      const serializedApparel = apparel
        ? {
            ...apparel,
            id: apparel.id.toString(),
            timestamp: apparel.timestamp.toString(),
            price: apparel.price.toString(),
            fabricIds: apparel.fabricIds.map((id) => id.toString()),
          }
        : null

      const data = {
        name: name,
        apparel: serializedApparel,
        quantity: quantity,
        price: price,
        timestamp: new Date().toISOString(),
      }

      const qrCodeData = await uploadJsonDirect(data)

      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function addPackagedStock(string qrCode, uint256[] apparelIds, string name, uint256 quantity, uint256 price)',
        params: [qrCodeData.cid, apparelIds, name, BigInt(quantityValue), priceInWei],
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Packaged stock created successfully!', {
          description: `Your new packaged stock "${name}" has been created`,
          duration: 5000,
        })

        // Reset form
        setQrCode('')
        setName('')
        setQuantity('')
        setPrice('')
        setSelectedApparel('')

        // Navigate back to distributor dashboard
        router.push('/distributor')
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error creating packaged stock:', error)
      toast.error('Failed to create packaged stock', {
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
            <h1 className="text-2xl font-semibold text-gray-900">Add Packaged Stock for Shipping</h1>
            <p className="mt-1 text-sm text-gray-500">Package apparel products for shipping</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Package Details Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Package Details</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Enter the details of your packaged stock</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input id="name" placeholder="Enter package name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" placeholder="Enter quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input id="price" type="number" step="0.0001" min="0" placeholder="Enter price in ETH" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            {/* Apparel Selection Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Select Apparel Products</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Choose the apparel products to include in this package</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search apparel by name, category, or size..."
                    className="h-10 pl-10 text-sm bg-white border-gray-200 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                    <span className="ml-2 text-gray-500">Loading apparel products...</span>
                  </div>
                ) : filteredApparels.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No apparel products available</h3>
                    <p className="mt-1 text-sm text-gray-500">You need to purchase apparel products before creating a package</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/distributor')}>
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
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Category</TableHead>
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Size</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApparels.map((apparel) => (
                          <TableRow key={apparel.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                            <TableCell className="p-4">
                              <RadioGroup value={selectedApparel} onValueChange={handleApparelSelection}>
                                <RadioGroupItem value={apparel.id.toString()} id={`radio-${apparel.id}`} />
                              </RadioGroup>
                            </TableCell>
                            <TableCell className="p-4 text-sm font-medium text-gray-900">{apparel.name}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600 capitalize">{apparel.category}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">{apparel.size}</TableCell>
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
            <Button type="button" variant="outline" onClick={() => router.push('/distributor')} className="border-gray-200">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting || selectedApparel === ''}>
              {isSubmitting ? 'Creating...' : 'Create Package'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
