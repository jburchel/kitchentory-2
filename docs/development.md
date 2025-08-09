# Kitchentory Development Guide

## Overview

Kitchentory is a modern Next.js application built with TypeScript, React, and Tailwind CSS. This guide covers the complete development environment setup and workflow.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom components with Radix UI primitives
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js 18.17 or later
- npm 9.0 or later
- Git

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd kitchentory

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## 📁 Project Structure

```
kitchentory/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable components
│   │   └── ui/              # Base UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper utilities
├── __tests__/               # Test files
│   ├── app/                 # Page tests
│   ├── components/          # Component tests
│   └── lib/                 # Utility tests
├── public/                  # Static assets
├── docs/                    # Documentation
└── config files...
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.tsx
```

### Writing Tests

Tests are located in the `__tests__` directory and follow this structure:

- `__tests__/components/` - Component tests
- `__tests__/lib/` - Utility function tests
- `__tests__/app/` - Page and integration tests

#### Example Component Test

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders button correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Test Configuration

- **Jest Configuration**: `jest.config.js`
- **Test Setup**: `jest.setup.js`
- **Testing Library**: React Testing Library with Jest DOM matchers
- **Mocks**: Next.js router, window APIs automatically mocked

## 🎨 Code Quality

### ESLint Configuration

Our ESLint setup includes:

- Next.js recommended rules
- TypeScript strict rules
- React hooks exhaustive deps
- Testing Library rules for test files
- Prettier integration

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Prettier Configuration

Formatting rules:

- Single quotes
- No semicolons
- 2-space indentation
- Trailing commas (ES5)
- 80 character line width
- Tailwind CSS class sorting

```bash
# Check formatting
npm run prettier:check

# Format code
npm run prettier
```

### TypeScript Configuration

Strict TypeScript setup with:

- Strict null checks
- No unused locals/parameters
- No implicit returns
- Exact optional property types
- Path mapping for imports (`@/`)

```bash
# Type checking
npm run type-check
```

## 🔧 Development Workflow

### Pre-commit Hooks

Husky automatically runs on commit:

1. **lint-staged** runs on staged files:
   - ESLint with auto-fix
   - Prettier formatting
   - Type checking

2. **Commit message** validation (if configured)

### Code Style Guidelines

#### Component Structure

```tsx
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          {
            'bg-primary-600 text-white': variant === 'primary',
            'bg-gray-100 text-gray-900': variant === 'secondary',
            'border border-gray-200 bg-white': variant === 'outline',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-11 px-6 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button }
```

#### Import Order

1. React and React-related imports
2. Third-party libraries
3. Internal components and utilities
4. Type imports (with `type` keyword)

#### File Naming

- Components: PascalCase (`Button.tsx`)
- Pages: lowercase (`page.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- Tests: match source + `.test.tsx`

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
CUSTOM_KEY=your-secret-key
```

Access in code:

```tsx
const apiUrl = process.env.NEXT_PUBLIC_APP_URL
const secretKey = process.env.CUSTOM_KEY // Server-side only
```

## 📦 Build & Deployment

### Development Build

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
```

### Production Checklist

- [ ] All tests passing
- [ ] No ESLint errors
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Build completes successfully
- [ ] Manual testing completed

## 🤝 Contributing

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following style guidelines
3. Add/update tests for new functionality
4. Ensure all checks pass locally
5. Submit PR with clear description

### Commit Messages

Follow conventional commits:

```
feat: add inventory tracking component
fix: resolve button accessibility issue
docs: update development setup guide
test: add coverage for utility functions
```

## 🐛 Troubleshooting

### Common Issues

#### Node Version Conflicts

```bash
# Check Node version
node --version
# Should be 18.17+ or 20+
```

#### Dependency Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test with verbose output
npm test Button.test.tsx -- --verbose
```

#### TypeScript Errors

```bash
# Restart TypeScript language server in VS Code
Cmd+Shift+P > "TypeScript: Restart TS Server"

# Clear TypeScript cache
rm -rf .next tsconfig.tsbuildinfo
```

### Development Tools

#### Recommended VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer

#### Browser DevTools

- React Developer Tools
- Tailwind CSS DevTools (if available)
- Lighthouse for performance auditing

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)

## 🔄 Updates

This guide is updated regularly. Last updated: January 2024

For questions or improvements to this guide, please create an issue or submit a PR.
