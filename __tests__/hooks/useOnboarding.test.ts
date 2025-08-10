import { renderHook, act } from '@testing-library/react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { ProfileFormData, HouseholdFormData, HouseholdSettingsData, InvitationFormData } from '@/types/onboarding'

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

// Mock Convex mutation (currently mocked in the actual hook)
jest.mock('convex/react', () => ({
  useMutation: jest.fn(() => jest.fn().mockResolvedValue('mock-result')),
}))

// Mock validation functions
jest.mock('@/lib/validations/household', () => ({
  validateStep: jest.fn().mockReturnValue({ success: true, data: {} }),
  formatValidationErrors: jest.fn().mockReturnValue({}),
  stepSchemas: {
    profile: 'mock-schema',
    household: 'mock-schema', 
    settings: 'mock-schema',
    invitations: 'mock-schema',
  },
}))

const mockValidateStep = require('@/lib/validations/household').validateStep
const mockFormatValidationErrors = require('@/lib/validations/household').formatValidationErrors

describe('useOnboarding Hook', () => {
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

    it('computes initial state correctly', () => {
      const { result } = renderHook(() => useOnboarding())
      
      expect(result.current.computed.isFirstStep).toBe(true)
      expect(result.current.computed.isLastStep).toBe(false)
      expect(result.current.computed.completionPercentage).toBe(0)
      expect(result.current.computed.canProceed).toBe(true) // Mock validation returns success
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
  })

  describe('Profile Data Management', () => {
    it('updates profile data', () => {
      const { result } = renderHook(() => useOnboarding())
      
      const newData: Partial<ProfileFormData> = {
        firstName: 'Jane',
      }
      
      act(() => {
        result.current.actions.updateProfile(newData)
      })
      
      expect(result.current.state.profile.data.firstName).toBe('Jane')
      expect(result.current.state.profile.data.lastName).toBe('Doe')
    })

    it('validates profile data on update', () => {
      mockValidateStep.mockReturnValue({ success: false, errors: [{ path: ['firstName'], message: 'Required' }] })
      mockFormatValidationErrors.mockReturnValue({ firstName: 'Required' })
      
      const { result } = renderHook(() => useOnboarding())
      
      act(() => {
        result.current.actions.updateProfile({ firstName: '' })
      })
      
      expect(mockValidateStep).toHaveBeenCalledWith('profile', expect.any(Object))
      expect(result.current.state.profile.validation.errors.firstName).toBe('Required')
      expect(result.current.state.profile.validation.isValid).toBe(false)
    })
  })

  describe('Onboarding Submission', () => {
    it('submits onboarding successfully', async () => {
      const { result } = renderHook(() => useOnboarding())
      
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
    })
  })
})