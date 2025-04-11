'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { logout } from '@/actions/login'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { LogOut, ChevronLeft, ChevronRight, User, Settings, ShieldCheck } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface NavItem {
  title: string
  href: string
  icon?: React.ReactNode
}

interface SidebarProps {
  navItems: NavItem[]
  title?: string
  className?: string
}

const Sidebar = ({ navItems, title = 'Dashboard', className }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await logout()
    setLogoutDialogOpen(false)
    router.push('/')
  }

  return (
    <div className={cn('flex flex-col h-screen border-r shadow-lg transition-all duration-300 relative', 'bg-blue-700', collapsed ? 'w-20' : 'w-64', className)}>
      {/* Collapse toggle button */}
      {/* <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white rounded-full p-1.5 shadow-md border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button> */}

      {/* Logo area */}
      <div className="p-4 flex justify-center items-center border-b border-blue-500/30 bg-blue-700/30 h-20">
        {collapsed ? (
          <div className="w-10 h-10 relative flex items-center justify-center bg-white/10 rounded-full p-2">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="bg-white/10 rounded-full p-2">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Supply Chain</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
        <TooltipProvider delayDuration={300}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center w-full p-3 rounded-lg transition-all duration-200',
                      isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-md' : 'text-white hover:bg-white/10'
                    )}
                  >
                    {item.icon}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white text-blue-600 border-blue-100">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium',
                  isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-md' : 'text-white hover:bg-blue-700/70'
                )}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                <span className="text-sm">{item.title}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* User section & logout */}
      <div className={cn('mt-auto border-t border-blue-500/30 bg-blue-700/30 p-4', collapsed ? 'text-center' : '')}>
        {/* {!collapsed ? (
          <div className="mb-4 flex items-center px-2">
            <div>
              <div className="text-white font-medium text-sm">User Account</div>
              <div className="text-blue-200 text-xs">Supply Chain Manager</div>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex justify-center"></div>
        )} */}

        {collapsed ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={() => setLogoutDialogOpen(true)} className="w-full aspect-square bg-white/10 hover:bg-white/20 text-white border border-white/10">
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button className="w-full group bg-white/10 hover:bg-white/20 text-white border border-white/10" onClick={() => setLogoutDialogOpen(true)}>
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        )}
      </div>

      {/* Logout confirmation dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="bg-white max-w-sm rounded-xl shadow-lg border-0">
          <DialogHeader>
            <DialogTitle className="text-blue-700 text-xl">Confirm Logout</DialogTitle>
            <DialogDescription className="text-gray-600">Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-end mt-4">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)} className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50">
              Cancel
            </Button>
            <Button onClick={handleLogout} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md">
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Sidebar
