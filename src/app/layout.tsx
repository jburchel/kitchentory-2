import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <div id="root">{children}</div>
      </body>
    </html>
  )
}