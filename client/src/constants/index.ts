export interface Fabric {
  id: bigint
  mill: string
  manufacturer: string
  qrCode: string
  rawMaterialIds: readonly bigint[]
  isAvailable: boolean
  timestamp: bigint
  name: string
  composition: string
  price: bigint
}

export interface RetailProduct {
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
  isUsedForCustomer: boolean
}

export interface RawMaterial {
  id: bigint
  farmerId: bigint,
  qrCode: string,
  materialType: string
  quantity: bigint
  price: bigint
  location: string
  isAvailable: boolean
  buyer?: string
  transactionHash?: string
  isUsedForFabric: boolean
}


export interface Apparel {
  id: bigint
  manufacturer: string
  distributor: string
  qrCode: string
  fabricIds: readonly bigint[]
  isAvailable: boolean
  timestamp: bigint
  name: string
  category: string
  size: string
  price: bigint
  isUsedForPackagedStock: boolean
}


export enum Role {
  FARMER = 'FARMER',
  MANUFACTURER = 'MANUFACTURER',
  MILLS = 'MILL',
  DISTRIBUTOR = 'DISTRIBUTOR',
  RETAILER = 'RETAILER',
  CUSTOMER = 'CUSTOMER',
}
