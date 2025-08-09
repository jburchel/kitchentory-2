import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card'

describe('Card Components', () => {
  it('renders Card with proper styling', () => {
    render(<Card data-testid="card">Card Content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass(
      'rounded-lg',
      'border',
      'bg-white',
      'text-gray-950',
      'shadow-sm'
    )
  })

  it('renders CardHeader with proper styling', () => {
    render(
      <Card>
        <CardHeader data-testid="card-header">Header Content</CardHeader>
      </Card>
    )
    const header = screen.getByTestId('card-header')
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
  })

  it('renders CardTitle with proper styling', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    )
    const title = screen.getByText('Test Title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('text-2xl', 'font-semibold')
  })

  it('renders CardDescription with proper styling', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
      </Card>
    )
    const description = screen.getByText('Test Description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm', 'text-gray-500')
  })

  it('renders CardContent with proper styling', () => {
    render(
      <Card>
        <CardContent data-testid="card-content">Content</CardContent>
      </Card>
    )
    const content = screen.getByTestId('card-content')
    expect(content).toHaveClass('p-6', 'pt-0')
  })

  it('renders CardFooter with proper styling', () => {
    render(
      <Card>
        <CardFooter data-testid="card-footer">Footer</CardFooter>
      </Card>
    )
    const footer = screen.getByTestId('card-footer')
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
          <button type="button">Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description goes here')).toBeInTheDocument()
    expect(
      screen.getByText('This is the main content of the card.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})
