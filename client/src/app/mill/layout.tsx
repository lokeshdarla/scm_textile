'use client'
import React, { useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'
import { Role } from '@/constants'
import { readContract } from 'thirdweb'
import { useRouter } from 'next/navigation'
import { useActiveAccount } from 'thirdweb/react'
import { contract } from '@/lib/client'

// You can import icons from a library like react-icons if needed
// import { FaHome, FaUser, FaBox, FaChartBar, FaCog } from 'react-icons/fa'

const millsNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/mill',
  },
  {
    title: 'Add Fabric',
    href: '/mill/add-fabric',
  },
  {
    title: 'Transactions',
    href: '/mill/transactions',
  },
  {
    title: 'Profile',
    href: '/mill/profile',
  },
]

export default function MillsLayout({ children }: { children: React.ReactNode }) {
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

        if (userDetails && userDetails.role !== Role.MILLS) {
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
  return <DashboardLayout navItems={millsNavItems}>{children}</DashboardLayout>
}
