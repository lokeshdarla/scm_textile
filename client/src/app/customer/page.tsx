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
import { Package, Search, ShoppingCart, Tag } from 'lucide-react'
import { isLoggedIn } from '@/actions/login'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
}

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

export default function CustomerDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<RetailProduct | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [isLoadingRawMaterials, setIsLoadingRawMaterials] = useState(false)

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: sendTx } = useSendTransaction()
  const router = useRouter()

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await isLoggedIn()
        if (!loggedIn) {
          toast.error('Authentication required', {
            description: 'Please log in to access the dashboard',
          })
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

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

  // Fetch available retail products
  const { data: availableProductIds, isFetched: isIdsFetched } = useReadContract({
    contract,
    method: 'function getAvailableRetailProducts() view returns (uint256[])',
    params: [],
  })

  // State for retail products
  const [retailProducts, setRetailProducts] = useState<RetailProduct[]>([])

  // Fetch details for each retail product
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!availableProductIds || !isIdsFetched) return

      setIsLoading(true)
      showLoading('Loading available retail products...')

      try {
        const productList: RetailProduct[] = []

        for (const id of availableProductIds) {
          try {
            const productData = await readContract({
              contract,
              method:
                'function getRetailProduct(uint256 retailProductId) view returns ((uint256 id, address retailer, address customer, string qrCode, uint256[] packagedStockIds, bool isAvailable, uint256 timestamp, string name, uint256 price, string brand))',
              params: [id],
            })

            if (productData) {
              productList.push(productData)
            }
          } catch (error) {
            console.error(`Error fetching retail product with ID ${id}:`, error)
            // Continue with other products even if one fails
          }
        }

        setRetailProducts(productList)
      } catch (error) {
        console.error('Error loading retail products:', error)
        toast.error('Failed to load retail products', {
          description: 'Please check your connection and try again',
        })
        setRetailProducts([])
      } finally {
        setIsLoading(false)
        hideLoading()
      }
    }

    if (availableProductIds && isIdsFetched) {
      fetchProductDetails()
    }
  }, [availableProductIds, isIdsFetched, hideLoading, showLoading])

  // Fetch raw materials
  const fetchRawMaterials = async () => {
    setIsLoadingRawMaterials(true)
    showLoading('Loading raw materials...')

    try {
      // First, get all raw material IDs
      const rawMaterialIds = await readContract({
        contract,
        method: 'function getAvailableRawMaterials() view returns (uint256[])',
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
              'function getRawMaterial(uint256 rawMaterialId) view returns ((uint256 id, address farmer, address mill, string qrCode, bool isAvailable, uint256 timestamp, string name, string rawMaterialType, uint256 quantity, uint256 price))',
            params: [id],
          })

          if (materialData) {
            materialList.push(materialData)
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
      setIsLoadingRawMaterials(false)
      hideLoading()
    }
  }

  // Filter products based on search term
  const filteredProducts = retailProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand.toLowerCase().includes(searchTerm.toLowerCase()) || product.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle purchase
  const handlePurchase = async () => {
    if (!selectedProduct || !activeAccount?.address) return

    showLoading('Processing purchase...')

    try {
      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: 'function purchaseRetailProduct(uint256 retailProductId)',
        params: [selectedProduct.id],
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Purchase successful!', {
          description: `You have purchased "${selectedProduct.name}"`,
          duration: 5000,
        })

        // Close dialog and refresh data
        setIsPurchaseDialogOpen(false)
        setSelectedProduct(null)

        // Refresh the data
        window.location.reload()
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error purchasing retail product:', error)
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
            <h1 className="text-2xl font-semibold text-gray-900">Customer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Browse and purchase retail products</p>
          </div>
          <Button onClick={fetchRawMaterials} variant="outline" className="border-gray-200" disabled={isLoadingRawMaterials}>
            {isLoadingRawMaterials ? (
              <>
                <div className="w-4 h-4 mr-2 border-b-2 rounded-full animate-spin border-primary"></div>
                Loading...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                View Raw Materials
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Available Retail Products</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">Browse and purchase retail products from retailers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <Input
                placeholder="Search by name, brand, or QR code..."
                className="h-10 pl-10 text-sm bg-white border-gray-200 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                <span className="ml-2 text-gray-500">Loading retail products...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">No retail products available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new retail products</p>
              </div>
            ) : (
              <div className="overflow-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Brand</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">QR Code</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Date Added</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="p-4 text-sm font-medium text-gray-900">#{product.id.toString()}</TableCell>
                        <TableCell className="p-4 text-sm font-medium text-gray-900">{product.name}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{product.brand}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{product.qrCode}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatPrice(product.price)}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatDate(product.timestamp)}</TableCell>
                        <TableCell className="p-4">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => {
                              setSelectedProduct(product)
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

        {/* Raw Materials Section */}
        {rawMaterials.length > 0 && (
          <Card className="border-0 shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Available Raw Materials</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">Browse raw materials available in the supply chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Type</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Quantity</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                      <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Date Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawMaterials.map((material) => (
                      <TableRow key={material.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                        <TableCell className="p-4 text-sm font-medium text-gray-900">#{material.id.toString()}</TableCell>
                        <TableCell className="p-4 text-sm font-medium text-gray-900">{material.name}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{material.rawMaterialType}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{material.quantity.toString()}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatPrice(material.price)}</TableCell>
                        <TableCell className="p-4 text-sm text-gray-600">{formatDate(material.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Purchase Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>Are you sure you want to purchase this retail product?</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Brand</p>
                  <p className="text-sm text-gray-900">{selectedProduct.brand}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">QR Code</p>
                  <p className="text-sm text-gray-900">{selectedProduct.qrCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="text-sm text-gray-900">{formatPrice(selectedProduct.price)} ETH</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Added</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedProduct.timestamp)}</p>
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
