'use client'
import React, { useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'
import { Role } from '@/constants'
import { useActiveAccount } from 'thirdweb/react'
import { readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { useRouter } from 'next/navigation'

const customerNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/customer',
  },
  {
    title: 'Transactions',
    href: '/customer/transactions',
  },
  {
    title: 'Profile',
    href: '/customer/profile',
  },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const activeAccount = useActiveAccount()
  const router = useRouter()

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!activeAccount?.address) {
          return
        }

        const userDetails = await readContract({
          contract,
          method: 'function getUserInfo(address account) view returns ((string name, string role, string location, uint256 registrationDate))',
          params: [activeAccount?.address || '0x0000000000000000000000000000000000000000'],
        })

        console.log(userDetails)

        if (userDetails && userDetails.role !== Role.CUSTOMER) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        // Redirect to login on error as a safety measure
        router.push('/login')
      }
    }

    checkUserRole()
  }, [activeAccount])
  return <DashboardLayout navItems={customerNavItems}>{children}</DashboardLayout>
}
