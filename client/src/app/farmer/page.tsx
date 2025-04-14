'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, Package, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useActiveAccount, useContractEvents, useReadContract, useSendTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { parseEther } from 'viem'
import { RawMaterial } from '@/constants'
import { uploadJsonDirect } from '@/constants/uploadToPinata'
// Define form data interface
interface FormData {
  materialType: string
  quantity: string
  price: string
  location: string
  description?: string
  unit?: string
}

export default function FarmerDashboard() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [addMaterialDialogOpen, setAddMaterialDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    materialType: '',
    quantity: '',
    price: '',
    location: '',
    description: '',
    unit: 'kg',
  })

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()

  // Fetch raw materials
  const fetchRawMaterials = async () => {
    setIsLoading(true)
    showLoading('Loading raw materials...')

    if (!activeAccount) {
      toast.error('Please connect your wallet to continue')
      setIsLoading(false)
      hideLoading()
      return
    }

    try {
      // First, get all raw material IDs
      const rawMaterialIds = await readContract({
        contract,
        method: 'function getAllRawMaterials() view returns (uint256[])',
        params: [],
      })

      if (!rawMaterialIds || rawMaterialIds.length === 0) {
        setRawMaterials([])
        return
      }

      // Then fetch details for each raw material
      const materialList: RawMaterial[] = []

      for (const id of rawMaterialIds) {
        try {
          const materialData = await readContract({
            contract,
            method:
              'function getRawMaterial(uint256 rawMaterialId) view returns ((uint256 id, address farmer, address mill, string qrCode, bool isAvailable, uint256 timestamp, string name, string rawMaterialType, uint256 quantity, uint256 price, bool isUsedForFabric))',
            params: [id],
          })

          if (materialData && materialData.farmer === activeAccount?.address) {
            // Convert the contract data to our RawMaterial interface
            const material: RawMaterial = {
              id: materialData.id,
              farmerId: BigInt(materialData.farmer),
              materialType: materialData.rawMaterialType,
              quantity: materialData.quantity,
              price: materialData.price,
              location: 'N/A',
              isAvailable: materialData.isAvailable,
              isUsedForFabric: materialData.isUsedForFabric,
              buyer: materialData.mill !== '0x0000000000000000000000000000000000000000' ? materialData.mill : undefined,
            }

            materialList.push(material)
          }
        } catch (error) {
          console.error(`Error fetching raw material with ID ${id}:`, error)
          // Continue with other materials even if one fails
        }
      }

      setRawMaterials(materialList)
    } catch (error) {
      console.error('Error loading raw materials:', error)
      toast.error('Failed to load raw materials', {
        description: 'Please check your connection and try again',
      })
      setRawMaterials([])
    } finally {
      setIsLoading(false)
      hideLoading()
    }
  }

  // Load data from the blockchain on component mount
  useEffect(() => {
    fetchRawMaterials()
  }, [])

  // Filter raw materials based on search term
  const filteredMaterials = rawMaterials.filter(
    (material) => material.materialType.toLowerCase().includes(searchTerm.toLowerCase()) || material.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle adding new raw material
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!formData.materialType || !formData.quantity || !formData.price || !formData.location) {
      toast.error('Missing information', {
        description: 'Please fill in all required fields',
      })
      return
    }

    // Validate numeric inputs
    const quantity = parseInt(formData.quantity)
    const price = parseFloat(formData.price)

    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Invalid quantity', {
        description: 'Please enter a valid positive number',
      })
      return
    }

    if (isNaN(price) || price <= 0) {
      toast.error('Invalid price', {
        description: 'Please enter a valid positive price',
      })
      return
    }

    setIsSubmitting(true)
    showLoading('Adding new raw material to blockchain...')

    const data = {
      name: formData.materialType,
      quantity: formData.quantity,
      price: formData.price,
      location: formData.location,
      description: formData.description,
      unit: formData.unit,
      walletAddress: activeAccount?.address,
      timestamp: new Date().toISOString(),
    }

    const qrCode = await uploadJsonDirect(data)

    try {
      // Convert price from ETH to Wei
      const priceInWei = parseEther(formData.price)

      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function addRawMaterial(string qrCode, string name, string rawMaterialType, uint256 quantity, uint256 price)',
        params: [qrCode.cid, formData.materialType, formData.materialType, BigInt(quantity), priceInWei],
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Raw material added successfully!', {
          description: `Your raw material has been added to the blockchain`,
          duration: 5000,
        })

        // Create new material object with transaction hash
        const newId = BigInt(rawMaterials.length + 1)
        const newRawMaterial: RawMaterial = {
          id: newId,
          farmerId: BigInt(activeAccount?.address || 0),
          materialType: formData.materialType,
          quantity: BigInt(quantity),
          price: priceInWei,
          location: formData.location,
          isAvailable: true,
          transactionHash: tx.transactionHash,
          isUsedForFabric: false,
        }

        // Add to local state
        setRawMaterials([...rawMaterials, newRawMaterial])

        // Reset form and close dialog
        setFormData({
          materialType: '',
          quantity: '',
          price: '',
          location: '',
          description: '',
          unit: 'kg',
        })

        setAddMaterialDialogOpen(false)
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to add raw material', {
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

  // Get blockchain explorer URL
  const getExplorerUrl = (txHash: string) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Farmer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your raw materials and track sales</p>
          </div>
          <Button onClick={() => setAddMaterialDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Raw Material
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Card className="flex flex-col h-full border-0 shadow-sm">
          <CardHeader className="pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Raw Materials</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">View and manage all your raw materials in the supply chain</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search by material type or location..."
                  className="h-10 pl-10 text-sm bg-white border-gray-200 placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={fetchRawMaterials} variant="outline" className="border-gray-200" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-b-2 rounded-full animate-spin border-primary"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                <span className="ml-2 text-gray-500">Loading materials...</span>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">No raw materials found</h3>
                <p className="mt-1 text-sm text-gray-500">Add your first raw material to get started</p>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Material Type</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Quantity</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Location</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Status</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="p-4 text-sm font-medium text-gray-900">#{material.id.toString()}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{material.materialType}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{material.quantity.toString()}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatPrice(material.price)}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{material.location}</TableCell>
                        <TableCell className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${material.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {material.isAvailable ? 'Available' : 'Sold'}
                          </span>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="flex items-center space-x-2">
                            {material.transactionHash && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(getExplorerUrl(material.transactionHash!), '_blank')}
                                className="h-8 text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300"
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                View
                              </Button>
                            )}
                            {!material.isAvailable && material.buyer && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300"
                                onClick={() =>
                                  toast.info('Buyer Information', {
                                    description: `Sold to: ${material.buyer}`,
                                  })
                                }
                              >
                                Buyer
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Material Dialog */}
      <Dialog open={addMaterialDialogOpen} onOpenChange={setAddMaterialDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Add New Raw Material</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-500">Enter the details of your raw material to add it to the blockchain</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMaterial}>
            <div className="grid gap-4 py-4">
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="materialType" className="text-sm text-right text-gray-500">
                  Type
                </Label>
                <Input
                  id="materialType"
                  value={formData.materialType}
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                  className="h-10 col-span-3 border-gray-200"
                  placeholder="Cotton, Wool, etc."
                  required
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="quantity" className="text-sm text-right text-gray-500">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="h-10 col-span-3 border-gray-200"
                  placeholder="100"
                  required
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="price" className="text-sm text-right text-gray-500">
                  Price (ETH)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-10 col-span-3 border-gray-200"
                  placeholder="0.5"
                  required
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="location" className="text-sm text-right text-gray-500">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-10 col-span-3 border-gray-200"
                  placeholder="Farm location"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddMaterialDialogOpen(false)} className="border-gray-200">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Material'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
