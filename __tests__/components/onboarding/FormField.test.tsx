import { render, screen } from '@testing-library/react'
import { FormField } from '@/components/onboarding/FormField'

// Mock components
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => (
    <label className={className} data-testid="label">{children}</label>
  ),
}))

describe('FormField', () => {
  const defaultProps = {
    label: 'Test Field',
    children: <input data-testid="test-input" />,
  }

  it('renders label with correct text', () => {
    render(<FormField {...defaultProps} />)
    
    expect(screen.getByTestId('label')).toHaveTextContent('Test Field')
  })

  it('renders children component', () => {
    render(<FormField {...defaultProps} />)
    
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
  })

  it('shows required indicator when required is true', () => {
    render(<FormField {...defaultProps} required={true} />)
    
    const requiredIndicator = screen.getByText('*')
    expect(requiredIndicator).toBeInTheDocument()
    expect(requiredIndicator).toHaveClass('text-red-500', 'ml-1')
  })

  it('does not show required indicator when required is false', () => {
    render(<FormField {...defaultProps} required={false} />)
    
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('does not show required indicator by default', () => {
    render(<FormField {...defaultProps} />)
    
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('displays error message when error is provided', () => {
    const error = 'This field is required'
    render(<FormField {...defaultProps} error={error} />)
    
    const errorMessage = screen.getByText(error)
    expect(errorMessage).toBeInTheDocument()
    const errorContainer = errorMessage.closest('p')
    expect(errorContainer).toHaveClass('text-sm', 'text-red-600', 'flex', 'items-start', 'space-x-1')
  })

  it('displays error icon when error is provided', () => {
    const error = 'This field is required'
    render(<FormField {...defaultProps} error={error} />)
    
    const errorContainer = screen.getByText(error).closest('p')
    const errorIcon = errorContainer?.querySelector('svg')
    expect(errorIcon).toBeInTheDocument()
    expect(errorIcon).toHaveClass('w-4', 'h-4', 'mt-0.5', 'flex-shrink-0')
  })

  it('applies error styling to label when error is present', () => {
    const error = 'This field is required'
    render(<FormField {...defaultProps} error={error} />)
    
    const label = screen.getByTestId('label')
    expect(label).toHaveClass('text-red-600')
  })

  it('displays help text when provided and no error', () => {
    const helpText = 'This is helpful information'
    render(<FormField {...defaultProps} helpText={helpText} />)
    
    const helpMessage = screen.getByText(helpText)
    expect(helpMessage).toBeInTheDocument()
    expect(helpMessage).toHaveClass('text-sm', 'text-gray-500')
  })

  it('hides help text when error is present', () => {
    const helpText = 'This is helpful information'
    const error = 'This field is required'
    
    render(<FormField {...defaultProps} helpText={helpText} error={error} />)
    
    expect(screen.getByText(error)).toBeInTheDocument()
    expect(screen.queryByText(helpText)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-form-field'
    render(<FormField {...defaultProps} className={customClass} />)
    
    const container = screen.getByText('Test Field').closest(`.${customClass}`)
    expect(container).toBeInTheDocument()
  })

  it('has proper spacing with space-y-2 class', () => {
    render(<FormField {...defaultProps} />)
    
    const container = screen.getByText('Test Field').closest('div')
    expect(container).toHaveClass('space-y-2')
  })

  it('maintains proper label styling by default', () => {
    render(<FormField {...defaultProps} />)
    
    const label = screen.getByTestId('label')
    expect(label).toHaveClass('text-sm', 'font-medium', 'text-gray-900')
  })

  it('renders multiple children correctly', () => {
    const multipleChildren = (
      <>
        <input data-testid="input1" />
        <select data-testid="select1">
          <option>Option 1</option>
        </select>
      </>
    )

    render(<FormField {...defaultProps}>{multipleChildren}</FormField>)
    
    expect(screen.getByTestId('input1')).toBeInTheDocument()
    expect(screen.getByTestId('select1')).toBeInTheDocument()
  })

  it('handles long error messages correctly', () => {
    const longError = 'This is a very long error message that might wrap to multiple lines and should still be displayed correctly with proper styling and spacing'
    
    render(<FormField {...defaultProps} error={longError} />)
    
    expect(screen.getByText(longError)).toBeInTheDocument()
  })

  it('handles long help text correctly', () => {
    const longHelpText = 'This is a very long help text that provides detailed information about the field and might wrap to multiple lines but should still maintain proper formatting'
    
    render(<FormField {...defaultProps} helpText={longHelpText} />)
    
    expect(screen.getByText(longHelpText)).toBeInTheDocument()
  })

  it('handles empty label gracefully', () => {
    render(<FormField {...defaultProps} label="" />)
    
    const label = screen.getByTestId('label')
    expect(label).toHaveTextContent('')
  })

  it('handles special characters in label', () => {
    const specialLabel = 'Email Address (Optional) *'
    render(<FormField {...defaultProps} label={specialLabel} />)
    
    expect(screen.getByText(specialLabel)).toBeInTheDocument()
  })

  it('handles special characters in error message', () => {
    const specialError = 'Invalid format: use name@domain.com'
    render(<FormField {...defaultProps} error={specialError} />)
    
    expect(screen.getByText(specialError)).toBeInTheDocument()
  })

  it('handles special characters in help text', () => {
    const specialHelpText = 'Format: name@domain.com (case-sensitive)'
    render(<FormField {...defaultProps} helpText={specialHelpText} />)
    
    expect(screen.getByText(specialHelpText)).toBeInTheDocument()
  })

  it('renders with correct DOM structure', () => {
    render(<FormField {...defaultProps} />)
    
    const container = screen.getByText('Test Field').closest('div')
    const label = screen.getByTestId('label')
    const input = screen.getByTestId('test-input')
    
    expect(container).toContainElement(label)
    expect(container).toContainElement(input)
  })

  it('maintains proper element order', () => {
    const error = 'Error message'
    const helpText = 'Help text'
    
    render(<FormField {...defaultProps} error={error} helpText={helpText} />)
    
    const container = screen.getByText('Test Field').closest('div')
    const children = Array.from(container?.children || [])
    
    // Should be: label, input, error (help text is hidden due to error)
    expect(children).toHaveLength(3)
    expect(children[0]).toContainElement(screen.getByTestId('label'))
    expect(children[1]).toContainElement(screen.getByTestId('test-input'))
    expect(children[2]).toHaveTextContent(error)
  })

  it('handles empty error string', () => {
    render(<FormField {...defaultProps} error="" />)
    
    // Empty error should not be displayed - check for error element
    expect(screen.queryByTestId('field-error')).not.toBeInTheDocument()
  })

  it('handles empty help text string', () => {
    render(<FormField {...defaultProps} helpText="" />)
    
    // Empty help text should not be displayed - check for help text element
    expect(screen.queryByTestId('help-text')).not.toBeInTheDocument()
  })

  it('combines custom className with default classes', () => {
    const customClass = 'my-custom-spacing'
    render(<FormField {...defaultProps} className={customClass} />)
    
    const container = screen.getByText('Test Field').closest('div')
    expect(container).toHaveClass('space-y-2', customClass)
  })

  it('handles complex children with nested elements', () => {
    const complexChildren = (
      <div data-testid="complex-child">
        <input data-testid="nested-input" />
        <span data-testid="nested-span">Additional text</span>
      </div>
    )

    render(<FormField {...defaultProps}>{complexChildren}</FormField>)
    
    expect(screen.getByTestId('complex-child')).toBeInTheDocument()
    expect(screen.getByTestId('nested-input')).toBeInTheDocument()
    expect(screen.getByTestId('nested-span')).toBeInTheDocument()
  })
})