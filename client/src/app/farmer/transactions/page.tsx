'use client'
import React, { useEffect } from 'react'
import { readContract } from 'thirdweb'
import { prepareContractCall } from 'thirdweb'
import { contract, client } from '@/lib/client'

const page = () => {
  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await readContract({
        contract,
        method:
          'function getRawMaterial(uint256 _materialId) view returns ((uint256 id, uint256 farmerId, string materialType, uint256 quantity, uint256 price, string location, bool isAvailable, string timestamp))',
        params: [BigInt(1)],
      })
      console.log(data)
    }
    fetchTransactions()
  }, [])
  return <div>Transactions</div>
}

export default page
