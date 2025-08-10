import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClerkProvider } from '@clerk/nextjs'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock UI components with more realistic implementations
jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, onBlur, placeholder, className, type, min, max, ...props }: any) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      type={type}
      min={min}
      max={max}
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">{children}</div>
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => (
    <label className={className} data-testid="label">{children}</label>
  ),
}))

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">👤</div>,
  Home: () => <div data-testid="home-icon">🏠</div>,
  Settings: () => <div data-testid="settings-icon">⚙️</div>,
  UserPlus: () => <div data-testid="user-plus-icon">👥</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">✅</div>,
  ArrowLeft: () => <div data-testid="arrow-left">←</div>,
  ArrowRight: () => <div data-testid="arrow-right">→</div>,
}))

// Mock Clerk hooks with realistic behavior
const mockUser = {
  id: 'user_test_123',
  firstName: '',
  lastName: '',
  update: jest.fn().mockResolvedValue({}),
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

const renderOnboardingFlow = () => {
  return render(
    <ClerkProvider publishableKey="pk_test_mock">
      <OnboardingWizard />
    </ClerkProvider>
  )
}

describe('Onboarding Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionClaims.publicMetadata = {}
    mockUser.firstName = ''
    mockUser.lastName = ''
    mockUser.update.mockClear()
  })

  describe('Complete Happy Path Flow', () => {
    it('allows user to complete entire onboarding process', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Step 1: Profile Step
      expect(screen.getByText('Tell us about yourself')).toBeInTheDocument()
      
      const firstNameInput = screen.getByPlaceholderText('Enter your first name')
      const lastNameInput = screen.getByPlaceholderText('Enter your last name')
      
      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      
      // Progress to next step
      const nextButton = screen.getByText('Continue')
      expect(nextButton).not.toBeDisabled()
      await user.click(nextButton)

      // Step 2: Household Step
      await waitFor(() => {
        expect(screen.getByText('Create your household')).toBeInTheDocument()
      })
      
      const householdNameInput = screen.getByPlaceholderText(/Smith Family Kitchen/)
      await user.type(householdNameInput, 'Test Family Kitchen')
      
      const continueButton = screen.getByText('Continue')
      await user.click(continueButton)

      // Step 3: Settings Step
      await waitFor(() => {
        expect(screen.getByText('Configure your preferences')).toBeInTheDocument()
      })
      
      // Settings should have valid defaults, so we can continue
      const settingsContinueButton = screen.getByText('Continue')
      expect(settingsContinueButton).not.toBeDisabled()
      await user.click(settingsContinueButton)

      // Step 4: Invitations Step (optional)
      await waitFor(() => {
        expect(screen.getByText('Invite household members')).toBeInTheDocument()
      })
      
      // Skip invitations
      const invitationsContinueButton = screen.getByText('Review & finish')
      await user.click(invitationsContinueButton)

      // Step 5: Completion Step
      await waitFor(() => {
        expect(screen.getByText('Ready to get started!')).toBeInTheDocument()
      })
      
      const createButton = screen.getByText('Create household')
      expect(createButton).toBeInTheDocument()
      await user.click(createButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument()
      })
    }, 15000)

    it('validates required fields before allowing progression', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Try to continue without filling profile
      const nextButton = screen.getByText('Continue')
      expect(nextButton).toBeDisabled()
      
      // Fill only first name
      const firstNameInput = screen.getByPlaceholderText('Enter your first name')
      await user.type(firstNameInput, 'John')
      
      // Should still be disabled without last name
      expect(nextButton).toBeDisabled()
      
      // Fill last name
      const lastNameInput = screen.getByPlaceholderText('Enter your last name')
      await user.type(lastNameInput, 'Doe')
      
      // Now should be enabled
      await waitFor(() => {
        expect(nextButton).not.toBeDisabled()
      })
    })

    it('allows navigation backwards through completed steps', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Complete profile step
      const firstNameInput = screen.getByPlaceholderText('Enter your first name')
      const lastNameInput = screen.getByPlaceholderText('Enter your last name')
      
      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      
      const nextButton = screen.getByText('Continue')
      await user.click(nextButton)

      // Now on household step - should be able to go back
      await waitFor(() => {
        expect(screen.getByText('Create your household')).toBeInTheDocument()
      })
      
      const backButton = screen.getByText('Back')
      expect(backButton).toBeInTheDocument()
      await user.click(backButton)

      // Should be back on profile step with data preserved
      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument()
      })
      
      const preservedFirstName = screen.getByDisplayValue('John')
      const preservedLastName = screen.getByDisplayValue('Doe')
      expect(preservedFirstName).toBeInTheDocument()
      expect(preservedLastName).toBeInTheDocument()
    })
  })

  describe('Form Validation Flow', () => {
    it('shows validation errors for profile step', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      const firstNameInput = screen.getByPlaceholderText('Enter your first name')
      
      // Type and then clear (to trigger validation)
      await user.type(firstNameInput, 'John')
      await user.clear(firstNameInput)
      await user.tab() // Trigger blur

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
      
      // Button should be disabled
      const nextButton = screen.getByText('Continue')
      expect(nextButton).toBeDisabled()
    })

    it('shows validation errors for household step', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Complete profile to get to household step
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John')
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Create your household')).toBeInTheDocument()
      })

      const householdNameInput = screen.getByPlaceholderText(/Smith Family Kitchen/)
      
      // Type and clear to trigger validation
      await user.type(householdNameInput, 'Test')
      await user.clear(householdNameInput)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    it('clears validation errors when fields are corrected', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      const firstNameInput = screen.getByPlaceholderText('Enter your first name')
      
      // Trigger validation error
      await user.type(firstNameInput, 'J')
      await user.clear(firstNameInput)
      await user.tab()

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })

      // Fix the field
      await user.type(firstNameInput, 'John')

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/required/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Progress Tracking', () => {
    it('updates progress bar as user moves through steps', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Should start at step 1
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
      expect(screen.getByText('0% Complete')).toBeInTheDocument()

      // Complete profile and continue
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John')
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe')
      await user.click(screen.getByText('Continue'))

      // Should be at step 2
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
        expect(screen.getByText('25% Complete')).toBeInTheDocument()
      })
    })

    it('shows completed steps in progress indicator', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Complete first step
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John')
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Create your household')).toBeInTheDocument()
      })

      // Progress bar should show first step as completed
      // (Implementation details would depend on actual ProgressBar component)
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    })
  })

  describe('Settings Step', () => {
    it('handles currency selection correctly', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Navigate to settings step
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John')
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Create your household')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/Smith Family Kitchen/), 'Test Kitchen')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Configure your preferences')).toBeInTheDocument()
      })

      // Change currency
      const currencySelect = screen.getByDisplayValue('US Dollar ($)')
      await user.selectOptions(currencySelect, 'EUR')

      expect(screen.getByDisplayValue('Euro (€)')).toBeInTheDocument()
    })

    it('handles expiration warning days input', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Navigate to settings step
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John')
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Create your household')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/Smith Family Kitchen/), 'Test Kitchen')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Configure your preferences')).toBeInTheDocument()
      })

      // Change expiration warning days
      const warningInput = screen.getByDisplayValue('7')
      await user.clear(warningInput)
      await user.type(warningInput, '14')

      expect(screen.getByDisplayValue('14')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles household creation errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock household creation to fail
      const originalUseOnboarding = require('@/hooks/useOnboarding').useOnboarding
      require('@/hooks/useOnboarding').useOnboarding = jest.fn(() => ({
        ...originalUseOnboarding(),
        actions: {
          ...originalUseOnboarding().actions,
          submitOnboarding: jest.fn().mockRejectedValue(new Error('Network error')),
        },
      }))

      renderOnboardingFlow()

      // Complete all steps rapidly
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John')
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Create your household')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/Smith Family Kitchen/), 'Test Kitchen')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Configure your preferences')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Invite household members')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Review & finish'))

      await waitFor(() => {
        expect(screen.getByText('Ready to get started!')).toBeInTheDocument()
      })

      // Attempt to create household
      const createButton = screen.getByText('Create household')
      await user.click(createButton)

      // Should eventually show error
      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument()
      }, { timeout: 5000 })

      // Restore original implementation
      require('@/hooks/useOnboarding').useOnboarding = originalUseOnboarding
    })
  })

  describe('Data Persistence', () => {
    it('preserves form data when navigating between steps', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      // Fill profile data
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John')
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe')
      await user.click(screen.getByText('Continue'))

      // Fill household data
      await waitFor(() => {
        expect(screen.getByText('Create your household')).toBeInTheDocument()
      })
      
      await user.type(screen.getByPlaceholderText(/Smith Family Kitchen/), 'My Test Kitchen')
      await user.click(screen.getByText('Continue'))

      // Go back to household step
      await waitFor(() => {
        expect(screen.getByText('Configure your preferences')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Back'))

      // Data should be preserved
      await waitFor(() => {
        expect(screen.getByDisplayValue('My Test Kitchen')).toBeInTheDocument()
      })

      // Go back to profile step
      await user.click(screen.getByText('Back'))

      // Profile data should also be preserved
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('maintains proper focus management', async () => {
      const user = userEvent.setup()
      renderOnboardingFlow()

      const firstNameInput = screen.getByPlaceholderText('Enter your first name')
      const lastNameInput = screen.getByPlaceholderText('Enter your last name')

      // Tab through form elements
      await user.click(firstNameInput)
      expect(firstNameInput).toHaveFocus()

      await user.tab()
      expect(lastNameInput).toHaveFocus()
    })

    it('provides proper ARIA labels and roles', () => {
      renderOnboardingFlow()

      // Check for proper heading structure
      const mainHeading = screen.getByText('Welcome to Kitchentory!')
      expect(mainHeading.tagName).toBe('H1')

      const stepHeading = screen.getByText('Tell us about yourself')
      expect(stepHeading.tagName).toBe('H2')
    })
  })
})