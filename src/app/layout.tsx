import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@/components/providers/ClerkProvider'
import { ConvexProvider } from '@/components/providers/ConvexProvider'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Kitchentory - Kitchen Inventory Management',
  description: 'Manage your kitchen inventory with ease',
  keywords: ['kitchen', 'inventory', 'management', 'recipes'],
  authors: [{ name: 'Kitchentory Team' }],
  creator: 'Kitchentory',
  publisher: 'Kitchentory',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkProvider>
          <ConvexProvider>
            <AuthProvider>
              <div id="root">{children}</div>
            </AuthProvider>
          </ConvexProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
