'use client'

import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { prepareContractCall } from 'thirdweb'
import { contract } from '@/lib/client'
import { useActiveAccount, useSendTransaction, useReadContract } from 'thirdweb/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

enum Role {
  FARMER = 'FARMER',
  MANUFACTURER = 'MANUFACTURER',
  MILLS = 'MILLS',
  DISTRIBUTOR = 'DISTRIBUTOR',
  RETAILER = 'RETAILER',
}

export default function Page() {
  const [name, setName] = useState('')
  const [role, setRole] = useState(Role.FARMER)
  const { mutateAsync: sendTx, data: txResult, isPending } = useSendTransaction()
  const [userExists, setUserExists] = useState(false)
  const [isFetchingLoading, setIsFetchingLoading] = useState(true)
  const [isRegisteringUser, setIsRegisteringUser] = useState(false)
  const account = useActiveAccount()
  const router = useRouter()

  const { data: userId } = useReadContract({
    contract,
    method: 'function userAddressToId(address) view returns (uint256)',
    params: [account?.address || '0x0000000000000000000000000000000000000000'],
  })

  const { data: userDetails, isFetched: isUserDetailsFetched } = useReadContract({
    contract,
    method: 'function users(uint256) view returns (uint256 id, address userAddress, string name, string role, bool isActive)',
    params: [userId ?? BigInt(0)],
    queryOptions: {
      enabled: !!userId && Number(userId) > 0,
    },
  })

  useEffect(() => {
    checkUserAndRedirect()
  }, [userDetails])

  const checkUserAndRedirect = () => {
    setIsFetchingLoading(true)

    if (userDetails && userDetails[4]) {
      // isActive = true
      setUserExists(true)
      const role = userDetails[3].toLowerCase().split('_')[0]
      router.push(`/${role}`)
    }

    setIsFetchingLoading(false)
  }

  const RegisterUser = async () => {
    try {
      setIsRegisteringUser(true)
      const transaction = prepareContractCall({
        contract,
        method: 'function registerUser(string _name, string _role) returns (uint256)',
        params: [name, role],
      })

      const result = await sendTx(transaction)

      console.log('Transaction Result:', result)
    } catch (error) {
      console.error('Error registering user:', error)
    } finally {
      setIsRegisteringUser(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      {isFetchingLoading ? (
        <div className="flex justify-center gap-2 items-center h-80">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm ">Fetching user details...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Register New User</h1>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <Input id="name" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              Role
            </label>
            <Select onValueChange={(val) => setRole(val as Role)} defaultValue={role}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" defaultValue={role} />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value={Role.FARMER}>FARMER</SelectItem>
                <SelectItem value={Role.MANUFACTURER}>MANUFACTURER</SelectItem>
                <SelectItem value={Role.MILLS}>MILLS</SelectItem>
                <SelectItem value={Role.DISTRIBUTOR}>DISTRIBUTOR</SelectItem>
                <SelectItem value={Role.RETAILER}>RETAILER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={RegisterUser} className="w-full" disabled={isRegisteringUser}>
            {isRegisteringUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register User'}
          </Button>
        </>
      )}
    </div>
  )
}
