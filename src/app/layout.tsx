import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@/components/providers/ClerkProvider'
import { ConvexProvider } from '@/components/providers/ConvexProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { PWAProvider } from '@/components/providers/PWAProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundaryWrapper } from '@/components/error/ErrorBoundary'
import { MonitoringProvider } from '@/components/providers/MonitoringProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Kitchentory - Kitchen Inventory Management',
  description: 'Smart kitchen inventory management with expiration tracking and shopping lists',
  keywords: ['kitchen', 'inventory', 'management', 'recipes', 'PWA', 'mobile'],
  authors: [{ name: 'Kitchentory Team' }],
  creator: 'Kitchentory',
  publisher: 'Kitchentory',
  applicationName: 'Kitchentory',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kitchentory',
    startupImage: [
      '/icons/apple-touch-startup-image-750x1334.png',
      {
        url: '/icons/apple-touch-startup-image-1242x2208.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)'
      }
    ]
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kitchentory" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Splash Screen */}
        <link rel="apple-touch-startup-image" href="/icons/apple-touch-startup-image-750x1334.png" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ErrorBoundaryWrapper>
          <ThemeProvider>
            <ClerkProvider>
              <ConvexProvider>
                <AuthProvider>
                  <MonitoringProvider>
                    <PWAProvider>
                      <div id="root">
                        <main id="main-content">{children}</main>
                      </div>
                      <InstallPrompt />
                      <Toaster position="top-right" />
                    </PWAProvider>
                  </MonitoringProvider>
                </AuthProvider>
              </ConvexProvider>
            </ClerkProvider>
          </ThemeProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  )
}
