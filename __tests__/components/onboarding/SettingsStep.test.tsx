import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsStep } from '@/components/onboarding/SettingsStep'
import { HouseholdSettingsData } from '@/types/onboarding'

// Mock components
jest.mock('@/components/ui/input', () => ({
  Input: ({ type, min, max, value, onChange, placeholder, ...props }: any) => (
    <input
      data-testid="input"
      type={type}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}))

jest.mock('@/components/onboarding/FormField', () => ({
  FormField: ({ label, error, helpText, children }: any) => (
    <div data-testid="form-field">
      <label>{label}</label>
      {children}
      {error && <div data-testid="field-error" role="alert">{error}</div>}
      {helpText && !error && <div data-testid="help-text">{helpText}</div>}
    </div>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon">SettingsIcon</div>,
}))

describe('SettingsStep', () => {
  const defaultData: HouseholdSettingsData = {
    currency: 'USD',
    defaultUnit: 'pieces',
    expirationWarningDays: 7,
    allowGuestView: false,
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

  it('renders the settings step with correct heading and icon', () => {
    render(<SettingsStep {...defaultProps} />)
    
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    expect(screen.getByText('Configure your preferences')).toBeInTheDocument()
    expect(screen.getByText('These settings help us provide a personalized experience')).toBeInTheDocument()
  })

  it('renders currency field with default value', () => {
    render(<SettingsStep {...defaultProps} />)
    
    expect(screen.getByText('Currency')).toBeInTheDocument()
    
    const currencySelect = screen.getByDisplayValue('US Dollar ($)')
    expect(currencySelect).toBeInTheDocument()
    expect(currencySelect).toHaveValue('USD')
  })

  it('renders currency options correctly', () => {
    render(<SettingsStep {...defaultProps} />)
    
    const currencySelect = screen.getByDisplayValue('US Dollar ($)')
    expect(currencySelect.querySelectorAll('option')).toHaveLength(3)
    
    expect(screen.getByText('US Dollar ($)')).toBeInTheDocument()
    expect(screen.getByText('Euro (€)')).toBeInTheDocument()
    expect(screen.getByText('British Pound (£)')).toBeInTheDocument()
  })

  it('renders expiration warning field with default value', () => {
    render(<SettingsStep {...defaultProps} />)
    
    expect(screen.getByText('Expiration Warning')).toBeInTheDocument()
    
    const warningInput = screen.getByTestId('input')
    expect(warningInput).toHaveValue(7)
    expect(warningInput).toHaveAttribute('type', 'number')
    expect(warningInput).toHaveAttribute('min', '1')
    expect(warningInput).toHaveAttribute('max', '365')
  })

  it('shows helpful text for both fields', () => {
    render(<SettingsStep {...defaultProps} />)
    
    expect(screen.getByText('Used for tracking food costs and budgets')).toBeInTheDocument()
    expect(screen.getByText('How many days before expiration should we warn you?')).toBeInTheDocument()
  })

  it('calls onChange when currency is changed', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onChange={onChange} />)
    
    const currencySelect = screen.getByDisplayValue('US Dollar ($)')
    await user.selectOptions(currencySelect, 'EUR')
    
    expect(onChange).toHaveBeenCalledWith({ currency: 'EUR' })
  })

  it('calls onFieldTouch when currency is changed', async () => {
    const onFieldTouch = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onFieldTouch={onFieldTouch} />)
    
    const currencySelect = screen.getByDisplayValue('US Dollar ($)')
    await user.selectOptions(currencySelect, 'GBP')
    
    expect(onFieldTouch).toHaveBeenCalledWith('currency')
  })

  it('calls onChange when expiration warning days is changed', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onChange={onChange} />)
    
    const warningInput = screen.getByTestId('input')
    await user.clear(warningInput)
    await user.type(warningInput, '14')
    
    expect(onChange).toHaveBeenCalledWith({ expirationWarningDays: 14 })
  })

  it('calls onFieldTouch when expiration warning field is changed', async () => {
    const onFieldTouch = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onFieldTouch={onFieldTouch} />)
    
    const warningInput = screen.getByTestId('input')
    await user.clear(warningInput)
    await user.type(warningInput, '10')
    
    expect(onFieldTouch).toHaveBeenCalledWith('expirationWarningDays')
  })

  it('displays validation error for currency', () => {
    const errors = {
      currency: 'Invalid currency selected',
    }

    render(<SettingsStep {...defaultProps} errors={errors} />)
    
    const errorElements = screen.getAllByTestId('field-error')
    expect(errorElements[0]).toHaveTextContent('Invalid currency selected')
  })

  it('displays validation error for expiration warning days', () => {
    const errors = {
      expirationWarningDays: 'Must be between 1 and 365 days',
    }

    render(<SettingsStep {...defaultProps} errors={errors} />)
    
    const errorElements = screen.getAllByTestId('field-error')
    expect(errorElements[1]).toHaveTextContent('Must be between 1 and 365 days')
  })

  it('displays multiple validation errors', () => {
    const errors = {
      currency: 'Invalid currency',
      expirationWarningDays: 'Invalid number of days',
    }

    render(<SettingsStep {...defaultProps} errors={errors} />)
    
    expect(screen.getByText('Invalid currency')).toBeInTheDocument()
    expect(screen.getByText('Invalid number of days')).toBeInTheDocument()
  })

  it('renders the informational panel', () => {
    render(<SettingsStep {...defaultProps} />)
    
    expect(screen.getByText("Don't worry!")).toBeInTheDocument()
    expect(screen.getByText(/You can change all of these settings at any time/)).toBeInTheDocument()
  })

  it('handles different currency values correctly', () => {
    const data = {
      ...defaultData,
      currency: 'EUR',
    }

    render(<SettingsStep {...defaultProps} data={data} />)
    
    const currencySelect = screen.getByDisplayValue('Euro (€)')
    expect(currencySelect).toHaveValue('EUR')
  })

  it('handles different expiration warning values correctly', () => {
    const data = {
      ...defaultData,
      expirationWarningDays: 30,
    }

    render(<SettingsStep {...defaultProps} data={data} />)
    
    const warningInput = screen.getByTestId('input')
    expect(warningInput).toHaveValue(30)
  })

  it('handles boundary values for expiration warning', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onChange={onChange} />)
    
    const warningInput = screen.getByTestId('input')
    
    // Test minimum value
    await user.clear(warningInput)
    await user.type(warningInput, '1')
    expect(onChange).toHaveBeenCalledWith({ expirationWarningDays: 1 })
    
    // Test maximum value
    await user.clear(warningInput)
    await user.type(warningInput, '365')
    expect(onChange).toHaveBeenCalledWith({ expirationWarningDays: 365 })
  })

  it('handles invalid numeric input gracefully', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onChange={onChange} />)
    
    const warningInput = screen.getByTestId('input')
    await user.clear(warningInput)
    await user.type(warningInput, 'invalid')
    
    // onChange should not be called for invalid numeric input
    expect(onChange).not.toHaveBeenCalledWith({ expirationWarningDays: 'invalid' })
  })

  it('handles zero and negative values correctly', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onChange={onChange} />)
    
    const warningInput = screen.getByTestId('input')
    
    // Test zero value
    await user.clear(warningInput)
    await user.type(warningInput, '0')
    expect(onChange).toHaveBeenCalledWith({ expirationWarningDays: 0 })
    
    // Test negative value
    await user.clear(warningInput)
    await user.type(warningInput, '-5')
    expect(onChange).toHaveBeenCalledWith({ expirationWarningDays: -5 })
  })

  it('handles decimal values correctly', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onChange={onChange} />)
    
    const warningInput = screen.getByTestId('input')
    await user.clear(warningInput)
    await user.type(warningInput, '7.5')
    
    // parseInt should convert decimal to integer
    expect(onChange).toHaveBeenCalledWith({ expirationWarningDays: 7 })
  })

  it('maintains correct field structure', () => {
    render(<SettingsStep {...defaultProps} />)
    
    const formFields = screen.getAllByTestId('form-field')
    expect(formFields).toHaveLength(2)
    
    const labels = formFields.map(field => field.querySelector('label')?.textContent)
    expect(labels[0]).toContain('Currency')
    expect(labels[1]).toContain('Expiration Warning')
  })

  it('has proper accessibility attributes', () => {
    const errors = {
      currency: 'Invalid currency',
    }

    render(<SettingsStep {...defaultProps} errors={errors} />)
    
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement).toHaveTextContent('Invalid currency')
  })

  it('hides help text when error is present', () => {
    const errors = {
      currency: 'Invalid currency',
    }

    render(<SettingsStep {...defaultProps} errors={errors} />)
    
    const formFields = screen.getAllByTestId('form-field')
    const currencyField = formFields[0]
    
    expect(currencyField.querySelector('[data-testid="field-error"]')).toBeInTheDocument()
    expect(currencyField.querySelector('[data-testid="help-text"]')).not.toBeInTheDocument()
  })

  it('shows help text when no error is present', () => {
    render(<SettingsStep {...defaultProps} />)
    
    const helpTexts = screen.getAllByTestId('help-text')
    expect(helpTexts).toHaveLength(2)
    expect(helpTexts[0]).toHaveTextContent('Used for tracking food costs and budgets')
    expect(helpTexts[1]).toHaveTextContent('How many days before expiration should we warn you?')
  })

  it('handles empty expiration warning input', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onChange={onChange} />)
    
    const warningInput = screen.getByTestId('input')
    await user.clear(warningInput)
    
    // Should not call onChange for empty input (NaN)
    expect(onChange).not.toHaveBeenCalledWith({ expirationWarningDays: NaN })
  })

  it('handles large numeric values correctly', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SettingsStep {...defaultProps} onChange={onChange} />)
    
    const warningInput = screen.getByTestId('input')
    await user.clear(warningInput)
    await user.type(warningInput, '9999')
    
    expect(onChange).toHaveBeenCalledWith({ expirationWarningDays: 9999 })
  })
})