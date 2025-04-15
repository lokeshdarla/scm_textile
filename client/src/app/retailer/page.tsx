'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useActiveAccount, useReadContract, useSendAndConfirmTransaction } from 'thirdweb/react'
import { useLoading } from '@/components/providers/loading-provider'
import { toast } from 'sonner'
import { prepareContractCall, readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { Package, Search, ShoppingCart } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import QrCodeModal from '../components/QrCodeModal'
import { generateQrFromUrl } from '@/constants/uploadToPinata'
import Image from 'next/image'
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

export default function RetailerDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState<PackagedStock | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false)
  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendAndConfirmTransaction()
  const router = useRouter()

  // Fetch available packaged stocks
  const { data: availableStockIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getAllPackagedStocks() view returns (uint256[])',
    params: [],
  })

  // State for packaged stocks
  const [packagedStocks, setPackagedStocks] = useState<PackagedStock[]>([])

  // Fetch details for each packaged stock
  useEffect(() => {
    const fetchStockDetails = async () => {
      if (!availableStockIds || !isIdsFetched) return

      setIsLoading(true)

      try {
        const stockList: PackagedStock[] = []

        for (const id of availableStockIds) {
          try {
            const stockData = await readContract({
              contract,
              method:
                'function getPackagedStock(uint256 packagedStockId) view returns ((uint256 id, address distributor, address retailer, string qrCode, uint256[] apparelIds, bool isAvailable, uint256 timestamp, string name, uint256 quantity, uint256 price))',
              params: [id],
            })

            if (stockData && stockData.isAvailable === true) {
              const qrCode = await generateQrFromUrl(stockData.qrCode)
              stockList.push({ ...stockData, qrCode })
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
        hideLoading()
      }
    }

    if (availableStockIds && isIdsFetched) {
      fetchStockDetails()
    }
  }, [availableStockIds, isIdsFetched])

  // Filter stocks based on search term
  const filteredStocks = packagedStocks.filter((stock) => stock.name.toLowerCase().includes(searchTerm.toLowerCase()) || stock.qrCode.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle purchase
  const handlePurchase = async () => {
    if (!selectedStock || !activeAccount?.address) return

    showLoading('Processing purchase...')

    try {
      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function buyPackagedStock(uint256 packagedStockId)',
        params: [selectedStock.id],
        value: selectedStock.price,
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Purchase successful!', {
          description: `You have purchased "${selectedStock.name}"`,
          duration: 5000,
        })

        // Close dialog and refresh data
        setIsPurchaseDialogOpen(false)
        setSelectedStock(null)

        // Refresh the data
        window.location.reload()
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error purchasing packaged stock:', error)
      toast.error('Purchase failed', {
        description: 'Please try again or check your wallet connection',
      })
    } finally {
      hideLoading()
    }
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format price from Wei to ETH
  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(4)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Retailer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Browse and purchase packaged stocks from distributors</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Available Packaged Stocks</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">Browse and purchase packaged stocks from distributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <Input
                placeholder="Search by name or QR code..."
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
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">No packaged stocks available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new packaged stocks</p>
              </div>
            ) : (
              <div className="overflow-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">QR Code</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Quantity</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Distributor</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => (
                      <TableRow key={stock.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="p-4 text-sm font-medium text-gray-900">#{stock.id.toString()}</TableCell>
                        <TableCell className="p-4 text-sm font-medium text-gray-900">{stock.name}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">
                          <Button onClick={() => setQrCodeDialogOpen(true)}>View QR Code</Button>
                          <QrCodeModal qrCode={stock.qrCode} qrCodeDialogOpen={qrCodeDialogOpen} setQrCodeDialogOpen={setQrCodeDialogOpen} />
                        </TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{stock.quantity.toString()}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatPrice(stock.price)}</TableCell>

                        <TableCell className="p-4 text-sm text-gray-600">{stock.distributor}</TableCell>
                        <TableCell className="p-4">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => {
                              setSelectedStock(stock)
                              setIsPurchaseDialogOpen(true)
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Purchase
                          </Button>
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
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>Are you sure you want to purchase this packaged stock?</DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{selectedStock.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">QR Code</p>
                  <Image src={selectedStock.qrCode} alt="QR Code" width={100} height={100} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantity</p>
                  <p className="text-sm text-gray-900">{selectedStock.quantity.toString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="text-sm text-gray-900">{formatPrice(selectedStock.price)} ETH</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Added</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedStock.timestamp)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} className="bg-primary hover:bg-primary/90">
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
