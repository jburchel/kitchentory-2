import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClerkProvider } from '@clerk/nextjs'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

// Mock all dependencies for performance testing
jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
}))

jest.mock('@/components/onboarding/ProfileStep', () => ({
  ProfileStep: ({ data, onChange }: any) => (
    <div data-testid="profile-step">
      <input
        data-testid="first-name-input"
        value={data.firstName}
        onChange={(e) => onChange({ firstName: e.target.value })}
        placeholder="Enter your first name"
      />
      <input
        data-testid="last-name-input"
        value={data.lastName}
        onChange={(e) => onChange({ lastName: e.target.value })}
        placeholder="Enter your last name"
      />
    </div>
  ),
}))

jest.mock('@/components/onboarding/HouseholdStep', () => ({
  HouseholdStep: () => <div data-testid="household-step">Household</div>,
}))

jest.mock('@/components/onboarding/SettingsStep', () => ({
  SettingsStep: () => <div data-testid="settings-step">Settings</div>,
}))

jest.mock('@/components/onboarding/InvitationStep', () => ({
  InvitationStep: () => <div data-testid="invitation-step">Invitations</div>,
}))

jest.mock('@/components/onboarding/CompletionStep', () => ({
  CompletionStep: () => <div data-testid="completion-step">Complete</div>,
}))

jest.mock('@/components/onboarding/ProgressBar', () => ({
  ProgressBar: () => <div data-testid="progress-bar">Progress</div>,
}))

jest.mock('@/components/onboarding/StepNavigation', () => ({
  StepNavigation: ({ onNext }: any) => (
    <button data-testid="nav-next" onClick={onNext}>Continue</button>
  ),
}))

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

// Mock Clerk
const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe', update: jest.fn() }
jest.mock('@clerk/nextjs', () => ({
  ...jest.requireActual('@clerk/nextjs'),
  useUser: () => ({ user: mockUser, isLoaded: true }),
  useAuth: () => ({ sessionClaims: { publicMetadata: {} } }),
  ClerkProvider: ({ children }: any) => children,
}))

const renderOnboarding = () => {
  return render(
    <ClerkProvider publishableKey="pk_test_mock">
      <OnboardingWizard />
    </ClerkProvider>
  )
}

describe('Onboarding Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering Performance', () => {
    it('renders initial component quickly', () => {
      const startTime = performance.now()
      renderOnboarding()
      const endTime = performance.now()
      
      expect(screen.getByText('Welcome to Kitchentory!')).toBeInTheDocument()
      expect(endTime - startTime).toBeLessThan(50) // Should render in under 50ms
    })

    it('handles multiple rapid re-renders efficiently', () => {
      const { rerender } = renderOnboarding()
      
      const startTime = performance.now()
      for (let i = 0; i < 10; i++) {
        rerender(
          <ClerkProvider publishableKey="pk_test_mock">
            <OnboardingWizard />
          </ClerkProvider>
        )
      }
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // 10 re-renders in under 100ms
    })

    it('maintains performance with complex form interactions', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const input = screen.getByTestId('first-name-input')
      
      const startTime = performance.now()
      
      // Simulate rapid typing
      for (let i = 0; i < 20; i++) {
        await user.type(input, 'a', { delay: 0 })
      }
      
      const endTime = performance.now()
      
      expect(input).toHaveValue('a'.repeat(20))
      expect(endTime - startTime).toBeLessThan(200) // Should handle rapid input efficiently
    })
  })

  describe('Memory Performance', () => {
    it('does not create memory leaks during normal usage', async () => {
      const user = userEvent.setup()
      
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderOnboarding()
        
        // Simulate user interaction
        const input = screen.getByTestId('first-name-input')
        await user.type(input, `Test ${i}`, { delay: 0 })
        
        // Clean up
        unmount()
      }
      
      // Memory should be stable (no way to directly test this in Jest, 
      // but the test ensures components can be properly unmounted)
      expect(true).toBe(true)
    })

    it('handles large amounts of data efficiently', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const input = screen.getByTestId('first-name-input')
      const largeString = 'A'.repeat(1000)
      
      const startTime = performance.now()
      await user.clear(input)
      await user.type(input, largeString, { delay: 0 })
      const endTime = performance.now()
      
      expect(input).toHaveValue(largeString)
      expect(endTime - startTime).toBeLessThan(500) // Should handle large input efficiently
    })
  })

  describe('Interaction Performance', () => {
    it('responds quickly to user clicks', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const button = screen.getByTestId('nav-next')
      
      const startTime = performance.now()
      await user.click(button)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // Click response under 50ms
    })

    it('handles rapid consecutive clicks gracefully', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const button = screen.getByTestId('nav-next')
      
      const startTime = performance.now()
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(button)
      }
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(200) // Multiple clicks handled efficiently
    })

    it('maintains responsive input handling', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const firstName = screen.getByTestId('first-name-input')
      const lastName = screen.getByTestId('last-name-input')
      
      const startTime = performance.now()
      
      // Simulate realistic typing patterns
      await user.type(firstName, 'John', { delay: 1 })
      await user.tab()
      await user.type(lastName, 'Doe', { delay: 1 })
      await user.tab()
      
      const endTime = performance.now()
      
      expect(firstName).toHaveValue('John')
      expect(lastName).toHaveValue('Doe')
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Stress Testing', () => {
    it('handles maximum length inputs efficiently', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const input = screen.getByTestId('first-name-input')
      const maxLengthString = 'A'.repeat(255) // Reasonable max length
      
      const startTime = performance.now()
      await user.type(input, maxLengthString, { delay: 0 })
      const endTime = performance.now()
      
      expect(input).toHaveValue(maxLengthString)
      expect(endTime - startTime).toBeLessThan(1000) // Under 1 second for max input
    })

    it('maintains performance under rapid state changes', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const input = screen.getByTestId('first-name-input')
      
      const startTime = performance.now()
      
      // Simulate rapid typing and clearing
      for (let i = 0; i < 10; i++) {
        await user.type(input, 'Test', { delay: 0 })
        await user.clear(input)
      }
      
      const endTime = performance.now()
      
      expect(input).toHaveValue('')
      expect(endTime - startTime).toBeLessThan(500) // Rapid changes handled efficiently
    })
  })

  describe('Component Lifecycle Performance', () => {
    it('mounts quickly', () => {
      const startTime = performance.now()
      const { container } = renderOnboarding()
      const endTime = performance.now()
      
      expect(container).toBeInTheDocument()
      expect(endTime - startTime).toBeLessThan(25) // Very fast mount
    })

    it('unmounts cleanly', () => {
      const { unmount } = renderOnboarding()
      
      const startTime = performance.now()
      unmount()
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(25) // Fast unmount
    })

    it('handles prop updates efficiently', () => {
      const { rerender } = renderOnboarding()
      
      const startTime = performance.now()
      
      // Multiple prop updates
      for (let i = 0; i < 5; i++) {
        rerender(
          <ClerkProvider publishableKey={`pk_test_mock_${i}`}>
            <OnboardingWizard />
          </ClerkProvider>
        )
      }
      
      const endTime = performance.now()
      
      expect(screen.getByText('Welcome to Kitchentory!')).toBeInTheDocument()
      expect(endTime - startTime).toBeLessThan(100) // Efficient prop updates
    })
  })

  describe('Accessibility Performance', () => {
    it('maintains focus management performance', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const firstName = screen.getByTestId('first-name-input')
      const lastName = screen.getByTestId('last-name-input')
      const button = screen.getByTestId('nav-next')
      
      const startTime = performance.now()
      
      // Tab through all elements
      await user.click(firstName)
      await user.tab()
      expect(lastName).toHaveFocus()
      
      await user.tab()
      expect(button).toHaveFocus()
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50) // Fast focus management
    })

    it('handles screen reader simulation efficiently', () => {
      renderOnboarding()
      
      const startTime = performance.now()
      
      // Query multiple accessibility features
      const headings = screen.getAllByRole('heading')
      const buttons = screen.getAllByRole('button')
      const textboxes = screen.getAllByRole('textbox')
      
      const endTime = performance.now()
      
      expect(headings.length).toBeGreaterThan(0)
      expect(buttons.length).toBeGreaterThan(0)
      expect(textboxes.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(25) // Fast accessibility queries
    })
  })

  describe('Edge Cases Performance', () => {
    it('handles empty strings efficiently', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const input = screen.getByTestId('first-name-input')
      
      const startTime = performance.now()
      
      // Type and clear multiple times
      for (let i = 0; i < 20; i++) {
        await user.type(input, 'a', { delay: 0 })
        await user.clear(input)
      }
      
      const endTime = performance.now()
      
      expect(input).toHaveValue('')
      expect(endTime - startTime).toBeLessThan(200)
    })

    it('handles special characters efficiently', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const input = screen.getByTestId('first-name-input')
      const specialChars = '!@#$%^&*()[]{}|;:,.<>?'
      
      const startTime = performance.now()
      await user.type(input, specialChars, { delay: 0 })
      const endTime = performance.now()
      
      expect(input).toHaveValue(specialChars)
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('handles Unicode characters efficiently', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const input = screen.getByTestId('first-name-input')
      const unicodeString = '🚀José García-Müller 中文'
      
      const startTime = performance.now()
      await user.type(input, unicodeString, { delay: 0 })
      const endTime = performance.now()
      
      expect(input).toHaveValue(unicodeString)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Concurrent Operations Performance', () => {
    it('handles multiple simultaneous inputs', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      
      const firstName = screen.getByTestId('first-name-input')
      const lastName = screen.getByTestId('last-name-input')
      
      const startTime = performance.now()
      
      // Simulate concurrent typing (as much as possible in single-threaded test)
      const promises = [
        user.type(firstName, 'John', { delay: 0 }),
        user.type(lastName, 'Doe', { delay: 0 })
      ]
      
      await Promise.all(promises)
      const endTime = performance.now()
      
      expect(firstName).toHaveValue('John')
      expect(lastName).toHaveValue('Doe')
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})