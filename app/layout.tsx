import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PropDesk Pro — Prop Firm Trading Command Center',
  description: 'Challenge tracker, risk calculator, trade journal, and multi-account stacker for prop firm traders.',
  keywords: 'FTMO, prop firm, funded account, trading dashboard, challenge tracker',
  openGraph: {
    title: 'PropDesk Pro',
    description: 'Pass your prop firm challenge. Get funded. Scale.',
    url: 'https://propdeskpro.com',
    siteName: 'PropDesk Pro',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
