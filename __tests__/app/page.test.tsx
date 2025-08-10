import { render, screen } from '@testing-library/react'
import { ClerkProvider } from '@clerk/nextjs'
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

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  ...jest.requireActual('@clerk/nextjs'),
  useUser: jest.fn(() => ({
    isSignedIn: false,
    isLoaded: true,
  })),
  ClerkProvider: ({ children }: any) => children,
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ClerkProvider
      publishableKey="pk_test_mock"
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#10B981' }
      }}
    >
      {component}
    </ClerkProvider>
  )
}

describe('HomePage', () => {
  it('renders the main heading', () => {
    renderWithProviders(<HomePage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Welcome to Kitchentory')
  })

  it('renders the description text', () => {
    renderWithProviders(<HomePage />)
    const description = screen.getByText(
      /Your intelligent kitchen inventory management system/i
    )
    expect(description).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    renderWithProviders(<HomePage />)

    // Check for feature headings
    expect(screen.getByText('Track Inventory')).toBeInTheDocument()
    expect(screen.getByText('Plan Meals')).toBeInTheDocument()
    expect(screen.getByText('Smart Shopping')).toBeInTheDocument()
  })

  it('renders feature descriptions', () => {
    renderWithProviders(<HomePage />)

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
    renderWithProviders(<HomePage />)
    const button = screen.getByRole('button', { name: /get started/i })
    expect(button).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    renderWithProviders(<HomePage />)
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
})
