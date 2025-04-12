'use client'
import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'

const manufacturersNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/manufacturer',
  },
  {
    title: 'Buy Fabric',
    href: '/manufacturer/buy-fabric',
  },
  {
    title: 'Add Product',
    href: '/manufacturer/add-product',
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
  return <DashboardLayout navItems={manufacturersNavItems}>{children}</DashboardLayout>
}
