'use client'
import React, { useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'
import { useActiveAccount } from 'thirdweb/react'
import { useRouter } from 'next/navigation'
import { readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { Role } from '@/constants'

const distributorsNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/distributor',
  },
  {
    title: 'Add for Shipping',
    href: '/distributor/add-for-shipping',
  },
  {
    title: 'Transactions',
    href: '/distributor/transactions',
  },
  {
    title: 'Profile',
    href: '/distributor/profile',
  },
]

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  const activeAccount = useActiveAccount()
  const router = useRouter()
  useEffect(() => {
    checkUserRole()
  }, [activeAccount])
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

      if (userDetails && userDetails.role !== Role.DISTRIBUTOR) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      // Redirect to login on error as a safety measure
      router.push('/login')
    }
  }
  return <DashboardLayout navItems={distributorsNavItems}>{children}</DashboardLayout>
}
