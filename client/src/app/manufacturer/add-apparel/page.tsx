'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { Package, Search } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { uploadJsonDirect } from '@/constants/uploadToPinata'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { parseEther } from 'viem'
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
  isUsedForApparel: boolean
}

export default function AddProductPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFabric, setSelectedFabric] = useState<string>('')

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [size, setSize] = useState('')
  const [price, setPrice] = useState('')

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()
  const router = useRouter()

  // Fetch purchased fabrics
  const { data: purchasedFabricIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getAllFabrics() view returns (uint256[])',
    params: [],
  })

  // State for purchased fabrics
  const [purchasedFabrics, setPurchasedFabrics] = useState<Fabric[]>([])

  // Fetch details for each fabric
  useEffect(() => {
    const fetchFabricDetails = async () => {
      if (!purchasedFabricIds || !isIdsFetched || !activeAccount?.address) return

      setIsLoading(true)

      try {
        const fabricList: Fabric[] = []

        for (const id of purchasedFabricIds) {
          try {
            const fabricData = await readContract({
              contract,
              method:
                'function getFabric(uint256 fabricId) view returns ((uint256 id, address mill, address manufacturer, string qrCode, uint256[] rawMaterialIds, bool isAvailable, uint256 timestamp, string name, string composition, uint256 price,bool isUsedForApparel))',
              params: [id],
            })

            if (fabricData && fabricData.manufacturer === activeAccount?.address && !fabricData.isUsedForApparel) {
              fabricList.push(fabricData)
            }
          } catch (error) {
            console.error(`Error fetching fabric with ID ${id}:`, error)
            // Continue with other fabrics even if one fails
          }
        }

        setPurchasedFabrics(fabricList)
      } catch (error) {
        console.error('Error loading fabrics:', error)
        toast.error('Failed to load fabrics', {
          description: 'Please check your connection and try again',
        })
        setPurchasedFabrics([])
      } finally {
        setIsLoading(false)
      }
    }

    if (activeAccount?.address && purchasedFabricIds && isIdsFetched) {
      fetchFabricDetails()
    }
  }, [activeAccount, purchasedFabricIds, isIdsFetched])

  // Filter fabrics based on search term
  const filteredFabrics = purchasedFabrics.filter((fabric) => fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) || fabric.composition.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle fabric selection
  const handleFabricSelection = (fabricId: string) => {
    setSelectedFabric(fabricId)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!name || !category || !size || !price || selectedFabric === '') {
      toast.error('Please fill in all fields and select at least one fabric', {
        description: 'All fields are required to create a new apparel product',
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
    showLoading('Creating new apparel product...')

    try {
      const fabricDetail = purchasedFabrics.find((fabric) => fabric.id.toString() === BigInt(selectedFabric).toString())

      // Convert BigInt values to strings for JSON serialization
      const serializedFabricDetail = fabricDetail
        ? {
            ...fabricDetail,
            id: fabricDetail.id.toString(),
            timestamp: fabricDetail.timestamp.toString(),
            price: fabricDetail.price.toString(),
            rawMaterialIds: fabricDetail.rawMaterialIds.map((id) => id.toString()),
          }
        : null

      const data = {
        name: name,
        category: category,
        size: size,
        price: price,
        fabric: serializedFabricDetail,
      }

      const qrCodeData = await uploadJsonDirect(data)

      // Convert selected fabric IDs to bigint array
      const fabricIds = [BigInt(selectedFabric)]

      // Convert price to Wei (assuming price is in ETH)
      const priceInWei = parseEther(price)

      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function addApparel(string qrCode, uint256[] fabricIds, string name, string category, string size, uint256 price)',
        params: [qrCodeData.cid, fabricIds, name, category, size, priceInWei],
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Product created successfully!', {
          description: `Your new apparel product "${name}" has been created`,
          duration: 5000,
        })

        // Reset form
        setName('')
        setCategory('')
        setSize('')
        setPrice('')
        setSelectedFabric('')

        // Navigate back to manufacturer dashboard
        router.push('/manufacturer')
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error creating apparel product:', error)
      toast.error('Failed to create product', {
        description: 'Please try again or check your wallet connection',
      })
    } finally {
      setIsSubmitting(false)
      hideLoading()
    }
  }

  return (
    <div className="flex flex-col overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add New Apparel Product</h1>
            <p className="mt-1 text-sm text-gray-500">Create a new apparel product using your purchased fabrics</p>
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
                <CardDescription className="mt-1 text-sm text-gray-500">Enter the details of your new apparel product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="Enter product name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shirt">Shirt</SelectItem>
                      <SelectItem value="pants">Pants</SelectItem>
                      <SelectItem value="dress">Dress</SelectItem>
                      <SelectItem value="jacket">Jacket</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={size} onValueChange={setSize} required>
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input id="price" type="number" step="0.0001" min="0" placeholder="Enter price in ETH" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            {/* Fabric Selection Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Select Fabrics</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Choose the fabrics to use in your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search fabrics by name or composition..."
                    className="h-10 pl-10 text-sm bg-white border-gray-200 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                    <span className="ml-2 text-gray-500">Loading fabrics...</span>
                  </div>
                ) : filteredFabrics.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No fabrics available</h3>
                    <p className="mt-1 text-sm text-gray-500">You need to purchase fabrics before creating a product</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/manufacturer')}>
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
                          <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Composition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFabrics.map((fabric) => (
                          <TableRow key={fabric.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                            <TableCell className="p-4">
                              <RadioGroup value={selectedFabric} onValueChange={(value) => setSelectedFabric(value)}>
                                <RadioGroupItem value={fabric.id.toString()} id={`radio-${fabric.id}`} />
                              </RadioGroup>
                            </TableCell>
                            <TableCell className="p-4 text-sm font-medium text-gray-900">{fabric.name}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">{fabric.composition}</TableCell>
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
            <Button type="button" variant="outline" onClick={() => router.push('/manufacturer')} className="border-gray-200">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting || selectedFabric === ''}>
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
