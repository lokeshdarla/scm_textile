import React from 'react'

export default function AddForShipping() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Products for Shipping</h1>

      {/* Shipping Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="retailer" className="block text-sm font-medium text-gray-700 mb-1">
              Select Retailer
            </label>
            <select id="retailer" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a retailer</option>
              <option value="1">Fashion Retail Co.</option>
              <option value="2">Style Outlet</option>
              <option value="3">Trendy Fashion</option>
              <option value="4">Urban Style</option>
            </select>
          </div>

          <div>
            <label htmlFor="shipping-method" className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Method
            </label>
            <select id="shipping-method" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="standard">Standard Shipping</option>
              <option value="express">Express Shipping</option>
              <option value="overnight">Overnight Shipping</option>
            </select>
          </div>

          <div>
            <label htmlFor="tracking-number" className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <input
              type="text"
              id="tracking-number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tracking number"
            />
          </div>

          <div>
            <label htmlFor="estimated-delivery" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Delivery Date
            </label>
            <input type="date" id="estimated-delivery" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Products to Ship */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Products to Ship</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-500 text-xs">T</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Cotton T-Shirts</div>
                      <div className="text-sm text-gray-500">Manufacturer: Fashion Co.</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button className="text-gray-500 hover:text-blue-600">-</button>
                    <input type="number" min="1" value="100" className="w-16 mx-2 text-center border border-gray-300 rounded-md" />
                    <button className="text-gray-500 hover:text-blue-600">+</button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$12.99</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$1,299.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  <button className="hover:text-red-800">Remove</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-500 text-xs">J</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Denim Jeans</div>
                      <div className="text-sm text-gray-500">Manufacturer: DenimWorks</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button className="text-gray-500 hover:text-blue-600">-</button>
                    <input type="number" min="1" value="50" className="w-16 mx-2 text-center border border-gray-300 rounded-md" />
                    <button className="text-gray-500 hover:text-blue-600">+</button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$29.99</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$1,499.50</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  <button className="hover:text-red-800">Remove</button>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">$2,798.50</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Ship Products</button>
        </div>
      </div>
    </div>
  )
}
