import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/header'
import { Titillium_Web } from 'next/font/google'

const titillium = Titillium_Web({ subsets: ['latin'], weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'TSender',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={titillium.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
