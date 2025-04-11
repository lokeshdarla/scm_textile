'use client'
import React from 'react'
import { Button } from '@/components/ui/button'

export default function FarmerOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
        <h2 className="text-xl font-semibold mb-4 text-green-800">Recent Orders</h2>
        <p className="text-gray-600">You have 5 pending orders</p>
        <div className="mt-4">
          <Button variant="link" className="text-green-600 hover:text-green-800 p-0">
            View all orders
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
        <h2 className="text-xl font-semibold mb-4 text-green-800">Products</h2>
        <p className="text-gray-600">You have 12 active products</p>
        <div className="mt-4">
          <Button variant="link" className="text-green-600 hover:text-green-800 p-0">
            Manage products
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
        <h2 className="text-xl font-semibold mb-4 text-green-800">Analytics</h2>
        <p className="text-gray-600">Sales increased by 15% this month</p>
        <div className="mt-4">
          <Button variant="link" className="text-green-600 hover:text-green-800 p-0">
            View detailed analytics
          </Button>
        </div>
      </div>
    </div>
  )
}
