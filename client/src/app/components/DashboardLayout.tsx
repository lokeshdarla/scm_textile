'use client'
import React from 'react'
import Sidebar, { NavItem } from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  title?: string
  sidebarTitle?: string
}

const DashboardLayout = ({ children, navItems, title = 'Dashboard', sidebarTitle }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar navItems={navItems} title={sidebarTitle || title} />
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm border-b border-green-100">
            <div className="px-4 py-6">
              <h1 className="text-2xl font-bold text-blue-800">{title}</h1>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
