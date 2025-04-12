'use client'
import { ConnectButton } from 'thirdweb/react'
import { client } from '@/lib/client'
import { generatePayload, isLoggedIn, login, logout } from '@/actions/login'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const WalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false)

  return (
    <div className="relative">
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-md z-10">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      <div className="bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:text-white rounded-md">
        <ConnectButton
          theme="light"
          client={client}
          auth={{
            isLoggedIn: async (address) => {
              console.log('checking if logged in!', { address })
              return await isLoggedIn()
            },
            doLogin: async (params) => {
              console.log('logging in!')
              setIsConnecting(true)
              try {
                await login(params)
              } finally {
                setIsConnecting(false)
              }
            },
            getLoginPayload: async ({ address }) => generatePayload({ address }),
            doLogout: async () => {
              console.log('logging out!')
              setIsConnecting(true)
              try {
                await logout()
              } finally {
                setIsConnecting(false)
              }
            },
          }}
        />
      </div>
    </div>
  )
}

export default WalletConnect
