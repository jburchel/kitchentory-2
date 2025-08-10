import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import ConvexProvider from './ConvexProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kitchentory',
  description: 'Smart kitchen inventory management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ConvexProvider>
            {children}
          </ConvexProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}