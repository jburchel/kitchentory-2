import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileStep } from '@/components/onboarding/ProfileStep'
import { ProfileFormData } from '@/types/onboarding'

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
  FormField: ({ label, error, required, children }: any) => (
    <div data-testid="form-field">
      <label>
        {label}
        {required && <span data-testid="required-indicator">*</span>}
      </label>
      {children}
      {error && <div data-testid="field-error" role="alert">{error}</div>}
    </div>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">UserIcon</div>,
}))

describe('ProfileStep', () => {
  const defaultData: ProfileFormData = {
    firstName: '',
    lastName: '',
  }

  const defaultErrors = {}

  const defaultNavigation = {
    canGoBack: false,
    canGoNext: false,
    isLoading: false,
    onBack: jest.fn(),
    onNext: jest.fn(),
  }

  const defaultProps = {
    data: defaultData,
    errors: defaultErrors,
    onChange: jest.fn(),
    onFieldTouch: jest.fn(),
    navigation: defaultNavigation,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the profile step with correct heading and icon', () => {
    render(<ProfileStep {...defaultProps} />)
    
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument()
    expect(screen.getByText("We'll use this information to personalize your experience")).toBeInTheDocument()
  })

  it('renders both first name and last name fields', () => {
    render(<ProfileStep {...defaultProps} />)
    
    const formFields = screen.getAllByTestId('form-field')
    expect(formFields).toHaveLength(2)
    
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByText('Last Name')).toBeInTheDocument()
  })

  it('marks both fields as required', () => {
    render(<ProfileStep {...defaultProps} />)
    
    const requiredIndicators = screen.getAllByTestId('required-indicator')
    expect(requiredIndicators).toHaveLength(2)
  })

  it('renders input fields with correct values', () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
    }

    render(<ProfileStep {...defaultProps} data={data} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).toHaveValue('John')
    expect(inputs[1]).toHaveValue('Doe')
  })

  it('renders input fields with correct placeholders', () => {
    render(<ProfileStep {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument()
  })

  it('calls onChange when first name is typed', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<ProfileStep {...defaultProps} onChange={onChange} />)
    
    const firstNameInput = screen.getByPlaceholderText('Enter your first name')
    await user.type(firstNameInput, 'Jane')
    
    expect(onChange).toHaveBeenCalledWith({ firstName: 'Jane' })
  })

  it('calls onChange when last name is typed', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<ProfileStep {...defaultProps} onChange={onChange} />)
    
    const lastNameInput = screen.getByPlaceholderText('Enter your last name')
    await user.type(lastNameInput, 'Smith')
    
    expect(onChange).toHaveBeenCalledWith({ lastName: 'Smith' })
  })

  it('calls onFieldTouch when first name field loses focus', async () => {
    const onFieldTouch = jest.fn()
    const user = userEvent.setup()

    render(<ProfileStep {...defaultProps} onFieldTouch={onFieldTouch} />)
    
    const firstNameInput = screen.getByPlaceholderText('Enter your first name')
    await user.click(firstNameInput)
    await user.tab()
    
    expect(onFieldTouch).toHaveBeenCalledWith('firstName')
  })

  it('calls onFieldTouch when last name field loses focus', async () => {
    const onFieldTouch = jest.fn()
    const user = userEvent.setup()

    render(<ProfileStep {...defaultProps} onFieldTouch={onFieldTouch} />)
    
    const lastNameInput = screen.getByPlaceholderText('Enter your last name')
    await user.click(lastNameInput)
    await user.tab()
    
    expect(onFieldTouch).toHaveBeenCalledWith('lastName')
  })

  it('displays validation error for first name', () => {
    const errors = {
      firstName: 'First name is required',
    }

    render(<ProfileStep {...defaultProps} errors={errors} />)
    
    const errorElements = screen.getAllByTestId('field-error')
    expect(errorElements[0]).toHaveTextContent('First name is required')
  })

  it('displays validation error for last name', () => {
    const errors = {
      lastName: 'Last name must be at least 2 characters',
    }

    render(<ProfileStep {...defaultProps} errors={errors} />)
    
    const errorElements = screen.getAllByTestId('field-error')
    expect(errorElements[1]).toHaveTextContent('Last name must be at least 2 characters')
  })

  it('displays multiple validation errors', () => {
    const errors = {
      firstName: 'First name is required',
      lastName: 'Last name is required',
    }

    render(<ProfileStep {...defaultProps} errors={errors} />)
    
    expect(screen.getByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
  })

  it('applies error styling to input fields when there are errors', () => {
    const errors = {
      firstName: 'First name is required',
      lastName: 'Last name is required',
    }

    render(<ProfileStep {...defaultProps} errors={errors} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-500')
    expect(inputs[1]).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-500')
  })

  it('does not apply error styling when there are no errors', () => {
    render(<ProfileStep {...defaultProps} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).not.toHaveClass('border-red-300')
    expect(inputs[1]).not.toHaveClass('border-red-300')
  })

  it('renders the helpful tip section', () => {
    render(<ProfileStep {...defaultProps} />)
    
    expect(screen.getByText('Quick tip')).toBeInTheDocument()
    expect(screen.getByText('You can always update your profile information later in your account settings.')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const data = {
      firstName: '',
      lastName: '',
    }

    render(<ProfileStep {...defaultProps} data={data} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('')
  })

  it('handles pre-filled data from user object', () => {
    const data = {
      firstName: 'Existing',
      lastName: 'User',
    }

    render(<ProfileStep {...defaultProps} data={data} />)
    
    const inputs = screen.getAllByTestId('input')
    expect(inputs[0]).toHaveValue('Existing')
    expect(inputs[1]).toHaveValue('User')
  })

  it('maintains focus management correctly', async () => {
    const user = userEvent.setup()
    render(<ProfileStep {...defaultProps} />)
    
    const firstNameInput = screen.getByPlaceholderText('Enter your first name')
    const lastNameInput = screen.getByPlaceholderText('Enter your last name')
    
    // Tab through fields
    await user.click(firstNameInput)
    expect(firstNameInput).toHaveFocus()
    
    await user.tab()
    expect(lastNameInput).toHaveFocus()
  })

  it('handles rapid typing correctly', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<ProfileStep {...defaultProps} onChange={onChange} />)
    
    const firstNameInput = screen.getByPlaceholderText('Enter your first name')
    await user.type(firstNameInput, 'Quick')
    
    // Should call onChange for each character
    expect(onChange).toHaveBeenCalledTimes(5)
    expect(onChange).toHaveBeenLastCalledWith({ firstName: 'Quick' })
  })

  it('has proper accessibility attributes', () => {
    const errors = {
      firstName: 'First name is required',
    }

    render(<ProfileStep {...defaultProps} errors={errors} />)
    
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement).toHaveTextContent('First name is required')
  })

  it('renders form fields in correct order', () => {
    render(<ProfileStep {...defaultProps} />)
    
    const formFields = screen.getAllByTestId('form-field')
    const labels = formFields.map(field => field.querySelector('label')?.textContent)
    
    expect(labels[0]).toContain('First Name')
    expect(labels[1]).toContain('Last Name')
  })
})