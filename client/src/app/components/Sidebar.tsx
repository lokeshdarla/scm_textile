'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { logout } from '@/actions/login'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { LogOut, ShieldCheck } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface NavItem {
  title: string
  href: string
  icon?: React.ReactNode
}

interface SidebarProps {
  navItems: NavItem[]
  className?: string
}

const Sidebar = ({ navItems, className }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  //@ts-ignore
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await logout()
    setLogoutDialogOpen(false)
    router.push('/')
  }

  return (
    <div className={cn('flex flex-col min-h-screen border-r shadow-lg transition-all duration-300 relative', 'bg-primary', collapsed ? 'w-20' : 'w-64', className)}>
      {/* Logo area */}
      <div className="flex items-center justify-center h-20 p-4 border-b border-primary-foreground/20 bg-primary-foreground/10">
        {collapsed ? (
          <div className="relative flex items-center justify-center w-10 h-10 p-2 rounded-full bg-primary-foreground/10">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary-foreground/10">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-primary-foreground">TextileChain</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-foreground/20 scrollbar-track-transparent">
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
                      isActive ? 'bg-primary-foreground/20 shadow-md' : 'text-primary-foreground hover:bg-primary-foreground/10'
                    )}
                  >
                    {item.icon}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-background text-primary/80 border-primary/20">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground shadow-md' : 'text-primary-foreground hover:bg-primary-foreground/10'
                )}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                <span className="text-sm">{item.title}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
              </Link>
            )
          })}
          <Button
            size="icon"
            onClick={() => setLogoutDialogOpen(true)}
            className="flex items-center justify-center w-full gap-2 border aspect-square bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </TooltipProvider>
      </nav>

      {/* User section & logout */}
      {/* <div className={cn('mt-auto border-t border-primary-foreground/20 bg-primary-foreground/10 p-4', collapsed ? 'text-center' : '')}>
        {collapsed ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="w-full border aspect-square bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10"
                >
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            className="w-full border group bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        )}
      </div> */}

      {/* Logout confirmation dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="max-w-sm border shadow-lg bg-background rounded-xl border-border">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">Confirm Logout</DialogTitle>
            <DialogDescription className="text-muted-foreground">Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 mt-4 sm:justify-end">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)} className="border-border text-muted-foreground hover:border-primary/20 hover:text-primary hover:bg-primary/5">
              Cancel
            </Button>
            <Button onClick={handleLogout} className="shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
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
