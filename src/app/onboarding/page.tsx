'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
// import { api } from "@/../convex/_generated/api"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CheckCircle, Home, Users, ArrowRight } from 'lucide-react'

interface OnboardingData {
  firstName: string
  lastName: string
  householdName: string
  householdType: 'single' | 'family' | 'shared'
}

export default function OnboardingPage() {
  const { user } = useUser()
  const { sessionClaims } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    householdName: '',
    householdType: 'family',
  })

  // const createHousehold = useMutation(api.households.create)

  // Check if user has already completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = (sessionClaims as any)?.publicMetadata?.onboardingCompleted
    if (hasCompletedOnboarding) {
      router.replace('/dashboard')
    }
  }, [sessionClaims, router])

  const updateFormData = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    setError('')

    try {
      // Update user profile if names have changed
      if (formData.firstName !== user.firstName || formData.lastName !== user.lastName) {
        await user.update({
          firstName: formData.firstName,
          lastName: formData.lastName,
        })
      }

      // Create household (temporarily disabled for build)
      // await createHousehold({
      //   name: formData.householdName,
      //   type: formData.householdType,
      //   ownerId: user.id,
      // })

      // Mark onboarding as completed
      await user.update({
        publicMetadata: {
          onboardingCompleted: true,
        },
      })

      // Redirect to dashboard
      router.replace('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
      setError('Failed to complete setup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedStep1 = formData.firstName.trim() && formData.lastName.trim()
  const canProceedStep2 = formData.householdName.trim()
  const canComplete = canProceedStep1 && canProceedStep2

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
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
        
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Welcome to Kitchentory!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's set up your account and create your first kitchen
        </p>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber < step
                      ? 'bg-green-600 text-white'
                      : stepNumber === step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNumber < step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      stepNumber < step ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Profile</span>
            <span>Household</span>
            <span>Complete</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Profile Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Tell us about yourself
                </h3>
              </div>
              
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
              
              <Button
                onClick={handleNext}
                disabled={!canProceedStep1}
                className="w-full flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Household Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Set up your household
                </h3>
              </div>
              
              <div>
                <Label htmlFor="householdName">Household Name</Label>
                <Input
                  id="householdName"
                  value={formData.householdName}
                  onChange={(e) => updateFormData('householdName', e.target.value)}
                  placeholder="e.g., Smith Family Kitchen"
                  required
                />
              </div>
              
              <div>
                <Label>Household Type</Label>
                <div className="mt-2 space-y-2">
                  {[
                    { value: 'single', label: 'Just me', icon: Users },
                    { value: 'family', label: 'Family household', icon: Home },
                    { value: 'shared', label: 'Shared with roommates', icon: Users },
                  ].map((option) => {
                    const Icon = option.icon
                    return (
                      <label
                        key={option.value}
                        className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="householdType"
                          value={option.value}
                          checked={formData.householdType === option.value}
                          onChange={(e) => updateFormData('householdType', e.target.value as any)}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <Icon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {option.label}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            formData.householdType === option.value
                              ? 'border-green-600 bg-green-600'
                              : 'border-gray-300'
                          }`}
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="space-y-4 text-center">
              <div>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to get started!
                </h3>
                <p className="text-sm text-gray-600">
                  We'll create your household "{formData.householdName}" and set up your kitchen inventory.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-md p-4 text-left">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Setup Summary</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Name: {formData.firstName} {formData.lastName}</li>
                  <li>• Household: {formData.householdName}</li>
                  <li>• Type: {formData.householdType === 'single' ? 'Just me' : 
                    formData.householdType === 'family' ? 'Family household' : 'Shared with roommates'}</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canComplete || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}