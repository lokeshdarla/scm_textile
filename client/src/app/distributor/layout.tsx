'use client'
import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { NavItem } from '../components/Sidebar'

const distributorsNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/distributor',
  },
  {
    title: 'Add for Shipping',
    href: '/distributor/add-for-shipping',
  },
  {
    title: 'Transactions',
    href: '/distributor/transactions',
  },
  {
    title: 'Profile',
    href: '/distributor/profile',
  },
]

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout navItems={distributorsNavItems}>{children}</DashboardLayout>
}
