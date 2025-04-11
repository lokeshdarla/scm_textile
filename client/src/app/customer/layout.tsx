'use client'
import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'

const customerNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/customer',
  },
  {
    title: 'Products',
    href: '/customer/products',
  },
  {
    title: 'Your Orders',
    href: '/customer/your-orders',
  },
  {
    title: 'Transactions',
    href: '/customer/transactions',
  },
  {
    title: 'Profile',
    href: '/customer/profile',
  },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout navItems={customerNavItems}>{children}</DashboardLayout>
}
