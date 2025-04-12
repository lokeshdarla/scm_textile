'use client'
import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'

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
  return <DashboardLayout navItems={farmerNavItems}>{children}</DashboardLayout>
}
