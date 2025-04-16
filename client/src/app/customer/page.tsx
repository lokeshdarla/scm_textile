'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { readContract, prepareContractCall } from 'thirdweb'
import { useActiveAccount, useSendAndConfirmTransaction } from 'thirdweb/react'
import { contract } from '@/lib/client'
import { useLoading } from '@/components/providers/loading-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, Search, RefreshCw } from 'lucide-react'
import { RetailProduct } from '@/constants'
import Image from 'next/image'
import { generateQrFromUrl } from '@/constants/uploadToPinata'
import QrCodeModal from '../components/QrCodeModal'

export default function RetailProductsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [retailProducts, setRetailProducts] = useState<RetailProduct[]>([])
  const { mutateAsync: sendTx } = useSendAndConfirmTransaction()
  const [selectedProduct, setSelectedProduct] = useState<RetailProduct | null>(null)
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false)

  const activeAccount = useActiveAccount()
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()

  // Fetch retail products
  const fetchRetailProducts = async () => {
    setIsLoading(true)
    showLoading('Loading retail products...')

    try {
      // Get all retail product IDs
      let retailProductIds = await readContract({
        contract,
        method: 'function getAllRetailProducts() view returns (uint256[])',
        params: [],
      })

      if (!retailProductIds || retailProductIds.length === 0) {
        setRetailProducts([])
        return
      }

      // Fetch details for each retail product
      const products: RetailProduct[] = []

      for (const id of retailProductIds) {
        try {
          const productData = await readContract({
            contract,
            method:
              'function getRetailProduct(uint256 retailProductId) view returns ((uint256 id, address retailer, address customer, string qrCode, uint256[] packagedStockIds, bool isAvailable, uint256 timestamp, string name, uint256 price, string brand, bool isUsedForCustomer))',
            params: [id],
          })

          if (productData && productData.isAvailable === true) {
            const qrCode = await generateQrFromUrl(productData.qrCode)
            products.push({ ...productData, qrCode })
          }
        } catch (error) {
          console.error(`Error fetching retail product with ID ${id}:`, error)
          // Continue with other products even if one fails
        }
      }

      setRetailProducts(products)
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

  const buyProduct = async (productId: bigint) => {
    showLoading('Buying product...')

    // Find the product first
    const product = retailProducts.find((product) => product.id === productId)
    if (!product) {
      toast.error('Product not found', {
        description: 'The selected product could not be found',
      })
      hideLoading()
      return
    }

    // Set the selected product
    setSelectedProduct(product)

    try {
      // Prepare the transaction with the correct price
      const transaction = await prepareContractCall({
        contract,
        method: 'function buyRetailProduct(uint256 retailProductId) payable',
        params: [productId],
        value: product.price, // Use the product's price directly
      })

      // Send the transaction
      const tx = await sendTx(transaction)

      // Check transaction success
      if (tx.transactionHash) {
        toast.success('Product purchased successfully', {
          description: `You have purchased ${product.name}`,
          duration: 5000,
        })

        // Refresh the product list to show updated availability
        fetchRetailProducts()
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error buying product:', error)
      toast.error('Failed to buy product', {
        description: 'Please check your connection and try again',
      })
    } finally {
      hideLoading()
    }
  }

  // Initial fetch
  useEffect(() => {
    if (activeAccount?.address) {
      fetchRetailProducts()
    }
  }, [activeAccount])

  // Filter products based on search term
  const filteredProducts = retailProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand.toLowerCase().includes(searchTerm.toLowerCase()) || product.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format price from Wei to ETH
  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(4)
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/40">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Retail Products</h1>
            <p className="mt-1 text-sm text-gray-500">View all available retail products</p>
          </div>
          <Button onClick={fetchRetailProducts} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <Card className="flex flex-col h-full border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-900">Available Products</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">Browse and search through available retail products</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search products by name, brand, or QR code..."
                  className="h-10 pl-10 text-sm bg-white border-gray-200 placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                  <span className="ml-2 text-gray-500">Loading products...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No products available</h3>
                  <p className="mt-1 text-sm text-gray-500">There are no retail products to display</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[600px] border rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">ID</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Name</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Brand</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">QR Code</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Price (ETH)</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Retailer</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Status</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Date Added</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id.toString()} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                          <TableCell className="p-4 text-sm font-medium text-gray-900">#{product.id.toString()}</TableCell>
                          <TableCell className="p-4 text-sm text-gray-900">{product.name}</TableCell>
                          <TableCell className="p-4 text-sm text-gray-600 capitalize">{product.brand}</TableCell>
                          <TableCell className="p-4 text-sm text-gray-600">
                            <Button onClick={() => setQrCodeDialogOpen(true)}>View QR Code</Button>
                            <QrCodeModal qrCode={product.qrCode} qrCodeDialogOpen={qrCodeDialogOpen} setQrCodeDialogOpen={setQrCodeDialogOpen} />
                          </TableCell>
                          <TableCell className="p-4 text-sm text-gray-600">{formatPrice(product.price)}</TableCell>
                          <TableCell className="p-4 text-sm text-gray-600">{product.retailer}</TableCell>
                          <TableCell className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {product.isAvailable ? 'Available' : 'Sold'}
                            </span>
                          </TableCell>
                          <TableCell className="p-4 text-sm text-gray-600">{formatDate(product.timestamp)}</TableCell>
                          <TableCell className="p-4 text-sm text-gray-600">
                            <Button onClick={() => buyProduct(product.id)} className="bg-primary hover:bg-primary/90">
                              Buy
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
