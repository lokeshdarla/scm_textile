import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThirdwebProvider } from 'thirdweb/react'
import Navbar from './components/Navbar'
import { Toaster } from 'sonner'
import { LoadingProvider } from '@/components/providers/loading-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Decentralized Textile Supply Chain',
  description: 'A blockchain-based platform for transparent and efficient textile supply chain management',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThirdwebProvider>
          <LoadingProvider>
            <Toaster />
            {children}
          </LoadingProvider>
        </ThirdwebProvider>
      </body>
    </html>
  )
}
