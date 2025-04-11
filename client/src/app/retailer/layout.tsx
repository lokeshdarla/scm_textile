'use client'
import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'

const retailersNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/retailer',
  },
  {
    title: 'Buy Product',
    href: '/retailer/buy-product',
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
  return <DashboardLayout navItems={retailersNavItems}>{children}</DashboardLayout>
}
