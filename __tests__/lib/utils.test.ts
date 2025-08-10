import { cn, formatCurrency, slugify } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (classnames utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('bg-red-500', 'text-white', 'p-4')
      expect(result).toBe('bg-red-500 text-white p-4')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class active-class')
    })

    it('handles Tailwind conflicts correctly', () => {
      const result = cn('bg-red-500', 'bg-blue-500')
      expect(result).toBe('bg-blue-500')
    })

    it('filters out falsy values', () => {
      const result = cn('valid-class', null, undefined, false, 'another-valid')
      expect(result).toBe('valid-class another-valid')
    })
  })

  describe('formatCurrency', () => {
    it('formats positive amounts correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0.99)).toBe('$0.99')
      expect(formatCurrency(1000)).toBe('$1,000.00')
    })

    it('formats negative amounts correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
      expect(formatCurrency(-0.5)).toBe('-$0.50')
    })

    it('handles zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('handles very large numbers', () => {
      expect(formatCurrency(1000000.5)).toBe('$1,000,000.50')
    })

    it('rounds to two decimal places', () => {
      expect(formatCurrency(1.999)).toBe('$2.00')
      expect(formatCurrency(1.234)).toBe('$1.23')
    })
  })

  describe('slugify', () => {
    it('converts text to lowercase slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('UPPERCASE TEXT')).toBe('uppercase-text')
    })

    it('replaces spaces with hyphens', () => {
      expect(slugify('Multiple   Spaces   Here')).toBe('multiple-spaces-here')
      expect(slugify('Single Space')).toBe('single-space')
    })

    it('removes special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world')
      expect(slugify('Text@#$%^&*()With{}[]Special')).toBe('textwithspecial')
    })

    it('handles mixed cases', () => {
      expect(slugify('CamelCase Text!')).toBe('camelcase-text')
      expect(slugify('Mixed-CASE_text@123')).toBe('mixedcase_text123')
    })

    it('handles empty strings', () => {
      expect(slugify('')).toBe('')
    })

    it('handles strings with only special characters', () => {
      expect(slugify('!@#$%^&*()')).toBe('')
    })

    it('preserves numbers and letters', () => {
      expect(slugify('Product 123 Version 2.0')).toBe('product-123-version-20')
    })
  })
})
