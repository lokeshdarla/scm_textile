'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { Package, Search, ShoppingCart } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Apparel } from '@/constants'

export default function DistributorDashboard() {
  const [apparels, setApparels] = useState<Apparel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApparel, setSelectedApparel] = useState<Apparel | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()

  // Fetch available apparels

  // Fetch details for each apparel

  const { data: availableApparelIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getALlApparels() view returns (uint256[])',
    params: [],
  })

  useEffect(() => {
    const fetchApparelDetails = async () => {
      if (!availableApparelIds || !isIdsFetched) return

      setIsLoading(true)

      try {
        const apparelList: Apparel[] = []
        console.log(availableApparelIds)
        for (const id of availableApparelIds) {
          try {
            const apparelData = await readContract({
              contract,
              method:
                'function getApparel(uint256 apparelId) view returns ((uint256 id, address manufacturer, address distributor, string qrCode, uint256[] fabricIds, bool isAvailable, uint256 timestamp, string name, string category, string size, uint256 price, bool isUsedForPackagedStock))',
              params: [id],
            })

            if (apparelData && apparelData.isAvailable === true) {
              apparelList.push(apparelData)
            }
          } catch (error) {
            console.error(`Error fetching apparel with ID ${id}:`, error)
            // Continue with other apparels even if one fails
          }
        }

        setApparels(apparelList)
      } catch (error) {
        console.error('Error loading apparels:', error)
        toast.error('Failed to load apparel products', {
          description: 'Please check your connection and try again',
        })
        setApparels([])
      } finally {
        setIsLoading(false)
      }
    }

    if (activeAccount?.address) {
      fetchApparelDetails()
    }
  }, [activeAccount?.address])

  // Filter apparels based on search term
  const filteredApparels = apparels.filter(
    (apparel) =>
      apparel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apparel.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apparel.size.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle purchasing an apparel
  const handlePurchase = async () => {
    if (!selectedApparel) return

    setIsSubmitting(true)
    showLoading('Processing purchase...')

    try {
      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function buyApparel(uint256 apparelId) payable',
        params: [selectedApparel.id],
        value: selectedApparel.price,
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Purchase successful!', {
          description: `You have purchased the apparel "${selectedApparel.name}"`,
          duration: 5000,
        })

        // Update local state
        setApparels(apparels.filter((a) => a.id !== selectedApparel.id))

        // Close dialog
        setPurchaseDialogOpen(false)
        setSelectedApparel(null)
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error purchasing apparel:', error)
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

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Distributor Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Browse and purchase apparel products from manufacturers</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Card className="flex flex-col h-full border-0 shadow-sm">
          <CardHeader className="pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Available Apparel Products</CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-500">Browse and purchase apparel products from manufacturers</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search by product name, category, or size..."
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
                <span className="ml-2 text-gray-500">Loading apparel products...</span>
              </div>
            ) : filteredApparels.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">No apparel products available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new products</p>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Category</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Size</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Manufacturer</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Date Added</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApparels.map((apparel) => (
                      <TableRow key={apparel.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="p-4 text-sm font-medium text-gray-900">#{apparel.id.toString()}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{apparel.name}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600 capitalize">{apparel.category}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{apparel.size}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatPrice(apparel.price)}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatAddress(apparel.manufacturer)}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatDate(apparel.timestamp)}</TableCell>
                        <TableCell className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApparel(apparel)
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
            <DialogTitle className="text-xl font-semibold text-gray-900">Purchase Apparel</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-500">Confirm your purchase details</DialogDescription>
          </DialogHeader>
          {selectedApparel && (
            <div className="grid gap-4 py-4">
              <div className="p-4 space-y-2 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Product:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedApparel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{selectedApparel.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Size:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedApparel.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Price:</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(selectedApparel.price)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Manufacturer:</span>
                  <span className="text-sm font-medium text-gray-900">{formatAddress(selectedApparel.manufacturer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">QR Code:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedApparel.qrCode}</span>
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
            <Button onClick={handlePurchase} className="bg-primary hover:bg-primary/90" disabled={isSubmitting || !selectedApparel}>
              {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
