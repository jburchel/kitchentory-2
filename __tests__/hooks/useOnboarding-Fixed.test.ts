import { renderHook, act } from '@testing-library/react'
import { useOnboarding } from '@/hooks/useOnboarding'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock Clerk hooks
const mockUser = {
  id: 'user_test_123',
  firstName: 'John',
  lastName: 'Doe',
  update: jest.fn().mockResolvedValue({}),
  publicMetadata: {},
}

jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: mockUser,
    isLoaded: true,
  })),
}))

// Mock Convex mutation
jest.mock('convex/react', () => ({
  useMutation: jest.fn(() => jest.fn().mockResolvedValue('mock-result')),
}))

// Mock validation functions
jest.mock('@/lib/validations/household', () => ({
  validateStep: jest.fn(),
  formatValidationErrors: jest.fn(),
  stepSchemas: {
    profile: 'mock-profile-schema',
    household: 'mock-household-schema',
    settings: 'mock-settings-schema',
    invitations: 'mock-invitations-schema',
  },
}))

describe('useOnboarding Hook - Fixed Tests', () => {
  const mockValidateStep = require('@/lib/validations/household').validateStep
  const mockFormatValidationErrors = require('@/lib/validations/household').formatValidationErrors

  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateStep.mockReturnValue({ success: true, data: {} })
    mockFormatValidationErrors.mockReturnValue({})
    mockUser.update.mockResolvedValue({})
  })

  describe('Initial State', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useOnboarding())

      expect(result.current.state.progress.currentStep).toBe(0)
      expect(result.current.state.progress.totalSteps).toBe(5)
      expect(result.current.state.progress.steps).toHaveLength(5)

      // Profile should be initialized with user data
      expect(result.current.state.profile.data.firstName).toBe('John')
      expect(result.current.state.profile.data.lastName).toBe('Doe')

      // Other steps should have default values
      expect(result.current.state.household.data.name).toBe('')
      expect(result.current.state.settings.data.currency).toBe('USD')
      expect(result.current.state.invitations.data).toEqual([])
    })

    it('sets up progress steps correctly', () => {
      const { result } = renderHook(() => useOnboarding())

      const steps = result.current.state.progress.steps
      expect(steps[0]).toEqual({
        id: 'profile',
        title: 'Profile Setup',
        description: 'Tell us about yourself',
        completed: false,
        current: true,
      })

      expect(steps[1]).toEqual({
        id: 'household',
        title: 'Create Household',
        description: 'Set up your household',
        completed: false,
        current: false,
      })
    })

    it('computes initial state correctly', () => {
      const { result } = renderHook(() => useOnboarding())

      expect(result.current.computed.isFirstStep).toBe(true)
      expect(result.current.computed.isLastStep).toBe(false)
      expect(result.current.computed.completionPercentage).toBe(0)
    })

    it('handles user without names gracefully', () => {
      mockUser.firstName = ''
      mockUser.lastName = ''

      const { result } = renderHook(() => useOnboarding())

      expect(result.current.state.profile.data.firstName).toBe('')
      expect(result.current.state.profile.data.lastName).toBe('')
    })
  })

  describe('Step Navigation', () => {
    it('advances to next step', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.nextStep()
      })

      expect(result.current.state.progress.currentStep).toBe(1)
      expect(result.current.state.progress.steps[0].completed).toBe(true)
      expect(result.current.state.progress.steps[0].current).toBe(false)
      expect(result.current.state.progress.steps[1].current).toBe(true)
    })

    it('goes back to previous step', () => {
      const { result } = renderHook(() => useOnboarding())

      // Go to step 2 first
      act(() => {
        result.current.actions.nextStep()
        result.current.actions.nextStep()
      })

      expect(result.current.state.progress.currentStep).toBe(2)

      // Go back
      act(() => {
        result.current.actions.previousStep()
      })

      expect(result.current.state.progress.currentStep).toBe(1)
      expect(result.current.state.progress.steps[1].current).toBe(true)
    })

    it('does not go below step 0', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.previousStep()
      })

      expect(result.current.state.progress.currentStep).toBe(0)
    })

    it('does not go above last step', () => {
      const { result } = renderHook(() => useOnboarding())

      // Try to go beyond last step
      act(() => {
        result.current.actions.nextStep()
        result.current.actions.nextStep()
        result.current.actions.nextStep()
        result.current.actions.nextStep()
        result.current.actions.nextStep()
        result.current.actions.nextStep() // Beyond last step
      })

      expect(result.current.state.progress.currentStep).toBe(4) // Should stop at last step
    })

    it('jumps to specific step', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.goToStep(3)
      })

      expect(result.current.state.progress.currentStep).toBe(3)
      expect(result.current.state.progress.steps[3].current).toBe(true)
    })
  })

  describe('Profile Data Management', () => {
    it('updates profile data', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateProfile({ firstName: 'Jane' })
      })

      expect(result.current.state.profile.data.firstName).toBe('Jane')
      expect(result.current.state.profile.data.lastName).toBe('Doe') // Should preserve existing
    })

    it('validates profile data on update', () => {
      mockValidateStep.mockReturnValue({
        success: false,
        errors: { issues: [{ path: ['firstName'], message: 'Required' }] }
      })
      mockFormatValidationErrors.mockReturnValue({ firstName: 'Required' })

      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateProfile({ firstName: '' })
      })

      expect(mockValidateStep).toHaveBeenCalledWith('profile', expect.objectContaining({
        firstName: '',
        lastName: 'Doe'
      }))
      expect(result.current.state.profile.validation.errors.firstName).toBe('Required')
      expect(result.current.state.profile.validation.isValid).toBe(false)
    })

    it('clears validation errors when data is valid', () => {
      const { result } = renderHook(() => useOnboarding())

      // First set invalid data
      mockValidateStep.mockReturnValueOnce({
        success: false,
        errors: { issues: [{ path: ['firstName'], message: 'Required' }] }
      })
      mockFormatValidationErrors.mockReturnValueOnce({ firstName: 'Required' })

      act(() => {
        result.current.actions.updateProfile({ firstName: '' })
      })

      expect(result.current.state.profile.validation.isValid).toBe(false)

      // Then set valid data
      mockValidateStep.mockReturnValue({ success: true, data: {} })
      mockFormatValidationErrors.mockReturnValue({})

      act(() => {
        result.current.actions.updateProfile({ firstName: 'John' })
      })

      expect(result.current.state.profile.validation.isValid).toBe(true)
      expect(Object.keys(result.current.state.profile.validation.errors)).toHaveLength(0)
    })
  })

  describe('Household Data Management', () => {
    it('updates household data', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateHousehold({
          name: 'Smith Family Kitchen',
          type: 'family'
        })
      })

      expect(result.current.state.household.data.name).toBe('Smith Family Kitchen')
      expect(result.current.state.household.data.type).toBe('family')
    })

    it('validates household data', () => {
      mockValidateStep.mockReturnValue({
        success: false,
        errors: { issues: [{ path: ['name'], message: 'Required' }] }
      })
      mockFormatValidationErrors.mockReturnValue({ name: 'Required' })

      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateHousehold({ name: '' })
      })

      expect(mockValidateStep).toHaveBeenCalledWith('household', expect.objectContaining({
        name: ''
      }))
      expect(result.current.state.household.validation.errors.name).toBe('Required')
    })
  })

  describe('Settings Data Management', () => {
    it('updates settings data', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateSettings({
          currency: 'EUR',
          expirationWarningDays: 14
        })
      })

      expect(result.current.state.settings.data.currency).toBe('EUR')
      expect(result.current.state.settings.data.expirationWarningDays).toBe(14)
    })

    it('validates settings data', () => {
      mockValidateStep.mockReturnValue({
        success: false,
        errors: { issues: [{ path: ['settings', 'expirationWarningDays'], message: 'Invalid range' }] }
      })
      mockFormatValidationErrors.mockReturnValue({ 'settings.expirationWarningDays': 'Invalid range' })

      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateSettings({ expirationWarningDays: 500 })
      })

      expect(mockValidateStep).toHaveBeenCalledWith('settings', {
        settings: expect.objectContaining({
          expirationWarningDays: 500
        })
      })
    })
  })

  describe('Invitation Management', () => {
    it('adds invitation', () => {
      const { result } = renderHook(() => useOnboarding())

      const invitation = { email: 'test@example.com', role: 'member' as const }

      act(() => {
        result.current.actions.addInvitation(invitation)
      })

      expect(result.current.state.invitations.data).toHaveLength(1)
      expect(result.current.state.invitations.data[0]).toEqual(invitation)
    })

    it('updates invitation', () => {
      const { result } = renderHook(() => useOnboarding())

      // Add invitation first
      act(() => {
        result.current.actions.addInvitation({ email: 'test@example.com', role: 'member' })
      })

      // Update it
      act(() => {
        result.current.actions.updateInvitation(0, { role: 'admin' })
      })

      expect(result.current.state.invitations.data[0]).toEqual({
        email: 'test@example.com',
        role: 'admin'
      })
    })

    it('removes invitation', () => {
      const { result } = renderHook(() => useOnboarding())

      // Add two invitations
      act(() => {
        result.current.actions.addInvitation({ email: 'test1@example.com', role: 'member' })
        result.current.actions.addInvitation({ email: 'test2@example.com', role: 'admin' })
      })

      expect(result.current.state.invitations.data).toHaveLength(2)

      // Remove first invitation
      act(() => {
        result.current.actions.removeInvitation(0)
      })

      expect(result.current.state.invitations.data).toHaveLength(1)
      expect(result.current.state.invitations.data[0].email).toBe('test2@example.com')
    })
  })

  describe('Step Validation', () => {
    it('validates current step', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        const isValid = result.current.actions.validateStep('profile')
        expect(isValid).toBe(true)
      })

      expect(mockValidateStep).toHaveBeenCalledWith('profile', expect.any(Object))
    })

    it('returns false for invalid step', () => {
      mockValidateStep.mockReturnValue({
        success: false,
        errors: { issues: [{ path: ['firstName'], message: 'Required' }] }
      })
      mockFormatValidationErrors.mockReturnValue({ firstName: 'Required' })

      const { result } = renderHook(() => useOnboarding())

      act(() => {
        const isValid = result.current.actions.validateStep('profile')
        expect(isValid).toBe(false)
      })
    })
  })

  describe('Onboarding Submission', () => {
    it('submits onboarding successfully', async () => {
      const { result } = renderHook(() => useOnboarding())

      // Set up data
      act(() => {
        result.current.actions.updateProfile({ firstName: 'John', lastName: 'Doe' })
        result.current.actions.updateHousehold({ name: 'Test Kitchen', type: 'family' })
      })

      let submissionResult: any
      await act(async () => {
        submissionResult = await result.current.actions.submitOnboarding()
      })

      expect(submissionResult).toEqual({
        householdId: 'mock-household-id',
        inviteCode: '',
        invitationsCount: 0,
      })
      expect(result.current.state.completion.success).toBe(true)
    })

    it('handles submission errors', async () => {
      mockUser.update.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateProfile({ firstName: 'John', lastName: 'Doe' })
        result.current.actions.updateHousehold({ name: 'Test Kitchen', type: 'family' })
      })

      await expect(act(async () => {
        await result.current.actions.submitOnboarding()
      })).rejects.toThrow('Network error')

      expect(result.current.state.completion.error).toBe('Network error')
      expect(result.current.state.completion.success).toBe(false)
    })

    it('updates user profile during submission', async () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateProfile({ firstName: 'Jane', lastName: 'Smith' })
        result.current.actions.updateHousehold({ name: 'Test Kitchen', type: 'family' })
      })

      await act(async () => {
        await result.current.actions.submitOnboarding()
      })

      expect(mockUser.update).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
      })

      expect(mockUser.update).toHaveBeenCalledWith({
        publicMetadata: {
          onboardingCompleted: true,
          primaryHouseholdId: 'mock-household-id',
        },
      })
    })

    it('skips profile update when names unchanged', async () => {
      const { result } = renderHook(() => useOnboarding())

      // Don't change names - keep defaults
      act(() => {
        result.current.actions.updateHousehold({ name: 'Test Kitchen', type: 'family' })
      })

      await act(async () => {
        await result.current.actions.submitOnboarding()
      })

      // Should only update metadata, not profile names
      expect(mockUser.update).toHaveBeenCalledTimes(1)
      expect(mockUser.update).toHaveBeenCalledWith({
        publicMetadata: {
          onboardingCompleted: true,
          primaryHouseholdId: 'mock-household-id',
        },
      })
    })

    it('processes invitations during submission', async () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateProfile({ firstName: 'John', lastName: 'Doe' })
        result.current.actions.updateHousehold({ name: 'Test Kitchen', type: 'family' })
        result.current.actions.addInvitation({ email: 'friend@example.com', role: 'member' })
      })

      let submissionResult: any
      await act(async () => {
        submissionResult = await result.current.actions.submitOnboarding()
      })

      expect(submissionResult.invitationsCount).toBe(1)
    })
  })

  describe('Computed Properties', () => {
    it('computes canProceed correctly', () => {
      mockValidateStep.mockReturnValue({ success: true, data: {} })

      const { result } = renderHook(() => useOnboarding())

      expect(result.current.computed.canProceed).toBe(true)
    })

    it('computes isFirstStep correctly', () => {
      const { result } = renderHook(() => useOnboarding())

      expect(result.current.computed.isFirstStep).toBe(true)

      act(() => {
        result.current.actions.nextStep()
      })

      expect(result.current.computed.isFirstStep).toBe(false)
    })

    it('computes isLastStep correctly', () => {
      const { result } = renderHook(() => useOnboarding())

      expect(result.current.computed.isLastStep).toBe(false)

      // Go to last step
      act(() => {
        result.current.actions.goToStep(4)
      })

      expect(result.current.computed.isLastStep).toBe(true)
    })

    it('computes completion percentage correctly', () => {
      const { result } = renderHook(() => useOnboarding())

      expect(result.current.computed.completionPercentage).toBe(0)

      // Complete first step
      act(() => {
        result.current.actions.nextStep()
      })

      expect(result.current.computed.completionPercentage).toBe(20) // 1/5 = 20%
    })

    it('computes hasUnsavedChanges correctly', () => {
      const { result } = renderHook(() => useOnboarding())

      // Should have changes because user has default name data
      expect(result.current.computed.hasUnsavedChanges).toBe(true)

      // Add more data
      act(() => {
        result.current.actions.updateHousehold({ name: 'Test Kitchen' })
      })

      expect(result.current.computed.hasUnsavedChanges).toBe(true)
    })
  })

  describe('State Reset', () => {
    it('resets state to initial values', () => {
      const { result } = renderHook(() => useOnboarding())

      // Make changes
      act(() => {
        result.current.actions.nextStep()
        result.current.actions.updateProfile({ firstName: 'Changed' })
        result.current.actions.updateHousehold({ name: 'Changed Kitchen' })
      })

      // Reset
      act(() => {
        result.current.actions.reset()
      })

      expect(result.current.state.progress.currentStep).toBe(0)
      expect(result.current.state.profile.data.firstName).toBe('')
      expect(result.current.state.household.data.name).toBe('')
    })
  })

  describe('Error Handling', () => {
    it('handles user not authenticated', async () => {
      const { useUser } = require('@clerk/nextjs')
      useUser.mockReturnValueOnce({ user: null, isLoaded: true })

      const { result } = renderHook(() => useOnboarding())

      await expect(act(async () => {
        await result.current.actions.submitOnboarding()
      })).rejects.toThrow('User not authenticated')
    })

    it('sets loading states during operations', async () => {
      mockUser.update.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({}), 50))
      )

      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.actions.updateProfile({ firstName: 'John', lastName: 'Doe' })
        result.current.actions.updateHousehold({ name: 'Test Kitchen', type: 'family' })
      })

      // Start submission
      const submissionPromise = act(async () => {
        return result.current.actions.submitOnboarding()
      })

      // Should be loading
      expect(result.current.state.completion.isLoading).toBe(true)

      // Wait for completion
      await submissionPromise

      // Should no longer be loading
      expect(result.current.state.completion.isLoading).toBe(false)
    })
  })
})