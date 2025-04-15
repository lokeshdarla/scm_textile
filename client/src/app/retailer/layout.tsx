'use client'
import React, { useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'
import { useActiveAccount } from 'thirdweb/react'
import { useRouter } from 'next/navigation'
import { readContract } from 'thirdweb'
import { contract } from '@/lib/client'
import { Role } from '@/constants'

const retailersNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/retailer',
  },
  {
    title: 'Add for Sale',
    href: '/retailer/add-for-sale',
  },
  {
    title: 'Transactions',
    href: '/retailer/transactions',
  },
  {
    title: 'Profile',
    href: '/retailer/profile',
  },
]

export default function ManufacturersLayout({ children }: { children: React.ReactNode }) {
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

      if (userDetails && userDetails.role !== Role.RETAILER) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      // Redirect to login on error as a safety measure
      router.push('/login')
    }
  }
  return <DashboardLayout navItems={retailersNavItems}>{children}</DashboardLayout>
}
