import React from 'react'

export default function CustomerDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Orders</h3>
          <p className="text-3xl font-bold text-blue-600">3</p>
          <p className="text-sm text-gray-500 mt-2">Orders in progress</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed Orders</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
          <p className="text-sm text-gray-500 mt-2">Successfully delivered</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Wishlist Items</h3>
          <p className="text-3xl font-bold text-purple-600">8</p>
          <p className="text-sm text-gray-500 mt-2">Saved for later</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-12345</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Cotton T-Shirt (2), Denim Jeans (1)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$89.99</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Delivered</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                    <a href="#">View Details</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-12344</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-08</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Wool Sweater (1), Scarf (2)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$129.99</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Transit</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                    <a href="#">Track Order</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-12343</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-05</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Linen Tablecloth (1), Napkins (6)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$75.50</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Processing</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                    <a href="#">View Details</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Organic Cotton T-Shirt</h3>
                <p className="text-sm text-gray-500">$24.99</p>
                <button className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors">Add to Cart</button>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Slim Fit Denim Jeans</h3>
                <p className="text-sm text-gray-500">$59.99</p>
                <button className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors">Add to Cart</button>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Merino Wool Sweater</h3>
                <p className="text-sm text-gray-500">$79.99</p>
                <button className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors">Add to Cart</button>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Silk Scarf</h3>
                <p className="text-sm text-gray-500">$34.99</p>
                <button className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
