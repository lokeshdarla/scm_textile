import React from 'react'

export default function DistributorDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Distributor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Available Products</h2>
          <p className="text-3xl font-bold text-blue-600">24</p>
          <p className="text-gray-500 mt-2">Products ready for purchase</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Pending Shipments</h2>
          <p className="text-3xl font-bold text-amber-500">7</p>
          <p className="text-gray-500 mt-2">Products waiting to be shipped</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Completed Transactions</h2>
          <p className="text-3xl font-bold text-green-600">42</p>
          <p className="text-gray-500 mt-2">Successfully delivered products</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-10</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cotton T-Shirts</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Purchased</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-09</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Denim Jeans</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Shipped</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">In Transit</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-08</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Wool Sweaters</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Reserved</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
