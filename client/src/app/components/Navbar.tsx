import React from 'react'
import WalletConnect from './WalletConnect'
import Image from 'next/image'
const Navbar = () => {
  return (
    <div>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div>
            <Image src="/logo.svg" alt="logo" width={150} height={150} />
          </div>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <WalletConnect />
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
