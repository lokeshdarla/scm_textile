'use client'
import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'

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
  return <DashboardLayout navItems={millsNavItems}>{children}</DashboardLayout>
}
