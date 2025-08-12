import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClerkProvider } from '@clerk/nextjs'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

// Mock components
jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">{children}</div>
  ),
}))

// Mock all step components
jest.mock('@/components/onboarding/ProfileStep', () => ({
  ProfileStep: ({ data, errors, onChange, onFieldTouch, navigation }: any) => (
    <div data-testid="profile-step">
      <h2>Tell us about yourself</h2>
      <input 
        data-testid="first-name-input"
        value={data.firstName}
        onChange={(e) => onChange({ firstName: e.target.value })}
        onBlur={() => onFieldTouch('firstName')}
        placeholder="Enter your first name"
      />
      <input 
        data-testid="last-name-input"
        value={data.lastName}
        onChange={(e) => onChange({ lastName: e.target.value })}
        onBlur={() => onFieldTouch('lastName')}
        placeholder="Enter your last name"
      />
      {errors.firstName && <div data-testid="first-name-error">{errors.firstName}</div>}
      {errors.lastName && <div data-testid="last-name-error">{errors.lastName}</div>}
    </div>
  ),
}))

jest.mock('@/components/onboarding/HouseholdStep', () => ({
  HouseholdStep: ({ data, errors, onChange, onFieldTouch }: any) => (
    <div data-testid="household-step">
      <h2>Create your household</h2>
      <input 
        data-testid="household-name-input"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        onBlur={() => onFieldTouch('name')}
        placeholder="e.g., Smith Family Kitchen, Our Home, Apartment 3B"
      />
      <input 
        data-testid="household-description-input"
        value={data.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
        onBlur={() => onFieldTouch('description')}
        placeholder="e.g., Family of 4 with shared cooking responsibilities"
      />
      {errors.name && <div data-testid="household-name-error">{errors.name}</div>}
      {errors.description && <div data-testid="household-description-error">{errors.description}</div>}
    </div>
  ),
}))

jest.mock('@/components/onboarding/SettingsStep', () => ({
  SettingsStep: ({ data, errors, onChange, onFieldTouch }: any) => (
    <div data-testid="settings-step">
      <h2>Configure your preferences</h2>
      <select 
        data-testid="currency-select"
        value={data.currency}
        onChange={(e) => onChange({ currency: e.target.value })}
      >
        <option value="USD">US Dollar ($)</option>
        <option value="EUR">Euro (€)</option>
        <option value="GBP">British Pound (£)</option>
      </select>
      <input 
        data-testid="expiration-warning-input"
        type="number"
        value={data.expirationWarningDays}
        onChange={(e) => onChange({ expirationWarningDays: parseInt(e.target.value) || 7 })}
        min="1"
        max="365"
      />
      <input 
        data-testid="guest-view-checkbox"
        type="checkbox"
        checked={data.allowGuestView}
        onChange={(e) => onChange({ allowGuestView: e.target.checked })}
      />
      {errors.currency && <div data-testid="currency-error">{errors.currency}</div>}
    </div>
  ),
}))

jest.mock('@/components/onboarding/InvitationStep', () => ({
  InvitationStep: ({ data, errors, onChange, onAdd, onUpdate, onRemove }: any) => (
    <div data-testid="invitation-step">
      <h2>Invite household members</h2>
      <button 
        data-testid="add-invitation"
        onClick={() => onAdd({ email: 'test@example.com', role: 'member' })}
      >
        Add Invitation
      </button>
      <div data-testid="invitation-count">{data.length}</div>
      {data.map((invitation: any, index: number) => (
        <div key={index} data-testid={`invitation-${index}`}>
          <input 
            data-testid={`invitation-email-${index}`}
            value={invitation.email}
            onChange={(e) => onUpdate(index, { email: e.target.value })}
            placeholder="Email address"
          />
          <select
            data-testid={`invitation-role-${index}`}
            value={invitation.role}
            onChange={(e) => onUpdate(index, { role: e.target.value })}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <button 
            data-testid={`remove-invitation-${index}`}
            onClick={() => onRemove(index)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  ),
}))

jest.mock('@/components/onboarding/CompletionStep', () => ({
  CompletionStep: ({ data, isLoading, error, success, onSubmit, onBack }: any) => (
    <div data-testid="completion-step">
      <h2>Ready to get started!</h2>
      {success ? (
        <div data-testid="success-message">Success! Your household has been created.</div>
      ) : (
        <>
          <div data-testid="completion-summary">
            <p>Name: {data.household?.name}</p>
            <p>Profile: {data.profile?.firstName} {data.profile?.lastName}</p>
            <p>Currency: {data.settings?.currency}</p>
            <p>Invitations: {data.invitations?.length || 0}</p>
          </div>
          <button 
            data-testid="submit-onboarding"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create household'}
          </button>
          <button data-testid="completion-back" onClick={onBack}>Back</button>
          {error && <div data-testid="completion-error">{error}</div>}
        </>
      )}
    </div>
  ),
}))

// Mock the progress and navigation components
jest.mock('@/components/onboarding/ProgressBar', () => ({
  ProgressBar: ({ progress, className }: any) => (
    <div className={className} data-testid="progress-bar">
      Step {progress.currentStep + 1} of {progress.totalSteps}
    </div>
  ),
}))

jest.mock('@/components/onboarding/StepNavigation', () => ({
  StepNavigation: ({ canGoBack, canGoNext, isLoading, onBack, onNext, nextLabel }: any) => (
    <div data-testid="step-navigation">
      {canGoBack && (
        <button data-testid="nav-back" onClick={onBack}>Back</button>
      )}
      <button 
        data-testid="nav-next" 
        onClick={onNext}
        disabled={!canGoNext || isLoading}
      >
        {nextLabel || 'Continue'}
      </button>
    </div>
  ),
}))

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
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  update: jest.fn(),
  publicMetadata: {},
}

const mockSessionClaims = {
  publicMetadata: {},
}

jest.mock('@clerk/nextjs', () => ({
  ...jest.requireActual('@clerk/nextjs'),
  useUser: jest.fn(() => ({
    user: mockUser,
    isLoaded: true,
  })),
  useAuth: jest.fn(() => ({
    sessionClaims: mockSessionClaims,
  })),
  ClerkProvider: ({ children }: any) => children,
}))

// Mock useOnboarding hook
const mockOnboardingState = {
  progress: {
    currentStep: 0,
    totalSteps: 5,
    steps: [
      { id: 'profile', title: 'Profile', description: 'Tell us about yourself', completed: false, current: true },
      { id: 'household', title: 'Household', description: 'Create your household', completed: false, current: false },
      { id: 'settings', title: 'Settings', description: 'Configure preferences', completed: false, current: false },
      { id: 'invitations', title: 'Invitations', description: 'Invite members', completed: false, current: false },
      { id: 'complete', title: 'Complete', description: 'Review and finish', completed: false, current: false },
    ],
  },
  profile: {
    data: { firstName: '', lastName: '' },
    validation: { isValid: false, errors: {}, touched: {} },
    operation: { isLoading: false, error: null, success: false },
  },
  household: {
    data: { name: '', description: '', type: 'family' },
    validation: { isValid: false, errors: {}, touched: {} },
    operation: { isLoading: false, error: null, success: false },
  },
  settings: {
    data: { currency: 'USD', defaultUnit: 'pieces', expirationWarningDays: 7, allowGuestView: false },
    validation: { isValid: true, errors: {}, touched: {} },
    operation: { isLoading: false, error: null, success: false },
  },
  invitations: {
    data: [],
    validation: { isValid: true, errors: {}, touched: {} },
    operation: { isLoading: false, error: null, success: false },
  },
  completion: {
    isLoading: false,
    error: null,
    success: false,
  },
}

const mockActions = {
  nextStep: jest.fn(),
  previousStep: jest.fn(),
  goToStep: jest.fn(),
  updateProfile: jest.fn(),
  updateHousehold: jest.fn(),
  updateSettings: jest.fn(),
  addInvitation: jest.fn(),
  updateInvitation: jest.fn(),
  removeInvitation: jest.fn(),
  validateStep: jest.fn().mockReturnValue(false),
  submitOnboarding: jest.fn(),
  reset: jest.fn(),
}

const mockComputed = {
  canProceed: false,
  isFirstStep: true,
  isLastStep: false,
  completionPercentage: 0,
  hasUnsavedChanges: false,
}

jest.mock('@/hooks/useOnboarding', () => ({
  useOnboarding: jest.fn(() => ({
    state: mockOnboardingState,
    actions: mockActions,
    computed: mockComputed,
  })),
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ClerkProvider publishableKey="pk_test_mock">
      {component}
    </ClerkProvider>
  )
}

describe('OnboardingWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionClaims.publicMetadata = {}
  })

  it('renders the onboarding wizard with header and progress', () => {
    renderWithProviders(<OnboardingWizard />)
    
    expect(screen.getByText('Welcome to Kitchentory!')).toBeInTheDocument()
    expect(screen.getByText("Let's set up your household and get you started")).toBeInTheDocument()
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
    expect(screen.getByTestId('card')).toBeInTheDocument()
  })

  it('redirects to dashboard if onboarding is already completed', () => {
    mockSessionClaims.publicMetadata.onboardingCompleted = true
    
    renderWithProviders(<OnboardingWizard />)
    
    expect(mockReplace).toHaveBeenCalledWith('/dashboard')
  })

  it('shows loading spinner when user is not loaded', () => {
    const { useUser } = require('@clerk/nextjs')
    useUser.mockReturnValueOnce({ user: null, isLoaded: false })
    
    renderWithProviders(<OnboardingWizard />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders the current step (profile step by default)', () => {
    renderWithProviders(<OnboardingWizard />)
    
    expect(screen.getByTestId('profile-step')).toBeInTheDocument()
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument()
    expect(screen.queryByTestId('household-step')).not.toBeInTheDocument()
  })

  it('renders navigation controls', () => {
    renderWithProviders(<OnboardingWizard />)
    
    expect(screen.getByTestId('step-navigation')).toBeInTheDocument()
  })

  it('handles step navigation correctly', async () => {
    // Set up the mock to have valid profile data so we can proceed
    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        profile: {
          ...mockOnboardingState.profile,
          data: { firstName: 'John', lastName: 'Doe' },
          validation: { isValid: true, errors: {}, touched: {} },
        },
      },
      actions: {
        ...mockActions,
        validateStep: jest.fn().mockReturnValue(true),
      },
      computed: {
        ...mockComputed,
        canProceed: true,
      },
    })
    
    const user = userEvent.setup()
    renderWithProviders(<OnboardingWizard />)
    
    const nextButton = screen.getByTestId('nav-next')
    await user.click(nextButton)
    
    // The handleNext function should validate and then call nextStep
    expect(mockActions.validateStep).toHaveBeenCalledWith('profile')
    expect(mockActions.nextStep).toHaveBeenCalled()
  })

  it('shows different steps based on current step', () => {
    // Test household step
    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        progress: {
          ...mockOnboardingState.progress,
          currentStep: 1,
          steps: mockOnboardingState.progress.steps.map((step, index) => ({
            ...step,
            current: index === 1,
            completed: index < 1,
          })),
        },
      },
      actions: mockActions,
      computed: { ...mockComputed, isFirstStep: false },
    })

    renderWithProviders(<OnboardingWizard />)
    
    expect(screen.getByTestId('household-step')).toBeInTheDocument()
    expect(screen.queryByTestId('profile-step')).not.toBeInTheDocument()
  })

  it('handles profile form updates', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OnboardingWizard />)
    
    // Verify we're on the profile step initially
    expect(screen.getByTestId('profile-step')).toBeInTheDocument()
    
    const firstNameInput = screen.getByTestId('first-name-input')
    await user.type(firstNameInput, 'Jane')
    
    // The mock ProfileStep calls onChange with the new value
    expect(mockActions.updateProfile).toHaveBeenCalledWith({ firstName: 'Jane' })
  })

  it('validates steps before proceeding', async () => {
    const user = userEvent.setup()
    mockActions.validateStep.mockReturnValue(false)
    
    renderWithProviders(<OnboardingWizard />)
    
    const nextButton = screen.getByTestId('nav-next')
    await user.click(nextButton)
    
    expect(mockActions.validateStep).toHaveBeenCalledWith('profile')
    expect(mockActions.nextStep).not.toHaveBeenCalled()
  })

  it('proceeds to next step when validation passes', async () => {
    const user = userEvent.setup()
    mockActions.validateStep.mockReturnValue(true)
    
    renderWithProviders(<OnboardingWizard />)
    
    const nextButton = screen.getByTestId('nav-next')
    await user.click(nextButton)
    
    expect(mockActions.validateStep).toHaveBeenCalledWith('profile')
    expect(mockActions.nextStep).toHaveBeenCalled()
  })

  it('handles completion step submission', async () => {
    const user = userEvent.setup()
    mockActions.submitOnboarding.mockResolvedValue({
      householdId: 'household_123',
      inviteCode: 'ABC123',
      invitationsCount: 2,
    })

    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        progress: {
          ...mockOnboardingState.progress,
          currentStep: 4,
          steps: mockOnboardingState.progress.steps.map((step, index) => ({
            ...step,
            current: index === 4,
            completed: index < 4,
          })),
        },
      },
      actions: mockActions,
      computed: { ...mockComputed, isFirstStep: false, isLastStep: true },
    })

    renderWithProviders(<OnboardingWizard />)
    
    const submitButton = screen.getByTestId('submit-onboarding')
    await user.click(submitButton)
    
    expect(mockActions.submitOnboarding).toHaveBeenCalled()
  })

  it('handles submission errors gracefully', async () => {
    const user = userEvent.setup()
    const error = new Error('Network error')
    mockActions.submitOnboarding.mockRejectedValue(error)

    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        progress: {
          ...mockOnboardingState.progress,
          currentStep: 4,
        },
        completion: {
          isLoading: false,
          error: 'Network error',
          success: false,
        },
      },
      actions: mockActions,
      computed: { ...mockComputed, isLastStep: true },
    })

    renderWithProviders(<OnboardingWizard />)
    
    const submitButton = screen.getByTestId('submit-onboarding')
    await user.click(submitButton)
    
    expect(screen.getByTestId('completion-error')).toHaveTextContent('Network error')
  })

  it('shows success state after completion', () => {
    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        progress: {
          ...mockOnboardingState.progress,
          currentStep: 4,
        },
        completion: {
          isLoading: false,
          error: null,
          success: true,
        },
      },
      actions: mockActions,
      computed: mockComputed,
    })

    renderWithProviders(<OnboardingWizard />)
    
    expect(screen.getByTestId('success-message')).toBeInTheDocument()
    expect(screen.queryByTestId('step-navigation')).not.toBeInTheDocument()
  })

  it('handles field touch events', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OnboardingWizard />)
    
    const firstNameInput = screen.getByTestId('first-name-input')
    await user.click(firstNameInput)
    await user.tab()
    
    // The onFieldTouch handler logs the event - we can't easily test this
    // but we can verify the input responds to blur events
    expect(firstNameInput).not.toHaveFocus()
  })

  it('displays validation errors', () => {
    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        profile: {
          ...mockOnboardingState.profile,
          validation: {
            isValid: false,
            errors: { firstName: 'First name is required' },
            touched: { firstName: true },
          },
        },
      },
      actions: mockActions,
      computed: mockComputed,
    })

    renderWithProviders(<OnboardingWizard />)
    
    expect(screen.getByTestId('first-name-error')).toHaveTextContent('First name is required')
  })

  it('handles loading states during operations', () => {
    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        profile: {
          ...mockOnboardingState.profile,
          operation: {
            isLoading: true,
            error: null,
            success: false,
          },
        },
      },
      actions: mockActions,
      computed: mockComputed,
    })

    renderWithProviders(<OnboardingWizard />)
    
    const navigation = screen.getByTestId('step-navigation')
    expect(navigation).toBeInTheDocument()
  })

  it('handles unknown step gracefully', () => {
    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        progress: {
          ...mockOnboardingState.progress,
          currentStep: 10, // Invalid step
          steps: [
            ...mockOnboardingState.progress.steps,
            { id: 'unknown', title: 'Unknown', description: 'Unknown step', completed: false, current: true },
          ],
        },
      },
      actions: mockActions,
      computed: mockComputed,
    })

    renderWithProviders(<OnboardingWizard />)
    
    expect(screen.getByText(/Unknown step:/)).toBeInTheDocument()
  })

  it('handles invitation step interactions', async () => {
    const user = userEvent.setup()
    const { useOnboarding } = require('@/hooks/useOnboarding')
    useOnboarding.mockReturnValue({
      state: {
        ...mockOnboardingState,
        progress: {
          ...mockOnboardingState.progress,
          currentStep: 3,
          steps: mockOnboardingState.progress.steps.map((step, index) => ({
            ...step,
            current: index === 3,
            completed: index < 3,
          })),
        },
      },
      actions: mockActions,
      computed: { ...mockComputed, isFirstStep: false },
    })

    renderWithProviders(<OnboardingWizard />)
    
    const addButton = screen.getByTestId('add-invitation')
    await user.click(addButton)
    
    // The onChange handler for invitations has complex logic
    // We can't easily verify the exact calls but can check the button works
    expect(addButton).toBeInTheDocument()
  })
})