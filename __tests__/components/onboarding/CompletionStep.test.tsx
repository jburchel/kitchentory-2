import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompletionStep } from '@/components/onboarding/CompletionStep'
import { OnboardingFormData } from '@/types/onboarding'

// Mock components
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

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircleIcon</div>,
}))

describe('CompletionStep', () => {
  const defaultData: OnboardingFormData = {
    profile: { firstName: 'John', lastName: 'Doe' },
    household: { name: 'Doe Family Kitchen', description: 'Our family kitchen', type: 'family' },
    settings: { currency: 'USD', defaultUnit: 'pieces', expirationWarningDays: 7, allowGuestView: false },
    invitations: [
      { email: 'jane@example.com', role: 'member', message: 'Welcome!' },
    ],
  }

  const defaultProps = {
    data: defaultData,
    isLoading: false,
    error: null,
    success: false,
    onSubmit: jest.fn(),
    onBack: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the completion step with correct heading and icon (not success)', () => {
    render(<CompletionStep {...defaultProps} />)
    
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
    expect(screen.getByText('Ready to get started!')).toBeInTheDocument()
    expect(screen.getByText('Review your setup and create your household')).toBeInTheDocument()
  })

  it('renders submit and back buttons when not in success state', () => {
    render(<CompletionStep {...defaultProps} />)
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons).toHaveLength(2)
    
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.getByText('Create household')).toBeInTheDocument()
  })

  it('calls onSubmit when submit button is clicked', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()

    render(<CompletionStep {...defaultProps} onSubmit={onSubmit} />)
    
    const submitButton = screen.getByText('Create household')
    await user.click(submitButton)
    
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn()
    const user = userEvent.setup()

    render(<CompletionStep {...defaultProps} onBack={onBack} />)
    
    const backButton = screen.getByText('Back')
    await user.click(backButton)
    
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows loading state correctly', () => {
    render(<CompletionStep {...defaultProps} isLoading={true} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText('Creating...')).toBeInTheDocument()
    
    const submitButton = screen.getByText('Creating...')
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when loading', () => {
    render(<CompletionStep {...defaultProps} isLoading={true} />)
    
    const submitButton = screen.getByText('Creating...')
    expect(submitButton).toBeDisabled()
  })

  it('does not disable back button when loading', () => {
    render(<CompletionStep {...defaultProps} isLoading={true} />)
    
    const backButton = screen.getByText('Back')
    expect(backButton).not.toBeDisabled()
  })

  it('displays error message when error is present', () => {
    const error = 'Failed to create household'
    
    render(<CompletionStep {...defaultProps} error={error} />)
    
    expect(screen.getByText('Setup Error')).toBeInTheDocument()
    expect(screen.getByText(error)).toBeInTheDocument()
    
    // Should show error styling
    const errorContainer = screen.getByText('Setup Error').closest('div')
    expect(errorContainer).toHaveClass('bg-red-50', 'border', 'border-red-200')
  })

  it('shows success state when success is true', () => {
    render(<CompletionStep {...defaultProps} success={true} />)
    
    expect(screen.getByText('Welcome to Kitchentory!')).toBeInTheDocument()
    expect(screen.getByText('Your household has been created successfully.')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to your dashboard...')).toBeInTheDocument()
  })

  it('shows loading spinner in success state redirect message', () => {
    render(<CompletionStep {...defaultProps} success={true} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('data-size', 'sm')
  })

  it('does not show buttons in success state', () => {
    render(<CompletionStep {...defaultProps} success={true} />)
    
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
    expect(screen.queryByText('Create household')).not.toBeInTheDocument()
  })

  it('uses different icon styling for success state', () => {
    render(<CompletionStep {...defaultProps} success={true} />)
    
    const iconContainer = screen.getByTestId('check-circle-icon').closest('div')
    expect(iconContainer).toHaveClass('w-20', 'h-20', 'bg-green-100')
  })

  it('handles both error and loading states simultaneously', () => {
    const error = 'Network error occurred'
    
    render(<CompletionStep {...defaultProps} error={error} isLoading={true} />)
    
    expect(screen.getByText('Setup Error')).toBeInTheDocument()
    expect(screen.getByText(error)).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders proper button variants', () => {
    render(<CompletionStep {...defaultProps} />)
    
    const buttons = screen.getAllByTestId('button')
    const backButton = buttons.find(btn => btn.textContent === 'Back')
    const submitButton = buttons.find(btn => btn.textContent === 'Create household')
    
    expect(backButton).toHaveAttribute('data-variant', 'outline')
    expect(submitButton).not.toHaveAttribute('data-variant', 'outline')
  })

  it('applies correct styling classes to buttons', () => {
    render(<CompletionStep {...defaultProps} />)
    
    const submitButton = screen.getByText('Create household')
    expect(submitButton).toHaveClass('flex', 'items-center', 'space-x-2', 'min-w-[140px]', 'justify-center')
  })

  it('handles long error messages correctly', () => {
    const longError = 'A'.repeat(200)
    
    render(<CompletionStep {...defaultProps} error={longError} />)
    
    expect(screen.getByText(longError)).toBeInTheDocument()
  })

  it('handles empty data object gracefully', () => {
    const emptyData = {
      profile: { firstName: '', lastName: '' },
      household: { name: '', description: '', type: 'family' as const },
      settings: { currency: 'USD', defaultUnit: 'pieces', expirationWarningDays: 7, allowGuestView: false },
      invitations: [],
    }

    render(<CompletionStep {...defaultProps} data={emptyData} />)
    
    // Component should render without errors
    expect(screen.getByText('Ready to get started!')).toBeInTheDocument()
  })

  it('maintains proper spacing and layout', () => {
    render(<CompletionStep {...defaultProps} />)
    
    const mainContainer = screen.getByText('Ready to get started!').closest('div')
    expect(mainContainer).toHaveClass('space-y-6')
  })

  it('has proper accessibility for error messages', () => {
    const error = 'Critical error occurred'
    
    render(<CompletionStep {...defaultProps} error={error} />)
    
    // Error icon should be present for accessibility
    const errorIcon = screen.getByText('Setup Error').closest('div')?.querySelector('svg')
    expect(errorIcon).toBeInTheDocument()
  })

  it('handles rapid clicking of submit button', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()

    render(<CompletionStep {...defaultProps} onSubmit={onSubmit} />)
    
    const submitButton = screen.getByText('Create household')
    
    // Click multiple times rapidly
    await user.click(submitButton)
    await user.click(submitButton)
    await user.click(submitButton)
    
    // Should be able to handle multiple clicks
    expect(onSubmit).toHaveBeenCalledTimes(3)
  })

  it('maintains consistent step styling with other components', () => {
    render(<CompletionStep {...defaultProps} />)
    
    // Check for consistent header styling
    const headerSection = screen.getByText('Ready to get started!').closest('div')
    expect(headerSection).toHaveClass('text-center')
    
    // Check for consistent icon container
    const iconContainer = screen.getByTestId('check-circle-icon').closest('div')
    expect(iconContainer).toHaveClass('w-16', 'h-16', 'bg-primary-100', 'rounded-full')
  })

  it('renders different heading sizes for different states', () => {
    const { rerender } = render(<CompletionStep {...defaultProps} />)
    
    let heading = screen.getByText('Ready to get started!')
    expect(heading.tagName).toBe('H2')
    
    rerender(<CompletionStep {...defaultProps} success={true} />)
    
    heading = screen.getByText('Welcome to Kitchentory!')
    expect(heading.tagName).toBe('H2')
  })
})