'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, Package, Search, ShoppingCart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { parseEther } from 'viem'
import { isLoggedIn } from '@/actions/login'

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

export default function MillDashboard() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Fetch available raw materials
  const { data: availableMaterialIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getAvailableRawMaterials() view returns (uint256[])',
    params: [],
  })

  // Fetch details for each raw material
  useEffect(() => {
    const fetchMaterialDetails = async () => {
      if (!availableMaterialIds || !isIdsFetched) return

      setIsLoading(true)
      // showLoading('Loading available raw materials...')

      try {
        const materials: RawMaterial[] = []

        for (const id of availableMaterialIds) {
          // Use readContract instead of useReadContract hook
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

        setRawMaterials(materials)
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

    if (activeAccount?.address && availableMaterialIds && isIdsFetched) {
      fetchMaterialDetails()
    }
  }, [activeAccount, availableMaterialIds, isIdsFetched, hideLoading, showLoading])

  // Filter raw materials based on search term
  const filteredMaterials = rawMaterials.filter(
    (material) => material.rawMaterialType.toLowerCase().includes(searchTerm.toLowerCase()) || material.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle purchasing a raw material
  const handlePurchase = async () => {
    if (!selectedMaterial) return

    setIsSubmitting(true)
    showLoading('Processing purchase...')

    try {
      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function buyRawMaterial(uint256 rawMaterialId) payable',
        params: [selectedMaterial.id],
        value: selectedMaterial.price,
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Purchase successful!', {
          description: `You have purchased ${selectedMaterial.quantity.toString()} ${selectedMaterial.rawMaterialType}`,
          duration: 5000,
        })

        // Update local state
        setRawMaterials(rawMaterials.filter((m) => m.id !== selectedMaterial.id))

        // Close dialog
        setPurchaseDialogOpen(false)
        setSelectedMaterial(null)
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error purchasing material:', error)
      toast.error('Purchase failed', {
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

  // Format timestamp to readable date
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mill Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Browse and purchase available raw materials</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Card className="flex flex-col h-full border-0 shadow-sm">
          <CardHeader className="pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Available Raw Materials</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Browse and purchase raw materials from farmers</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search by material type or name..."
                  className="h-10 pl-10 text-sm bg-white border-gray-200 placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                <h3 className="text-lg font-medium text-gray-900">No raw materials available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new materials</p>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Type</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Quantity</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Date Added</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="p-4 text-sm font-medium text-gray-900">#{material.id.toString()}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{material.name}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{material.rawMaterialType}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{material.quantity.toString()}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatPrice(material.price)}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatDate(material.timestamp)}</TableCell>
                        <TableCell className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMaterial(material)
                                setPurchaseDialogOpen(true)
                              }}
                              className="h-8 text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300"
                            >
                              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                              Purchase
                            </Button>
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

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Purchase Raw Material</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-500">Confirm your purchase details</DialogDescription>
          </DialogHeader>
          {selectedMaterial && (
            <div className="grid gap-4 py-4">
              <div className="p-4 space-y-2 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Material:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedMaterial.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedMaterial.rawMaterialType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Quantity:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedMaterial.quantity.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Price:</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(selectedMaterial.price)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Farmer:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedMaterial.farmer.substring(0, 6)}...{selectedMaterial.farmer.substring(selectedMaterial.farmer.length - 4)}
                  </span>
                </div>
              </div>
              <div className="p-3 text-sm text-center rounded-md bg-primary/10 text-primary">
                <p className="font-medium">Transaction Required</p>
                <p className="mt-1 text-xs">This purchase will require a blockchain transaction</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPurchaseDialogOpen(false)} className="border-gray-200">
              Cancel
            </Button>
            <Button onClick={handlePurchase} className="bg-primary hover:bg-primary/90" disabled={isSubmitting || !selectedMaterial}>
              {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
