'use client'

import { SignIn } from '@clerk/nextjs'
import { ConditionalSocialAuth } from '@/components/auth/SocialAuthButtons'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Welcome back to Kitchentory
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your kitchen inventory
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Social Auth Buttons */}
          <ConditionalSocialAuth mode="sign-in" redirectUrl="/dashboard" />
          
          {/* Clerk Sign In Form */}
          <div className="flex justify-center">
            <SignIn
              path="/auth/sign-in"
              routing="path"
              signUpUrl="/auth/sign-up"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 bg-transparent p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "hidden", // Hide default social buttons since we have custom ones
                  formButtonPrimary:
                    "bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 w-full",
                  formFieldInput:
                    "border border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md w-full",
                  formFieldLabel:
                    "text-gray-700 font-medium text-sm",
                  dividerLine: "hidden",
                  dividerText: "hidden",
                }
              }}
            />
          </div>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/auth/sign-up"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign up
              </a>
            </p>
            <p className="text-sm">
              <a
                href="/auth/forgot-password"
                className="text-green-600 hover:text-green-500"
              >
                Forgot your password?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}