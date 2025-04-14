'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Plus } from 'lucide-react'
import Link from 'next/link'
import { isLoggedIn } from '@/actions/login'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Define the RawMaterial type based on the smart contract struct
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
}

export default function AddFabricPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [purchasedMaterials, setPurchasedMaterials] = useState<RawMaterial[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<bigint[]>([])

  // Form state
  const [qrCode, setQrCode] = useState('')
  const [name, setName] = useState('')
  const [composition, setComposition] = useState('')
  const [price, setPrice] = useState('')

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()
  const router = useRouter()

  // Check authentication on component mount
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const loggedIn = await isLoggedIn()
  //       if (!loggedIn) {
  //         toast.error('Authentication required', {
  //           description: 'Please log in to access the dashboard',
  //         })
  //         router.push('/login')
  //       }
  //     } catch (error) {
  //       console.error('Auth check failed:', error)
  //       router.push('/login')
  //     }
  //   }

  //   checkAuth()
  // }, [router])

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

  // Fetch purchased raw materials
  const { data: purchasedMaterialIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getMillPurchasedMaterials() view returns (uint256[])',
    params: [],
  })

  // Fetch details for each purchased raw material
  useEffect(() => {
    const fetchMaterialDetails = async () => {
      if (!purchasedMaterialIds || !isIdsFetched) return

      setIsLoading(true)
      showLoading('Loading purchased materials...')

      try {
        const materials: RawMaterial[] = []

        for (const id of purchasedMaterialIds) {
          // Use readContract instead of contract.read
          const materialData = await readContract({
            contract,
            method:
              'function getRawMaterial(uint256 rawMaterialId) view returns ((uint256 id, address farmer, address mill, string qrCode, bool isAvailable, uint256 timestamp, string name, string rawMaterialType, uint256 quantity, uint256 price))',
            params: [id],
          })

          if (materialData) {
            materials.push(materialData)
          }
        }

        setPurchasedMaterials(materials)
      } catch (error) {
        console.error('Error loading purchased materials:', error)
        toast.error('Failed to load purchased materials', {
          description: 'Please check your connection and try again',
        })
        setPurchasedMaterials([])
      } finally {
        setIsLoading(false)
        hideLoading()
      }
    }

    if (activeAccount?.address && purchasedMaterialIds && isIdsFetched) {
      fetchMaterialDetails()
    }
  }, [activeAccount, purchasedMaterialIds, isIdsFetched, hideLoading, showLoading])

  // Handle material selection
  const handleMaterialSelect = (materialId: bigint) => {
    setSelectedMaterials((prev) => {
      if (prev.includes(materialId)) {
        return prev.filter((id) => id !== materialId)
      } else {
        return [...prev, materialId]
      }
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeAccount?.address) {
      toast.error('No wallet connected', {
        description: 'Please connect your wallet to continue',
      })
      return
    }

    if (selectedMaterials.length === 0) {
      toast.error('No materials selected', {
        description: 'Please select at least one raw material',
      })
      return
    }

    if (!qrCode || !name || !composition || !price) {
      toast.error('Missing information', {
        description: 'Please fill in all required fields',
      })
      return
    }

    setIsSubmitting(true)
    showLoading('Creating fabric...')

    try {
      // Convert price to Wei (assuming price is in ETH)
      const priceInWei = BigInt(Math.floor(parseFloat(price) * 1e18))

      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function addFabric(string qrCode, uint256[] rawMaterialIds, string name, string composition, uint256 price)',
        params: [qrCode, selectedMaterials, name, composition, priceInWei],
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Fabric created successfully!', {
          description: `Your fabric "${name}" has been added to the blockchain`,
          duration: 5000,
        })

        // Reset form
        setQrCode('')
        setName('')
        setComposition('')
        setPrice('')
        setSelectedMaterials([])

        // Redirect to mill dashboard
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

  // Format price from Wei to ETH for display
  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(4)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link href="/mill" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add New Fabric</h1>
              <p className="mt-1 text-sm text-gray-500">Create a new fabric using purchased raw materials</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Card className="flex flex-col h-full border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-900">Fabric Details</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">Enter the details of your new fabric</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qrCode">QR Code</Label>
                  <Input id="qrCode" placeholder="Enter QR code for the fabric" value={qrCode} onChange={(e) => setQrCode(e.target.value)} required />
                  <p className="text-xs text-gray-500">Unique identifier for the fabric</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Fabric Name</Label>
                  <Input id="name" placeholder="Enter fabric name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="composition">Composition</Label>
                  <Textarea id="composition" placeholder="Enter fabric composition details" value={composition} onChange={(e) => setComposition(e.target.value)} required />
                  <p className="text-xs text-gray-500">Describe the composition of the fabric</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input id="price" type="number" step="0.0001" min="0" placeholder="Enter price in ETH" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Select Raw Materials</h3>
                <p className="text-sm text-gray-500">Choose the raw materials used in this fabric</p>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                    <span className="ml-2 text-gray-500">Loading materials...</span>
                  </div>
                ) : purchasedMaterials.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No purchased materials available</h3>
                    <p className="mt-1 text-sm text-gray-500">You need to purchase raw materials first</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/mill')}>
                      Go to Mill Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchasedMaterials.map((material) => (
                          <TableRow key={material.id.toString()}>
                            <TableCell>
                              <Checkbox checked={selectedMaterials.includes(material.id)} onCheckedChange={() => handleMaterialSelect(material.id)} />
                            </TableCell>
                            <TableCell className="font-medium">#{material.id.toString()}</TableCell>
                            <TableCell>{material.name}</TableCell>
                            <TableCell>{material.rawMaterialType}</TableCell>
                            <TableCell>{material.quantity.toString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push('/mill')} className="border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting || selectedMaterials.length === 0}>
                  {isSubmitting ? 'Creating...' : 'Create Fabric'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
