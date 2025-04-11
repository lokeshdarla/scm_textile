'use client'

import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { prepareContractCall } from 'thirdweb'
import { contract, client } from '@/lib/client'
import { useActiveAccount, useSendTransaction, useReadContract } from 'thirdweb/react'
import { useRouter } from 'next/navigation'
import { Loader2, UserCircle2, Key, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { ConnectButton } from 'thirdweb/react'
import { inAppWallet, createWallet } from 'thirdweb/wallets'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

enum Role {
  FARMER = 'FARMER',
  MANUFACTURER = 'MANUFACTURER',
  MILLS = 'MILLS',
  DISTRIBUTOR = 'DISTRIBUTOR',
  RETAILER = 'RETAILER',
}

const wallets = [
  inAppWallet({
    auth: {
      options: ['google'],
    },
  }),
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
]

export default function Page() {
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isFetchingLoading, setIsFetchingLoading] = useState(false)
  const [isRegisteringUser, setIsRegisteringUser] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const account = useActiveAccount()
  const router = useRouter()

  const { data: userId } = useReadContract({
    contract,
    method: 'function userAddressToId(address) view returns (uint256)',
    params: [account?.address || '0x0000000000000000000000000000000000000000'],
    queryOptions: {
      enabled: !!account?.address && !!selectedRole,
    },
  })

  const { data: userDetails, isFetched: isUserDetailsFetched } = useReadContract({
    contract,
    method: 'function users(uint256) view returns (uint256 id, address userAddress, string name, string role, bool isActive)',
    params: [userId ?? BigInt(0)],
    queryOptions: {
      enabled: !!userId && Number(userId) > 0,
    },
  })

  const { mutateAsync: sendTx } = useSendTransaction()

  useEffect(() => {
    if (userDetails && isUserDetailsFetched) {
      verifyUserRole()
    }
  }, [userDetails, isUserDetailsFetched])

  const verifyUserRole = () => {
    if (!userDetails) {
      // User doesn't exist, show registration form
      setShowRegistration(true)
      return
    }

    const userRole = userDetails[3] as string
    const userRoleEnum = userRole.split('_')[0].toUpperCase() as Role

    if (userRoleEnum === selectedRole) {
      // Role matches, redirect to appropriate dashboard
      toast.success('Login successful', {
        description: `Welcome back, ${userDetails[2]}`,
      })
      console.log(selectedRole)
      router.push(`/${selectedRole.toLowerCase()}`)
    } else {
      // Role doesn't match
      toast.error('Role mismatch', {
        description: `You are registered as ${userRole}, not ${selectedRole}`,
      })
      setShowRegistration(false)
    }
  }

  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role)

    // Wait a tick for state to update
    setTimeout(() => {
      // If user details are already fetched, verify
      if (userDetails && isUserDetailsFetched) {
        verifyUserRole()
      } else {
        // Otherwise, show registration after verifying userId
        setShowRegistration(true)
      }
    }, 200)
  }

  const registerUser = async () => {
    if (!selectedRole || !name) {
      toast.error('Missing information', {
        description: 'Please provide both name and role',
      })
      return
    }

    try {
      setIsRegisteringUser(true)
      const transaction = prepareContractCall({
        contract,
        method: 'function registerUser(string _name, string _role) returns (uint256)',
        params: [name, selectedRole],
      })

      await sendTx(transaction)

      toast.success('Registration successful', {
        description: 'Your account has been created',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      })
    } catch (error) {
      console.error('Error registering user:', error)
      toast.error('Registration failed', {
        description: 'There was an error creating your account',
      })
    } finally {
      setIsRegisteringUser(false)
    }
  }

  // Role with icon mapping
  const roleIcons = {
    FARMER: '🌾',
    MANUFACTURER: '🏭',
    MILLS: '⚙️',
    DISTRIBUTOR: '🚚',
    RETAILER: '🏪',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg pb-6">
          <div className="mx-auto bg-white p-3 rounded-full shadow-sm mb-3">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">Supply Chain Auth</CardTitle>
          <CardDescription className="text-center text-gray-600">Secure access to the blockchain system</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Step 1: Connect Wallet */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="wallet" className="text-sm font-medium flex items-center">
              <Key className="h-4 w-4 mr-2 text-gray-500" />
              Connect Wallet
            </Label>
            <div className="flex justify-center mt-1">
              <ConnectButton
                client={client}
                wallets={wallets}
                theme={'light'}
                connectModal={{ size: 'compact' }}
                connectButton={{
                  label: account ? 'Wallet Connected' : 'Connect Wallet',
                  className: 'w-full h-10 font-medium focus:outline-none focus:ring-0',
                }}
              />
            </div>
          </div>

          {account && (
            <div className="text-center text-sm bg-gray-50 rounded-md p-2 border-0">
              <span className="text-gray-500">Connected:</span> {account.address.substring(0, 6)}...
              {account.address.substring(account.address.length - 4)}
            </div>
          )}

          {/* Step 2: Role Selection */}
          {account && (
            <>
              <Separator className="my-3" />
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium flex items-center">
                  <UserCircle2 className="h-4 w-4 mr-2 text-gray-500" />
                  Select Your Role
                </Label>
                <Select value={selectedRole || undefined} onValueChange={(value) => setSelectedRole(value as Role)}>
                  <SelectTrigger id="role" className="h-10 focus:outline-none focus:ring-0 border-0 bg-gray-50">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {Object.values(Role).map((roleOption) => (
                      <SelectItem key={roleOption} value={roleOption} className="py-2">
                        <div className="flex items-center">
                          <span className="mr-2">{roleIcons[roleOption as keyof typeof roleIcons]}</span>
                          {roleOption}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleRoleSelect(selectedRole as Role)} className="w-full mt-2 focus:outline-none focus:ring-0" disabled={!selectedRole} variant="secondary">
                  Continue with {selectedRole}
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Loading State */}
          {isFetchingLoading && (
            <div className="flex justify-center gap-2 items-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Verifying your account...</p>
            </div>
          )}

          {/* Step 4: Registration Form (if needed) */}
          {showRegistration && account?.address && (
            <>
              <Separator className="my-3" />
              <div className="space-y-4">
                <div className="rounded-md bg-blue-50 p-3 text-center text-blue-800 text-sm">
                  <p className="font-medium">New user registration</p>
                  <p className="text-xs mt-1">Complete your profile to continue as {selectedRole}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input id="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 focus:outline-none focus:ring-0 border-0 bg-gray-50" />
                </div>

                <Button onClick={registerUser} className="w-full focus:outline-none focus:ring-0" disabled={isRegisteringUser || !name} variant="default">
                  {isRegisteringUser ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Register as ' + selectedRole
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 bg-gray-50 text-center text-xs text-gray-500 rounded-b-lg">Secure blockchain authentication system for supply chain management</CardFooter>
      </Card>
    </div>
  )
}
