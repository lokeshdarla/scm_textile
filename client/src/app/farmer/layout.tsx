'use client'
import React, { useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'
import { useActiveAccount } from 'thirdweb/react'
import { contract } from '@/lib/client'
import { Role } from '@/constants'
import { useRouter } from 'next/navigation'
import { readContract } from 'thirdweb'
// You can import icons from a library like react-icons if needed
// import { FaHome, FaUser, FaBox, FaChartBar, FaCog } from 'react-icons/fa'

const farmerNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/farmer',
  },
  {
    title: 'Transactions',
    href: '/farmer/transactions',
  },
  {
    title: 'Profile',
    href: '/farmer/profile',
  },
]

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
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

        if (userDetails && userDetails.role !== Role.FARMER) {
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

  return <DashboardLayout navItems={farmerNavItems}>{children}</DashboardLayout>
}
