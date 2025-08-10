import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import { OnboardingProgress } from '@/types/onboarding'

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon">✓</div>,
}))

describe('ProgressBar', () => {
  const defaultProgress: OnboardingProgress = {
    currentStep: 1,
    totalSteps: 5,
    steps: [
      { id: 'profile', title: 'Profile', description: 'Tell us about yourself', completed: true, current: false },
      { id: 'household', title: 'Household', description: 'Create your household', completed: false, current: true },
      { id: 'settings', title: 'Settings', description: 'Configure preferences', completed: false, current: false },
      { id: 'invitations', title: 'Invitations', description: 'Invite members', completed: false, current: false },
      { id: 'complete', title: 'Complete', description: 'Review and finish', completed: false, current: false },
    ],
  }

  const defaultProps = {
    progress: defaultProgress,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all step indicators', () => {
    render(<ProgressBar {...defaultProps} />)
    
    // Should render 5 step indicators
    const stepButtons = screen.getAllByRole('button')
    expect(stepButtons).toHaveLength(5)
  })

  it('displays step numbers correctly', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const stepButtons = screen.getAllByRole('button')
    
    // First step should show check icon (completed)
    expect(stepButtons[0].querySelector('[data-testid="check-circle-icon"]')).toBeInTheDocument()
    
    // Other steps should show numbers
    expect(stepButtons[1]).toHaveTextContent('2')
    expect(stepButtons[2]).toHaveTextContent('3')
    expect(stepButtons[3]).toHaveTextContent('4')
    expect(stepButtons[4]).toHaveTextContent('5')
  })

  it('applies correct styling to completed steps', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const completedStep = screen.getAllByRole('button')[0]
    expect(completedStep).toHaveClass('bg-green-600', 'text-white')
  })

  it('applies correct styling to current step', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const currentStep = screen.getAllByRole('button')[1]
    expect(currentStep).toHaveClass('bg-primary-600', 'text-white', 'shadow-md')
  })

  it('applies correct styling to future steps', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const futureStep = screen.getAllByRole('button')[2]
    expect(futureStep).toHaveClass('bg-gray-200', 'text-gray-500')
  })

  it('renders connector lines between steps', () => {
    render(<ProgressBar {...defaultProps} />)
    
    // Should have 4 connector lines (between 5 steps)
    const connectors = screen.getByText('Profile').closest('div')?.parentElement?.querySelectorAll('.w-12, .w-16')
    expect(connectors?.length).toBeGreaterThan(0)
  })

  it('colors connector lines correctly based on completion status', () => {
    render(<ProgressBar {...defaultProps} />)
    
    // First connector should be green (step 1 is completed)
    const firstConnector = screen.getByText('Profile').closest('div')?.parentElement?.querySelector('.bg-green-600')
    expect(firstConnector).toBeInTheDocument()
  })

  it('displays step labels correctly', () => {
    render(<ProgressBar {...defaultProps} />)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Household')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Invitations')).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('highlights current step label', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const householdLabel = screen.getByText('Household')
    expect(householdLabel).toHaveClass('text-primary-600', 'font-medium')
  })

  it('highlights completed step label', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const profileLabel = screen.getByText('Profile')
    expect(profileLabel).toHaveClass('text-green-600')
  })

  it('renders overall progress bar', () => {
    render(<ProgressBar {...defaultProps} />)
    
    // Progress bar container
    const progressContainer = document.querySelector('.bg-gray-200.rounded-full.h-2')
    expect(progressContainer).toBeInTheDocument()
    
    // Progress fill
    const progressFill = document.querySelector('.bg-gradient-to-r.from-primary-500.to-primary-600')
    expect(progressFill).toBeInTheDocument()
  })

  it('calculates progress bar width correctly', () => {
    render(<ProgressBar {...defaultProps} />)
    
    // Current step is 1 (second step), so progress should be 1/4 = 25%
    const progressFill = document.querySelector('.bg-gradient-to-r.from-primary-500.to-primary-600')
    expect(progressFill).toHaveStyle('width: 25%')
  })

  it('displays progress text correctly', () => {
    render(<ProgressBar {...defaultProps} />)
    
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    expect(screen.getByText('25% Complete')).toBeInTheDocument()
  })

  it('handles first step correctly', () => {
    const firstStepProgress = {
      ...defaultProgress,
      currentStep: 0,
      steps: defaultProgress.steps.map((step, index) => ({
        ...step,
        completed: false,
        current: index === 0,
      })),
    }

    render(<ProgressBar progress={firstStepProgress} />)
    
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    expect(screen.getByText('0% Complete')).toBeInTheDocument()
    
    const progressFill = document.querySelector('.bg-gradient-to-r.from-primary-500.to-primary-600')
    expect(progressFill).toHaveStyle('width: 0%')
  })

  it('handles last step correctly', () => {
    const lastStepProgress = {
      ...defaultProgress,
      currentStep: 4,
      steps: defaultProgress.steps.map((step, index) => ({
        ...step,
        completed: index < 4,
        current: index === 4,
      })),
    }

    render(<ProgressBar progress={lastStepProgress} />)
    
    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument()
    expect(screen.getByText('100% Complete')).toBeInTheDocument()
    
    const progressFill = document.querySelector('.bg-gradient-to-r.from-primary-500.to-primary-600')
    expect(progressFill).toHaveStyle('width: 100%')
  })

  it('applies custom className', () => {
    const customClass = 'custom-progress-bar'
    render(<ProgressBar {...defaultProps} className={customClass} />)
    
    const container = screen.getByText('Profile').closest('.custom-progress-bar')
    expect(container).toBeInTheDocument()
  })

  it('disables step navigation by default', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const stepButtons = screen.getAllByRole('button')
    stepButtons.forEach(button => {
      expect(button).toHaveClass('cursor-default')
      expect(button).not.toHaveClass('hover:scale-105')
    })
  })

  it('enables step navigation when allowNavigation is true', () => {
    const onStepClick = jest.fn()
    render(<ProgressBar {...defaultProps} allowNavigation={true} onStepClick={onStepClick} />)
    
    const stepButtons = screen.getAllByRole('button')
    stepButtons.forEach(button => {
      expect(button).toHaveClass('hover:scale-105', 'focus:ring-2')
    })
  })

  it('calls onStepClick when navigation is enabled and step is clicked', async () => {
    const onStepClick = jest.fn()
    const user = userEvent.setup()

    render(<ProgressBar {...defaultProps} allowNavigation={true} onStepClick={onStepClick} />)
    
    const firstStep = screen.getAllByRole('button')[0]
    await user.click(firstStep)
    
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('does not call onStepClick when navigation is disabled', async () => {
    const onStepClick = jest.fn()
    const user = userEvent.setup()

    render(<ProgressBar {...defaultProps} allowNavigation={false} onStepClick={onStepClick} />)
    
    const firstStep = screen.getAllByRole('button')[0]
    await user.click(firstStep)
    
    expect(onStepClick).not.toHaveBeenCalled()
  })

  it('shows step descriptions in title attributes', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const profileLabel = screen.getByText('Profile')
    expect(profileLabel).toHaveAttribute('title', 'Tell us about yourself')
  })

  it('handles steps with long titles correctly', () => {
    const longTitleProgress = {
      ...defaultProgress,
      steps: [
        { id: 'step1', title: 'Very Long Step Title That Exceeds Normal Length', description: 'Description', completed: false, current: true },
      ],
    }

    render(<ProgressBar progress={longTitleProgress} />)
    
    const longTitle = screen.getByText('Very Long Step Title That Exceeds Normal Length')
    expect(longTitle).toHaveClass('max-w-16', 'truncate')
  })

  it('handles empty steps array gracefully', () => {
    const emptyProgress = {
      currentStep: 0,
      totalSteps: 0,
      steps: [],
    }

    render(<ProgressBar progress={emptyProgress} />)
    
    expect(screen.getByText('Step 1 of 0')).toBeInTheDocument()
  })

  it('maintains accessibility standards', () => {
    render(<ProgressBar {...defaultProps} />)
    
    const stepButtons = screen.getAllByRole('button')
    stepButtons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  it('handles focus management correctly', async () => {
    const onStepClick = jest.fn()
    const user = userEvent.setup()

    render(<ProgressBar {...defaultProps} allowNavigation={true} onStepClick={onStepClick} />)
    
    const firstStep = screen.getAllByRole('button')[0]
    await user.tab() // Focus first step
    await user.keyboard('{Enter}')
    
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('renders with consistent responsive classes', () => {
    render(<ProgressBar {...defaultProps} />)
    
    // Check for responsive connector widths
    const connectors = document.querySelectorAll('.w-12.sm\\:w-16')
    expect(connectors.length).toBeGreaterThan(0)
  })
})