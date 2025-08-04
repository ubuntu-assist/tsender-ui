'use client'

import { AirdropForm } from '@/components/airdrop-form'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

function HomeContent() {
  const { isConnected } = useAccount()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className='w-full max-w-2xl mx-auto p-6'>
      {isConnected ? (
        <AirdropForm />
      ) : (
        <div className='bg-white text-black rounded-lg shadow-lg p-6 text-center'>
          <h2 className='text-2xl font-bold mb-4'>Wallet Not Connected</h2>
          <p className='text-lg mb-6'>
            Please connect your wallet to proceed with the airdrop.
          </p>
          <img
            src='/connected-world.gif'
            alt='Connect Wallet Icon'
            className='mx-auto w-40 h-40 mb-4'
          />
          <p className='text-sm text-gray-500'>
            Use your wallet provider (e.g., MetaMask) to connect your account.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='relative w-full min-h-screen'>
        <svg
          className='absolute inset-0 w-full h-full'
          style={{ zIndex: 0 }}
          xmlns='http://www.w3.org/2000/svg'
        >
          <defs>
            <pattern
              id='triangle-pattern'
              width='40'
              height='40'
              patternUnits='userSpaceOnUse'
            >
              <path
                d='M20 0 L40 20 L20 40 L0 20 Z'
                fill='none'
                stroke='rgba(0, 0, 0, 0.1)'
                strokeWidth='1'
              />
              <path
                d='M20 10 L30 20 L20 30 L10 20 Z'
                fill='none'
                stroke='rgba(0, 0, 0, 0.05)'
                strokeWidth='0.5'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#triangle-pattern)' />
        </svg>
        <div className='relative z-10 flex items-center justify-center min-h-screen'>
          <HomeContent />
        </div>
      </div>
    </div>
  )
}
