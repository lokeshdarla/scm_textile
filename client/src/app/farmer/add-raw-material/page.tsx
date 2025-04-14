'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2, Package, MapPin, DollarSign, Info } from 'lucide-react'
import { prepareContractCall } from 'thirdweb'
import { contract } from '@/lib/client'
import { useSendTransaction } from 'thirdweb/react'

const AddRawMaterialPage = () => {
  const [formData, setFormData] = useState({
    materialType: '',
    quantity: '',
    unit: 'kg',
    price: 0.0,
    location: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutateAsync: sendTx } = useSendTransaction()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would typically send the data to your API
      console.log('Form submitted:', formData)

      const transaction = await prepareContractCall({
        contract,
        method: 'function addRawMaterial(string _materialType, uint256 _quantity, uint256 _price, string _location) returns (uint256)',
        params: [formData.materialType, BigInt(formData.quantity), BigInt(parseFloat(formData.price.toString()) * 1e18), formData.location],
      })
      const { transactionHash } = await sendTx(transaction)

      // Simulate API call
      console.log('Transaction hash:', transactionHash)

      // Show success message
      toast.success('Raw material added successfully!')

      // Reset form
      setFormData({
        materialType: '',
        quantity: '',
        unit: 'kg',
        price: 0.0,
        location: '',
        description: '',
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to add raw material. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl p-4 mx-auto">
      <Card className="overflow-hidden border-blue-100 shadow-lg">
        <CardHeader className="pb-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center mb-2">
            <div className="p-2 mr-3 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-700">Add Raw Material</CardTitle>
              <CardDescription className="text-blue-600/70">Enter the details of the raw material you want to add to your inventory.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="materialType" className="flex items-center font-medium text-blue-700">
                  <Package className="h-4 w-4 mr-1.5 text-blue-500" />
                  Material Type
                </Label>
                <Select value={formData.materialType} onValueChange={(value) => handleSelectChange('materialType', value)}>
                  <SelectTrigger id="materialType" className="border-blue-200 shadow-sm hover:border-blue-300 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotton">Cotton</SelectItem>
                    <SelectItem value="wool">Wool</SelectItem>
                    <SelectItem value="silk">Silk</SelectItem>
                    <SelectItem value="linen">Linen</SelectItem>
                    <SelectItem value="jute">Jute</SelectItem>
                    <SelectItem value="hemp">Hemp</SelectItem>
                    <SelectItem value="bamboo">Bamboo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center font-medium text-blue-700">
                  <DollarSign className="h-4 w-4 mr-1.5 text-blue-500" />
                  Price per Unit
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Image src="/eth-icon.svg" alt="ethereum" width={18} height={18} className="opacity-70" />
                  </div>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    className="pl-10 border-blue-200 shadow-sm hover:border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="font-medium text-blue-700">
                  Quantity
                </Label>
                <div className="flex">
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="border-blue-200 rounded-r-none shadow-sm hover:border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    required
                  />
                  <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                    <SelectTrigger className="w-20 border-l-0 border-blue-200 rounded-l-none shadow-sm hover:border-blue-300 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center font-medium text-blue-700">
                  <MapPin className="h-4 w-4 mr-1.5 text-blue-500" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="border-blue-200 shadow-sm hover:border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Storage location"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center font-medium text-blue-700">
                <Info className="h-4 w-4 mr-1.5 text-blue-500" />
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="border-blue-200 hover:border-blue-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-[120px]"
                placeholder="Add any additional details about the material..."
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 p-6 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Button
              type="button"
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
              onClick={() =>
                setFormData({
                  materialType: '',
                  quantity: '',
                  unit: 'kg',
                  price: 0.0,
                  location: '',
                  description: '',
                })
              }
            >
              Reset
            </Button>
            <Button type="submit" className="text-white shadow-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Material'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default AddRawMaterialPage
