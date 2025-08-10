import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepNavigation } from '@/components/onboarding/StepNavigation'

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
  ArrowLeft: () => <div data-testid="arrow-left-icon">←</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">→</div>,
}))

describe('StepNavigation', () => {
  const defaultProps = {
    canGoBack: true,
    canGoNext: true,
    isLoading: false,
    onBack: jest.fn(),
    onNext: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders both back and next buttons when canGoBack is true', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons).toHaveLength(2)
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('renders only next button when canGoBack is false', () => {
    render(<StepNavigation {...defaultProps} canGoBack={false} />)
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons).toHaveLength(1)
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('renders spacer div when canGoBack is false', () => {
    render(<StepNavigation {...defaultProps} canGoBack={false} />)
    
    const container = screen.getByText('Continue').closest('div')
    expect(container?.children).toHaveLength(2) // spacer div + next button
  })

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn()
    const user = userEvent.setup()

    render(<StepNavigation {...defaultProps} onBack={onBack} />)
    
    const backButton = screen.getByText('Back')
    await user.click(backButton)
    
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when next button is clicked', async () => {
    const onNext = jest.fn()
    const user = userEvent.setup()

    render(<StepNavigation {...defaultProps} onNext={onNext} />)
    
    const nextButton = screen.getByText('Continue')
    await user.click(nextButton)
    
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('disables back button when loading', () => {
    render(<StepNavigation {...defaultProps} isLoading={true} />)
    
    const backButton = screen.getByText('Back')
    expect(backButton).toBeDisabled()
  })

  it('disables next button when canGoNext is false', () => {
    render(<StepNavigation {...defaultProps} canGoNext={false} />)
    
    const nextButton = screen.getByText('Continue')
    expect(nextButton).toBeDisabled()
  })

  it('disables next button when loading', () => {
    render(<StepNavigation {...defaultProps} isLoading={true} />)
    
    const nextButton = screen.getByText('Continue')
    expect(nextButton).toBeDisabled()
  })

  it('shows loading spinner in next button when loading', () => {
    render(<StepNavigation {...defaultProps} isLoading={true} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('data-size', 'sm')
  })

  it('uses custom next label when provided', () => {
    const customLabel = 'Finish Setup'
    render(<StepNavigation {...defaultProps} nextLabel={customLabel} />)
    
    expect(screen.getByText(customLabel)).toBeInTheDocument()
    expect(screen.queryByText('Continue')).not.toBeInTheDocument()
  })

  it('uses custom back label when provided', () => {
    const customLabel = 'Previous'
    render(<StepNavigation {...defaultProps} backLabel={customLabel} />)
    
    expect(screen.getByText(customLabel)).toBeInTheDocument()
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
  })

  it('applies outline variant to back button', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const backButton = screen.getByText('Back')
    expect(backButton).toHaveAttribute('data-variant', 'outline')
  })

  it('applies correct styling classes to buttons', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const backButton = screen.getByText('Back')
    const nextButton = screen.getByText('Continue')
    
    expect(backButton).toHaveClass('flex', 'items-center', 'space-x-2')
    expect(nextButton).toHaveClass('flex', 'items-center', 'space-x-2', 'min-w-[120px]', 'justify-center')
  })

  it('renders arrow icons correctly', () => {
    render(<StepNavigation {...defaultProps} />)
    
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument()
  })

  it('hides arrow icon when loading', () => {
    render(<StepNavigation {...defaultProps} isLoading={true} />)
    
    expect(screen.queryByTestId('arrow-right-icon')).not.toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const customClass = 'my-custom-navigation'
    render(<StepNavigation {...defaultProps} className={customClass} />)
    
    const container = screen.getByText('Back').closest('.my-custom-navigation')
    expect(container).toBeInTheDocument()
  })

  it('maintains proper layout with flexbox classes', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const container = screen.getByText('Back').closest('div')
    expect(container).toHaveClass('flex', 'items-center', 'justify-between', 'space-x-4')
  })

  it('handles rapid clicking correctly', async () => {
    const onNext = jest.fn()
    const user = userEvent.setup()

    render(<StepNavigation {...defaultProps} onNext={onNext} />)
    
    const nextButton = screen.getByText('Continue')
    
    // Click multiple times rapidly
    await user.click(nextButton)
    await user.click(nextButton)
    await user.click(nextButton)
    
    expect(onNext).toHaveBeenCalledTimes(3)
  })

  it('prevents clicks when disabled', async () => {
    const onNext = jest.fn()
    const user = userEvent.setup()

    render(<StepNavigation {...defaultProps} canGoNext={false} onNext={onNext} />)
    
    const nextButton = screen.getByText('Continue')
    await user.click(nextButton)
    
    expect(onNext).not.toHaveBeenCalled()
  })

  it('handles keyboard navigation correctly', async () => {
    const onNext = jest.fn()
    const user = userEvent.setup()

    render(<StepNavigation {...defaultProps} onNext={onNext} />)
    
    const nextButton = screen.getByText('Continue')
    nextButton.focus()
    await user.keyboard('{Enter}')
    
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('maintains consistent button heights', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const backButton = screen.getByText('Back')
    const nextButton = screen.getByText('Continue')
    
    // Both buttons should have consistent minimum width for next button
    expect(nextButton).toHaveClass('min-w-[120px]')
  })

  it('handles long custom labels correctly', () => {
    const longNextLabel = 'Continue to the Final Step of Setup Process'
    const longBackLabel = 'Return to Previous Configuration Step'
    
    render(
      <StepNavigation 
        {...defaultProps} 
        nextLabel={longNextLabel}
        backLabel={longBackLabel}
      />
    )
    
    expect(screen.getByText(longNextLabel)).toBeInTheDocument()
    expect(screen.getByText(longBackLabel)).toBeInTheDocument()
  })

  it('shows loading state correctly with custom label', () => {
    const customLabel = 'Creating Account'
    render(<StepNavigation {...defaultProps} nextLabel={customLabel} isLoading={true} />)
    
    // Should show spinner instead of custom label during loading
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryByText(customLabel)).not.toBeInTheDocument()
  })

  it('maintains accessibility standards', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button') // From Button component mock
    })
  })

  it('handles edge case with both disabled states', () => {
    render(<StepNavigation {...defaultProps} canGoNext={false} isLoading={true} />)
    
    const nextButton = screen.getByText('Continue')
    expect(nextButton).toBeDisabled()
    
    // Should not show spinner when canGoNext is false
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })

  it('maintains proper spacing with space-x-4 class', () => {
    render(<StepNavigation {...defaultProps} />)
    
    const container = screen.getByText('Back').closest('div')
    expect(container).toHaveClass('space-x-4')
  })

  it('renders correctly with minimal props', () => {
    const minimalProps = {
      canGoBack: false,
      canGoNext: true,
      onBack: jest.fn(),
      onNext: jest.fn(),
    }

    render(<StepNavigation {...minimalProps} />)
    
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })
})