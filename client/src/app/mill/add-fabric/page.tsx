'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActiveAccount, useReadContract, useSendAndConfirmTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { Package, Plus, Search, RefreshCw } from 'lucide-react'
import { isLoggedIn } from '@/actions/login'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { parseEther } from 'viem'
import { Textarea } from '@/components/ui/textarea'
import { uploadJsonDirect } from '@/constants/uploadToPinata'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Define the Apparel type based on the smart contract struct
interface RawMaterial {
  id: bigint
  farmer: string
  mill: string
  qrCode: string
  isAvailable: boolean
  timestamp: bigint
  name: string
  rawMaterialType: string
  quantity: bigint
  price: bigint
  isUsedForFabric: boolean
}

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

export default function AddFabricPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRawMaterial, setSelectedRawMaterial] = useState<string>('')

  // Form state
  const [qrCode, setQrCode] = useState('')
  const [name, setName] = useState('')
  const [composition, setComposition] = useState('')
  const [price, setPrice] = useState('')

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendAndConfirmTransaction()
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

  // Fetch purchased apparels
  const { data: availableRawMaterialIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getAllRawMaterials() view returns (uint256[])',
    params: [],
  })

  // State for purchased apparels
  const [purchasedRawMaterials, setPurchasedRawMaterials] = useState<RawMaterial[]>([])

  // Fetch details for each apparel
  useEffect(() => {
    const fetchRawMaterialDetails = async () => {
      if (!availableRawMaterialIds || !isIdsFetched || !activeAccount?.address) return

      setIsLoading(true)

      try {
        const rawMaterialList: RawMaterial[] = []

        for (const id of availableRawMaterialIds) {
          try {
            const rawMaterialData = await readContract({
              contract,
              method:
                'function getRawMaterial(uint256 rawMaterialId) view returns ((uint256 id, address farmer, address mill, string qrCode, bool isAvailable, uint256 timestamp, string name, string rawMaterialType, uint256 quantity, uint256 price, bool isUsedForFabric))',
              params: [id],
            })

            if (rawMaterialData && rawMaterialData.mill === activeAccount?.address && rawMaterialData.isUsedForFabric === false) {
              rawMaterialList.push(rawMaterialData)
            }
          } catch (error) {
            console.error(`Error fetching raw material with ID ${id}:`, error)
            // Continue with other raw materials even if one fails
          }
        }

        setPurchasedRawMaterials(rawMaterialList)
      } catch (error) {
        console.error('Error loading raw materials:', error)
        toast.error('Failed to load raw materials', {
          description: 'Please check your connection and try again',
        })
        setPurchasedRawMaterials([])
      } finally {
        setIsLoading(false)
      }
    }

    if (activeAccount?.address && availableRawMaterialIds && isIdsFetched) {
      fetchRawMaterialDetails()
    }
  }, [activeAccount, availableRawMaterialIds, isIdsFetched, hideLoading, showLoading])

  // Filter apparels based on search term
  const filteredRawMaterials = purchasedRawMaterials.filter(
    (rawMaterial) => rawMaterial.name.toLowerCase().includes(searchTerm.toLowerCase()) || rawMaterial.rawMaterialType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle raw material selection
  const handleRawMaterialSelection = (rawMaterialId: string) => {
    setSelectedRawMaterial(rawMaterialId)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!name || !composition || !price || selectedRawMaterial === '') {
      toast.error('Please fill in all fields and select one raw material', {
        description: 'All fields are required to create a new fabric',
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
    showLoading('Creating new fabric...')

    try {
      // Convert selected raw material IDs to bigint array
      const ids = []
      ids.push(selectedRawMaterial)

      const rawMaterialIds = ids.map((id) => BigInt(id))
      // Convert price to Wei (assuming price is in ETH)
      const priceInWei = parseEther(price)

      const rawMaterial = filteredRawMaterials.find((rawMaterial) => rawMaterial.id === rawMaterialIds[0])

      // Create a minimal data object for IPFS upload
      const minimalData = {
        name: name,
        composition: composition,
        price: price,
        rawMaterialId: rawMaterial?.id.toString() || '',
        rawMaterialName: rawMaterial?.name || '',
        rawMaterialType: rawMaterial?.rawMaterialType || '',
        timestamp: new Date().toISOString(),
      }

      console.log(minimalData)

      const qrCodeData = await uploadJsonDirect(minimalData)

      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function addFabric(string qrCode, uint256[] rawMaterialIds, string name, string composition, uint256 price)',
        params: [qrCodeData.cid, rawMaterialIds, name, composition, priceInWei],
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Fabric created successfully!', {
          description: `Your new fabric "${name}" has been created`,
          duration: 5000,
        })

        // Reset form
        setQrCode('')
        setName('')
        setComposition('')
        setPrice('')
        setSelectedRawMaterial('')

        // Navigate back to mill dashboard
        router.push('/mill')
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error creating fabric:', error)
      toast.error('Failed to create fabric', {
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
            <h1 className="text-2xl font-semibold text-gray-900">Add Fabric</h1>
            <p className="mt-1 text-sm text-gray-500">Add a new fabric to blockchain</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Package Details Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Fabric Details</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Enter the details of your fabric</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Fabric Name</Label>
                  <Input id="name" placeholder="Enter fabric name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="composition">Composition</Label>
                  <Textarea id="composition" placeholder="Enter fabric composition details" value={composition} onChange={(e) => setComposition(e.target.value)} required />
                  <p className="text-xs text-gray-500">Describe the composition of the fabric</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input id="price" type="number" step="0.0001" min="0" placeholder="Enter price in ETH" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            {/* Raw Material Selection Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Select Raw Materials</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Choose the raw materials to include in this fabric</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search raw material by name, type, or quantity..."
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
                ) : filteredRawMaterials.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No raw materials available</h3>
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
                        {filteredRawMaterials.map((rawMaterial) => (
                          <TableRow key={rawMaterial.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                            <TableCell className="p-4">
                              <RadioGroup value={selectedRawMaterial} onValueChange={handleRawMaterialSelection}>
                                <RadioGroupItem value={rawMaterial.id.toString()} id={`radio-${rawMaterial.id}`} disabled={rawMaterial.isUsedForFabric === true} />
                              </RadioGroup>
                            </TableCell>
                            <TableCell className="p-4 text-sm font-medium text-gray-900">{rawMaterial.name}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600 capitalize">{rawMaterial.rawMaterialType}</TableCell>
                            <TableCell className="p-4 text-sm text-gray-600">{rawMaterial.quantity}</TableCell>
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
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting || selectedRawMaterial === ''}>
              {isSubmitting ? 'Creating...' : 'Create Fabric'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
