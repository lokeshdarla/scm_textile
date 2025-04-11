'use client'
import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'

// You can import icons from a library like react-icons if needed
// import { FaHome, FaUser, FaBox, FaChartBar, FaCog } from 'react-icons/fa'

const millsNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/mills',
  },
  {
    title: 'Buy Raw Material',
    href: '/mills/buy-raw-material',
  },
  {
    title: 'Add Fabric',
    href: '/mills/add-fabric',
  },
  {
    title: 'Transactions',
    href: '/mills/transactions',
  },
  {
    title: 'Profile',
    href: '/mills/profile',
  },
]

export default function MillsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={millsNavItems} title="Mills Dashboard" sidebarTitle="Mills Portal">
      {children}
    </DashboardLayout>
  )
}
