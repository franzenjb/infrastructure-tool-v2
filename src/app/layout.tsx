import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PasswordProtection from '@/components/PasswordProtection'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HIFLD Search - Critical Infrastructure Mapping',
  description: 'Search and visualize Homeland Infrastructure Foundation-Level Data (HIFLD) layers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PasswordProtection>
          {children}
        </PasswordProtection>
      </body>
    </html>
  )
}