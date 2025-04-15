'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { Package, Search, ShoppingCart } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Fabric } from '@/constants'
import QrCodeModal from '../components/QrCodeModal'
import { generateQrFromUrl } from '@/constants/uploadToPinata'

// Define the Fabric type based on the smart contract struct

export default function ManufacturerDashboard() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false)

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()

  // Fetch available fabrics
  const { data: availableFabricIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getAllFabrics() view returns (uint256[])',
    params: [],
  })

  // Fetch details for each fabric
  useEffect(() => {
    const fetchFabricDetails = async () => {
      if (!availableFabricIds || !isIdsFetched) return

      setIsLoading(true)

      try {
        const fabricList: Fabric[] = []

        for (const id of availableFabricIds) {
          try {
            const fabricData = await readContract({
              contract,
              method:
                'function getFabric(uint256 fabricId) view returns ((uint256 id, address mill, address manufacturer, string qrCode, uint256[] rawMaterialIds, bool isAvailable, uint256 timestamp, string name, string composition, uint256 price))',
              params: [id],
            })

            if (fabricData && fabricData.isAvailable === true) {
              const qrCode = await generateQrFromUrl(fabricData.qrCode)
              fabricList.push({ ...fabricData, qrCode })
            }
          } catch (error) {
            console.error(`Error fetching fabric with ID ${id}:`, error)
            // Continue with other fabrics even if one fails
          }
        }

        setFabrics(fabricList)
      } catch (error) {
        console.error('Error loading fabrics:', error)
        toast.error('Failed to load fabrics', {
          description: 'Please check your connection and try again',
        })
        setFabrics([])
      } finally {
        setIsLoading(false)
        hideLoading()
      }
    }

    if (activeAccount?.address && availableFabricIds && isIdsFetched) {
      fetchFabricDetails()
    }
  }, [availableFabricIds, isIdsFetched])

  // Filter fabrics based on search term
  const filteredFabrics = fabrics.filter((fabric) => fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) || fabric.composition.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle purchasing a fabric
  const handlePurchase = async () => {
    if (!selectedFabric) return

    setIsSubmitting(true)
    showLoading('Processing purchase...')

    try {
      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function buyFabric(uint256 fabricId) payable',
        params: [selectedFabric.id],
        value: selectedFabric.price,
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Purchase successful!', {
          description: `You have purchased the fabric "${selectedFabric.name}"`,
          duration: 5000,
        })

        // Update local state
        setFabrics(fabrics.filter((f) => f.id !== selectedFabric.id))

        // Close dialog
        setPurchaseDialogOpen(false)
        setSelectedFabric(null)
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error purchasing fabric:', error)
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
            <h1 className="text-2xl font-semibold text-gray-900">Manufacturer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Browse and purchase fabrics from mills</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Card className="flex flex-col h-full border-0 shadow-sm">
          <CardHeader className="pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Available Fabrics</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Browse and purchase fabrics from mills</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search by fabric name or composition..."
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
                <span className="ml-2 text-gray-500">Loading fabrics...</span>
              </div>
            ) : filteredFabrics.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">No fabrics available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new fabrics</p>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Composition</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">QR Code</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Date Added</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFabrics.map((fabric) => (
                      <TableRow key={fabric.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="p-4 text-sm font-medium text-gray-900">#{fabric.id.toString()}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{fabric.name}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{fabric.composition}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatPrice(fabric.price)}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">
                          <Button onClick={() => setQrCodeDialogOpen(true)}>View QR Code</Button>
                          <QrCodeModal qrCode={fabric.qrCode} qrCodeDialogOpen={qrCodeDialogOpen} setQrCodeDialogOpen={setQrCodeDialogOpen} />
                        </TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatDate(fabric.timestamp)}</TableCell>
                        <TableCell className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFabric(fabric)
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
            <DialogTitle className="text-xl font-semibold text-gray-900">Purchase Fabric</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-500">Confirm your purchase details</DialogDescription>
          </DialogHeader>
          {selectedFabric && (
            <div className="grid gap-4 py-4">
              <div className="p-4 space-y-2 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fabric:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedFabric.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Composition:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedFabric.composition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Price:</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(selectedFabric.price)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Mill:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedFabric.mill.substring(0, 6)}...{selectedFabric.mill.substring(selectedFabric.mill.length - 4)}
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
            <Button onClick={handlePurchase} className="bg-primary hover:bg-primary/90" disabled={isSubmitting || !selectedFabric}>
              {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
