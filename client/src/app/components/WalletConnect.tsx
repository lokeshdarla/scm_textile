'use client'
import { ConnectButton } from 'thirdweb/react'
import { client } from '@/lib/client'
import { generatePayload, isLoggedIn, login, logout } from '@/actions/login' // we'll create this file in the next section

const WalletConnect = () => {
  return (
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
          await login(params)
        },
        getLoginPayload: async ({ address }) => generatePayload({ address }),
        doLogout: async () => {
          console.log('logging out!')
          await logout()
        },
      }}
    />
  )
}

export default WalletConnect
