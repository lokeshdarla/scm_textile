'use client'
import React, { useEffect, useState } from 'react'
import { prepareEvent } from 'thirdweb'
import { contract } from '@/lib/client'
import { useContractEvents } from 'thirdweb/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Define types for events
interface ContractEvent {
  // @ts-ignore
  eventName: string
  // @ts-ignore
  args: Record<string, any>
  // @ts-ignore
  transaction: {
    transactionHash: string
    blockNumber: bigint
    timestamp: number
  }
}

const TransactionsPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null)

  const rawMaterialAddedEvent = prepareEvent({
    signature: 'event RawMaterialAdded(uint256 indexed id, address indexed farmer, string qrCode, uint256 price)',
  })

  const rawMaterialSoldEvent = prepareEvent({
    signature: 'event RawMaterialSold(uint256 indexed id, address indexed mill, uint256 price)',
  })

  const fabricAddedEvent = prepareEvent({
    signature: 'event FabricAdded(uint256 indexed id, address indexed mill, string qrCode, uint256 price)',
  })

  const fabricSoldEvent = prepareEvent({
    signature: 'event FabricSold(uint256 indexed id, address indexed manufacturer, uint256 price)',
  })

  const apparelAddedEvent = prepareEvent({
    signature: 'event ApparelAdded(uint256 indexed id, address indexed manufacturer, string qrCode, uint256 price)',
  })

  const apparelSoldEvent = prepareEvent({
    signature: 'event ApparelSold(uint256 indexed id, address indexed distributor, uint256 price)',
  })

  const packagedStockAddedEvent = prepareEvent({
    signature: 'event PackagedStockAdded(uint256 indexed id, address indexed distributor, string qrCode, uint256 price)',
  })

  const packagedStockSoldEvent = prepareEvent({
    signature: 'event PackagedStockSold(uint256 indexed id, address indexed retailer, uint256 price)',
  })

  const retailProductAddedEvent = prepareEvent({
    signature: 'event RetailProductAdded(uint256 indexed id, address indexed retailer, string qrCode, uint256 price)',
  })

  const retailProductSoldEvent = prepareEvent({
    signature: 'event RetailProductSold(uint256 indexed id, address indexed customer, uint256 price)',
  })

  const userRegisteredEvent = prepareEvent({
    signature: 'event UserRegistered(address indexed account, string name, string role, string location)',
  })

  // Use all prepared events in the hook
  const {
    data: contractEvents,
    isLoading: eventsLoading,
    // @ts-ignore
    error: any,
  } = useContractEvents({
    contract,
    events: [
      rawMaterialAddedEvent,
      rawMaterialSoldEvent,
      fabricAddedEvent,
      fabricSoldEvent,
      apparelAddedEvent,
      apparelSoldEvent,
      packagedStockAddedEvent,
      packagedStockSoldEvent,
      retailProductAddedEvent,
      retailProductSoldEvent,
      userRegisteredEvent,
    ],
  })

  useEffect(() => {
    console.log(contractEvents)
  }, [contractEvents])

  // Process events when they're loaded
  useEffect(() => {
    if (contractEvents && !eventsLoading) {
      console.log(contractEvents)
      const processedEvents = contractEvents.map((event) => ({
        eventName: event.eventName || 'Unknown Event',
        args: event.args || {},
        transaction: {
          transactionHash: event.transactionHash || '',
          blockNumber: event.blockNumber || BigInt(0),
          timestamp: new Date().getTime() || 0,
        },
      }))

      // Sort by timestamp (newest first)
      processedEvents.sort((a, b) => b.transaction.timestamp - a.transaction.timestamp)

      setEvents(processedEvents)
      setIsLoading(false)
    }
  }, [contractEvents, eventsLoading])

  // Format timestamp
  // const formatTimestamp = (timestamp: number) => {
  //   if (!timestamp) return 'Unknown'
  //   return new Date(timestamp * 1000).toLocaleString()
  // }

  // Get unique event types for filtering
  const eventTypes = [...new Set(events.map((event) => event.eventName))]

  // Apply filters
  const filteredEvents = events.filter((event) => {
    // Filter by search term
    const searchMatch =
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.transaction.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(event.args).some((arg) => arg && arg.toString().toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by event type
    const typeMatch = selectedEventType === null || event.eventName === selectedEventType

    return searchMatch && typeMatch
  })

  // Get blockchain explorer URL
  const getExplorerUrl = (txHash: string) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`
  }

  // Get event badge color
  const getEventBadgeColor = (eventName: string) => {
    switch (eventName) {
      case 'RawMaterialAdded':
        return 'bg-green-50 text-green-700'
      case 'RawMaterialPurchased':
        return 'bg-blue-50 text-blue-700'
      case 'ManufacturingStarted':
        return 'bg-purple-50 text-purple-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  // Format argument values
  // @ts-ignore
  const formatArgValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A'

    // Format based on key name
    if (key === 'price') {
      // Convert from Wei to ETH
      return `${(Number(value) / 1e18).toFixed(4)} ETH`
    } else if (key.toLowerCase().includes('id') && typeof value === 'bigint') {
      // Format IDs
      return `#${value.toString()}`
    } else if (Array.isArray(value)) {
      // Format arrays
      return `[${value.join(', ')}]`
    } else if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    // Default formatting
    return value.toString()
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden flex-col p-6  bg-gray-50/40">
      <h1 className="text-2xl font-semibold text-gray-900">Blockchain Transactions</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">View all transactions and events recorded on the blockchain</p>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Events</CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">{events.length} events recorded on the blockchain</CardDescription>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search events..."
                  className="w-full h-10 pl-10 text-sm bg-white border-gray-200 md:w-64 placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select className="h-10 px-3 text-sm bg-white border border-gray-200 rounded-md" value={selectedEventType || ''} onChange={(e) => setSelectedEventType(e.target.value || null)}>
                  <option value="">All Events</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
              <span className="ml-2 text-gray-500">Loading events...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">{searchTerm || selectedEventType ? 'Try adjusting your search or filters' : 'No blockchain events have been recorded yet'}</p>
            </div>
          ) : (
            <div className="h-full overflow-auto overflow-x-auto">
              <Table className="">
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Event Type</TableHead>
                    <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Details</TableHead>
                    <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Block Number</TableHead>
                    {/* <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Timestamp</TableHead> */}
                    <TableHead className="h-12 px-4 text-xs font-medium text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="max-h-[60vh] overflow-y-auto">
                  {filteredEvents.map((event, index) => (
                    <TableRow key={index} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                      <TableCell className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEventBadgeColor(event.eventName)}`}>{event.eventName}</span>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          {Object.entries(event.args).map(([key, value], i) => (
                            <div key={i} className="text-xs text-gray-600">
                              <span className="font-medium text-gray-700">{key}:</span> {formatArgValue(key, value)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-sm text-gray-600">{event.transaction.blockNumber.toString()}</TableCell>
                      {/* <TableCell className="p-4 text-sm text-gray-600">{formatTimestamp(event.transaction.timestamp)}</TableCell> */}
                      <TableCell className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getExplorerUrl(event.transaction.transactionHash), '_blank')}
                          className="h-8 text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          View
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
  )
}

export default TransactionsPage
