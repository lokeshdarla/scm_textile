'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, Package, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useActiveAccount, useSendTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { prepareContractCall } from 'thirdweb'
import { contract } from '@/lib/client'

// Define the RawMaterial type based on the smart contract struct
interface RawMaterial {
  id: bigint
  farmerId: bigint
  materialType: string
  quantity: bigint
  price: bigint
  location: string
  isAvailable: boolean
  buyer?: string
  transactionHash?: string
}

// Define form data interface
interface FormData {
  materialType: string
  quantity: string
  price: string
  location: string
  description?: string
  unit?: string
}

// Dummy data for raw materials
const dummyRawMaterials: RawMaterial[] = [
  {
    id: BigInt(1),
    farmerId: BigInt(1),
    materialType: 'Cotton',
    quantity: BigInt(1000),
    price: BigInt('500000000000000000'), // 0.5 ETH in wei
    location: 'Farm A, Region X',
    isAvailable: true,
  },
  {
    id: BigInt(2),
    farmerId: BigInt(1),
    materialType: 'Wool',
    quantity: BigInt(500),
    price: BigInt('300000000000000000'), // 0.3 ETH in wei
    location: 'Farm B, Region Y',
    isAvailable: false,
    buyer: '0x1234...5678',
    transactionHash: '0xabcd...efgh',
  },
  {
    id: BigInt(3),
    farmerId: BigInt(1),
    materialType: 'Silk',
    quantity: BigInt(200),
    price: BigInt('800000000000000000'), // 0.8 ETH in wei
    location: 'Farm C, Region Z',
    isAvailable: true,
  },
  {
    id: BigInt(4),
    farmerId: BigInt(1),
    materialType: 'Hemp',
    quantity: BigInt(800),
    price: BigInt('400000000000000000'), // 0.4 ETH in wei
    location: 'Farm D, Region W',
    isAvailable: false,
    buyer: '0x8765...4321',
    transactionHash: '0xijkl...mnop',
  },
]

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
  const account = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Simulate network delay
      setTimeout(() => {
        setRawMaterials(dummyRawMaterials)
        setIsLoading(false)
        hideLoading()
      }, 2000)
    }

    loadData()
  }, [showLoading, hideLoading])

  // Filter raw materials based on search term
  const filteredMaterials = rawMaterials.filter(
    (material) => material.materialType.toLowerCase().includes(searchTerm.toLowerCase()) || material.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle adding new raw material
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    showLoading('Adding new raw material...')

    try {
      // Validate inputs
      if (!formData.materialType || !formData.quantity || !formData.price || !formData.location) {
        toast.error('Missing information', {
          description: 'Please fill in all required fields',
        })
        return
      }

      const transaction = await prepareContractCall({
        contract,
        method: 'function addRawMaterial(string _materialType, uint256 _quantity, uint256 _price, string _location) returns (uint256)',
        params: [formData.materialType, BigInt(formData.quantity), BigInt(parseFloat(formData.price) * 1e18), formData.location],
      })
      const { transactionHash } = await sendTx(transaction)

      const newId = BigInt(rawMaterials.length + 1)
      const newRawMaterial: RawMaterial = {
        id: newId,
        farmerId: BigInt(1),
        materialType: formData.materialType,
        quantity: BigInt(formData.quantity),
        price: BigInt(Math.floor(parseFloat(formData.price) * 1e18)),
        location: formData.location,
        isAvailable: true,
      }

      setRawMaterials([...rawMaterials, newRawMaterial])

      toast.success('Raw material added successfully!', {
        description: 'Your material has been added to the blockchain',
      })

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
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to add raw material. Please try again.')
    } finally {
      setIsSubmitting(false)
      hideLoading()
    }
  }

  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(4)
  }
  const getExplorerUrl = (txHash: string) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Farmer Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your raw materials and track sales</p>
          </div>
          <Button onClick={() => setAddMaterialDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Raw Material
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6">
        <Card className="h-full flex flex-col border-0 shadow-sm">
          <CardHeader className="pb-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-gray-900">Raw Materials</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">View and manage all your raw materials in the supply chain</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by material type or location..."
                  className="pl-10 bg-white border-gray-200 h-10 text-sm placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-500">Loading materials...</span>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No raw materials found</h3>
                <p className="text-sm text-gray-500 mt-1">Add your first raw material to get started</p>
              </div>
            ) : (
              <div className="overflow-auto h-full">
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
                      <TableRow key={material.id.toString()} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
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
                                className="h-8 border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                View
                              </Button>
                            )}
                            {!material.isAvailable && material.buyer && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
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
            <DialogDescription className="text-sm text-gray-500 mt-1">Enter the details of your raw material to add it to the blockchain</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMaterial}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="materialType" className="text-right text-sm text-gray-500">
                  Type
                </Label>
                <Input
                  id="materialType"
                  value={formData.materialType}
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                  className="col-span-3 h-10 border-gray-200"
                  placeholder="Cotton, Wool, etc."
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right text-sm text-gray-500">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="col-span-3 h-10 border-gray-200"
                  placeholder="100"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right text-sm text-gray-500">
                  Price (ETH)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="col-span-3 h-10 border-gray-200"
                  placeholder="0.5"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right text-sm text-gray-500">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="col-span-3 h-10 border-gray-200"
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
