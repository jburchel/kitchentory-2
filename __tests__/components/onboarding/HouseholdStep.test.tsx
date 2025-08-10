import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HouseholdStep } from '@/components/onboarding/HouseholdStep'
import { HouseholdFormData } from '@/types/onboarding'

// Mock components
jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, onBlur, placeholder, className, ...props }: any) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  ),
}))

jest.mock('@/components/onboarding/FormField', () => ({
  FormField: ({ label, error, required, helpText, children }: any) => (
    <div data-testid="form-field">
      <label>
        {label}
        {required && <span data-testid="required-indicator">*</span>}
      </label>
      {children}
      {error && <div data-testid="field-error" role="alert">{error}</div>}
      {helpText && !error && <div data-testid="help-text">{helpText}</div>}
    </div>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Home: () => <div data-testid="home-icon">HomeIcon</div>,
}))

describe('HouseholdStep', () => {
  const defaultData: HouseholdFormData = {
    name: '',
    description: '',
    type: 'family',
  }

  const defaultErrors = {}

  const defaultProps = {
    data: defaultData,
    errors: defaultErrors,
    onChange: jest.fn(),
    onFieldTouch: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the household step with correct heading and icon', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    expect(screen.getByText('Create your household')).toBeInTheDocument()
    expect(screen.getByText('Set up your kitchen management space')).toBeInTheDocument()
  })

  it('renders household name field as required', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    expect(screen.getByText('Household Name')).toBeInTheDocument()
    expect(screen.getByTestId('required-indicator')).toBeInTheDocument()
  })

  it('renders description field as optional', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    expect(screen.getByText('Description')).toBeInTheDocument()
    // Description field should not have required indicator
    const formFields = screen.getAllByTestId('form-field')
    const descriptionField = formFields[1]
    expect(descriptionField.querySelector('[data-testid="required-indicator"]')).not.toBeInTheDocument()
  })

  it('renders input fields with correct values', () => {
    const data = {
      name: 'Smith Family Kitchen',
      description: 'Our shared family kitchen',
      type: 'family' as const,
    }

    render(<HouseholdStep {...defaultProps} data={data} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).toHaveValue('Smith Family Kitchen')
    expect(inputs[1]).toHaveValue('Our shared family kitchen')
  })

  it('renders input fields with correct placeholders', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('e.g., Smith Family Kitchen, Our Home, Apartment 3B')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Family of 4 with shared cooking responsibilities')).toBeInTheDocument()
  })

  it('shows helpful text for both fields', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    expect(screen.getByText('Choose a name that helps identify your household')).toBeInTheDocument()
    expect(screen.getByText('Optional: Add a brief description of your household')).toBeInTheDocument()
  })

  it('calls onChange when household name is typed', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<HouseholdStep {...defaultProps} onChange={onChange} />)
    
    const nameInput = screen.getByPlaceholderText('e.g., Smith Family Kitchen, Our Home, Apartment 3B')
    await user.type(nameInput, 'Test Kitchen')
    
    expect(onChange).toHaveBeenCalledWith({ name: 'Test Kitchen' })
  })

  it('calls onChange when description is typed', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<HouseholdStep {...defaultProps} onChange={onChange} />)
    
    const descriptionInput = screen.getByPlaceholderText('e.g., Family of 4 with shared cooking responsibilities')
    await user.type(descriptionInput, 'Test description')
    
    expect(onChange).toHaveBeenCalledWith({ description: 'Test description' })
  })

  it('calls onFieldTouch when name field loses focus', async () => {
    const onFieldTouch = jest.fn()
    const user = userEvent.setup()

    render(<HouseholdStep {...defaultProps} onFieldTouch={onFieldTouch} />)
    
    const nameInput = screen.getByPlaceholderText('e.g., Smith Family Kitchen, Our Home, Apartment 3B')
    await user.click(nameInput)
    await user.tab()
    
    expect(onFieldTouch).toHaveBeenCalledWith('name')
  })

  it('calls onFieldTouch when description field loses focus', async () => {
    const onFieldTouch = jest.fn()
    const user = userEvent.setup()

    render(<HouseholdStep {...defaultProps} onFieldTouch={onFieldTouch} />)
    
    const descriptionInput = screen.getByPlaceholderText('e.g., Family of 4 with shared cooking responsibilities')
    await user.click(descriptionInput)
    await user.tab()
    
    expect(onFieldTouch).toHaveBeenCalledWith('description')
  })

  it('displays validation error for household name', () => {
    const errors = {
      name: 'Household name is required',
    }

    render(<HouseholdStep {...defaultProps} errors={errors} />)
    
    const errorElements = screen.getAllByTestId('field-error')
    expect(errorElements[0]).toHaveTextContent('Household name is required')
  })

  it('displays validation error for description', () => {
    const errors = {
      description: 'Description is too long',
    }

    render(<HouseholdStep {...defaultProps} errors={errors} />)
    
    const errorElements = screen.getAllByTestId('field-error')
    expect(errorElements[1]).toHaveTextContent('Description is too long')
  })

  it('displays multiple validation errors', () => {
    const errors = {
      name: 'Name is required',
      description: 'Description is too long',
    }

    render(<HouseholdStep {...defaultProps} errors={errors} />)
    
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Description is too long')).toBeInTheDocument()
  })

  it('applies error styling to input fields when there are errors', () => {
    const errors = {
      name: 'Name is required',
      description: 'Description is too long',
    }

    render(<HouseholdStep {...defaultProps} errors={errors} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-500')
    expect(inputs[1]).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-500')
  })

  it('does not apply error styling when there are no errors', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).not.toHaveClass('border-red-300')
    expect(inputs[1]).not.toHaveClass('border-red-300')
  })

  it('renders the informational panel', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    expect(screen.getByText('Why do we ask this?')).toBeInTheDocument()
    expect(screen.getByText(/Different household types have different needs/)).toBeInTheDocument()
  })

  it('handles undefined description gracefully', () => {
    const data = {
      name: 'Test Kitchen',
      description: undefined,
      type: 'family' as const,
    }

    render(<HouseholdStep {...defaultProps} data={data} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[1]).toHaveValue('') // Should show empty string, not undefined
  })

  it('handles empty data gracefully', () => {
    const data = {
      name: '',
      description: '',
      type: 'family' as const,
    }

    render(<HouseholdStep {...defaultProps} data={data} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
  })

  it('maintains focus management correctly', async () => {
    const user = userEvent.setup()
    render(<HouseholdStep {...defaultProps} />)
    
    const nameInput = screen.getByPlaceholderText('e.g., Smith Family Kitchen, Our Home, Apartment 3B')
    const descriptionInput = screen.getByPlaceholderText('e.g., Family of 4 with shared cooking responsibilities')
    
    // Tab through fields
    await user.click(nameInput)
    expect(nameInput).toHaveFocus()
    
    await user.tab()
    expect(descriptionInput).toHaveFocus()
  })

  it('handles long household names correctly', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<HouseholdStep {...defaultProps} onChange={onChange} />)
    
    const nameInput = screen.getByPlaceholderText('e.g., Smith Family Kitchen, Our Home, Apartment 3B')
    const longName = 'A'.repeat(150) // Very long name
    await user.type(nameInput, longName)
    
    expect(onChange).toHaveBeenLastCalledWith({ name: longName })
  })

  it('handles long descriptions correctly', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<HouseholdStep {...defaultProps} onChange={onChange} />)
    
    const descriptionInput = screen.getByPlaceholderText('e.g., Family of 4 with shared cooking responsibilities')
    const longDescription = 'B'.repeat(600) // Very long description
    await user.type(descriptionInput, longDescription)
    
    expect(onChange).toHaveBeenLastCalledWith({ description: longDescription })
  })

  it('has proper accessibility attributes', () => {
    const errors = {
      name: 'Name is required',
    }

    render(<HouseholdStep {...defaultProps} errors={errors} />)
    
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement).toHaveTextContent('Name is required')
  })

  it('renders form fields in correct order', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    const formFields = screen.getAllByTestId('form-field')
    const labels = formFields.map(field => field.querySelector('label')?.textContent)
    
    expect(labels[0]).toContain('Household Name')
    expect(labels[1]).toContain('Description')
  })

  it('hides help text when error is present', () => {
    const errors = {
      name: 'Name is required',
    }

    render(<HouseholdStep {...defaultProps} errors={errors} />)
    
    const formFields = screen.getAllByTestId('form-field')
    const nameField = formFields[0]
    
    // Should have error but no help text
    expect(nameField.querySelector('[data-testid="field-error"]')).toBeInTheDocument()
    expect(nameField.querySelector('[data-testid="help-text"]')).not.toBeInTheDocument()
  })

  it('shows help text when no error is present', () => {
    render(<HouseholdStep {...defaultProps} />)
    
    const helpTexts = screen.getAllByTestId('help-text')
    expect(helpTexts).toHaveLength(2)
    expect(helpTexts[0]).toHaveTextContent('Choose a name that helps identify your household')
    expect(helpTexts[1]).toHaveTextContent('Optional: Add a brief description of your household')
  })
})