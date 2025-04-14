'use client'
import React from 'react'
import Sidebar, { NavItem } from './Sidebar'
import { ConnectButton, useActiveAccount } from 'thirdweb/react'
import { client } from '@/lib/client'
import { inAppWallet } from 'thirdweb/wallets'
import { createWallet } from 'thirdweb/wallets'

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
}

const wallets = [
  inAppWallet({
    auth: {
      options: [],
    },
  }),
  createWallet('io.metamask'),
  // createWallet('com.coinbase.wallet'),
]

const DashboardLayout = ({ children, navItems }: DashboardLayoutProps) => {
  const activeAccount = useActiveAccount()
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar navItems={navItems} />
        <div className="flex-1 overflow-auto">
          <nav className="flex items-center justify-end p-4">
            <ConnectButton
              client={client}
              wallets={wallets}
              theme={'light'}
              connectModal={{ size: 'compact' }}
              connectButton={{
                label: activeAccount ? 'Wallet Connected' : 'Connect Wallet',
                className: 'w-full h-10 font-medium focus:outline-none focus:ring-0',
              }}
              autoConnect={true}
            />
          </nav>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
