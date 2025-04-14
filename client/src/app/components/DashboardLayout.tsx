'use client'
import React from 'react'
import Sidebar, { NavItem } from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
}

const DashboardLayout = ({ children, navItems }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar navItems={navItems} />
        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
