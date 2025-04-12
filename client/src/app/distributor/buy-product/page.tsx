import React from 'react'

export default function BuyProduct() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Buy Products</h1>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by product name, manufacturer..."
            />
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select id="category" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="apparel">Apparel</option>
              <option value="accessories">Accessories</option>
              <option value="home">Home Textiles</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select id="sort" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Product Card 1 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">Cotton T-Shirts</h3>
            <p className="text-sm text-gray-500 mb-2">Manufacturer: Fashion Co.</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-blue-600">$12.99</span>
              <span className="text-sm text-gray-500">Stock: 500</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Reserve</button>
          </div>
        </div>

        {/* Product Card 2 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">Denim Jeans</h3>
            <p className="text-sm text-gray-500 mb-2">Manufacturer: DenimWorks</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-blue-600">$29.99</span>
              <span className="text-sm text-gray-500">Stock: 300</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Reserve</button>
          </div>
        </div>

        {/* Product Card 3 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">Wool Sweaters</h3>
            <p className="text-sm text-gray-500 mb-2">Manufacturer: WarmWear</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-blue-600">$49.99</span>
              <span className="text-sm text-gray-500">Stock: 200</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Reserve</button>
          </div>
        </div>

        {/* Product Card 4 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">Silk Scarves</h3>
            <p className="text-sm text-gray-500 mb-2">Manufacturer: Elegance</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-blue-600">$19.99</span>
              <span className="text-sm text-gray-500">Stock: 150</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Reserve</button>
          </div>
        </div>

        {/* Product Card 5 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">Linen Tablecloths</h3>
            <p className="text-sm text-gray-500 mb-2">Manufacturer: HomeStyle</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-blue-600">$34.99</span>
              <span className="text-sm text-gray-500">Stock: 100</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Reserve</button>
          </div>
        </div>

        {/* Product Card 6 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">Cotton Bed Sheets</h3>
            <p className="text-sm text-gray-500 mb-2">Manufacturer: ComfortZone</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-blue-600">$39.99</span>
              <span className="text-sm text-gray-500">Stock: 250</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">Reserve</button>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">Previous</button>
          <button className="px-3 py-1 rounded-md bg-blue-600 text-white">1</button>
          <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">2</button>
          <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">3</button>
          <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">Next</button>
        </nav>
      </div>
    </div>
  )
}
