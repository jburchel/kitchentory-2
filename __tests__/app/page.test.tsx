import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock the Button component to avoid complex styling tests
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

// Mock the Card component
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Welcome to Kitchentory')
  })

  it('renders the description text', () => {
    render(<HomePage />)
    const description = screen.getByText(
      /Your intelligent kitchen inventory management system/i
    )
    expect(description).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    render(<HomePage />)

    // Check for feature headings
    expect(screen.getByText('Track Inventory')).toBeInTheDocument()
    expect(screen.getByText('Plan Meals')).toBeInTheDocument()
    expect(screen.getByText('Smart Shopping')).toBeInTheDocument()
  })

  it('renders feature descriptions', () => {
    render(<HomePage />)

    expect(
      screen.getByText(
        'Monitor your ingredients and get alerts when running low'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('Create meal plans based on your available ingredients')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Generate shopping lists automatically based on your needs'
      )
    ).toBeInTheDocument()
  })

  it('renders the Get Started button', () => {
    render(<HomePage />)
    const button = screen.getByRole('button', { name: /get started/i })
    expect(button).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<HomePage />)
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
})
