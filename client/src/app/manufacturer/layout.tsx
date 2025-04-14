'use client'
import React, { useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'
import { Role } from '@/constants'
import { useActiveAccount } from 'thirdweb/react'
import { useRouter } from 'next/navigation'
import { readContract } from 'thirdweb'
import { contract } from '@/lib/client'

const manufacturersNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/manufacturer',
  },
  {
    title: 'Add Apparel',
    href: '/manufacturer/add-apparel',
  },
  {
    title: 'Transactions',
    href: '/manufacturer/transactions',
  },
  {
    title: 'Profile',
    href: '/manufacturer/profile',
  },
]

export default function ManufacturersLayout({ children }: { children: React.ReactNode }) {
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

        if (userDetails && userDetails.role !== Role.MANUFACTURER) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        // Redirect to login on error as a safety measure
        router.push('/login')
      }
    }

    checkUserRole()
  }, [activeAccount, router])
  return <DashboardLayout navItems={manufacturersNavItems}>{children}</DashboardLayout>
}
