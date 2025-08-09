'use client'

import { ClerkProvider as ClerkAuthProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

interface ClerkProviderProps {
  children: React.ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <ClerkAuthProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: '#16a34a', // green-600
          colorPrimaryText: '#ffffff',
          colorBackground: '#ffffff',
          colorText: '#1f2937', // gray-800
          colorTextSecondary: '#6b7280', // gray-500
          colorTextOnPrimaryBackground: '#ffffff',
          colorInputText: '#1f2937',
          colorInputBackground: '#ffffff',
          borderRadius: '0.375rem', // rounded-md
        },
        elements: {
          formButtonPrimary: 
            'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
          formButtonSecondary: 
            'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200',
          card: 
            'shadow-lg border border-gray-200 rounded-lg bg-white',
          headerTitle: 
            'text-2xl font-bold text-gray-900',
          headerSubtitle: 
            'text-gray-600 mt-1',
          socialButtonsBlockButton:
            'border border-gray-300 hover:border-gray-400 rounded-md font-medium transition-colors duration-200',
          formFieldInput:
            'border border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md',
          formFieldLabel:
            'text-gray-700 font-medium',
          dividerLine:
            'bg-gray-300',
          dividerText:
            'text-gray-500',
          footerActionLink:
            'text-green-600 hover:text-green-700 font-medium',
        },
      }}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      {children}
    </ClerkAuthProvider>
  )
}