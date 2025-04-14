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
