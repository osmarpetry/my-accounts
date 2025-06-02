import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { Badge, badgeVariants } from '../badge'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Badge Component', () => {
  describe('Basic Rendering', () => {
    it('renders badge with default props', () => {
      render(<Badge>Default Badge</Badge>)
      
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
    })

    it('renders badge with custom children', () => {
      render(
        <Badge>
          <span>Custom content</span>
        </Badge>
      )
      
      expect(screen.getByText('Custom content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>)
      
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('custom-class')
    })
  })

  describe('Badge Variants', () => {
    it('renders default variant', () => {
      render(<Badge variant="default">Default</Badge>)
      
      const badge = screen.getByText('Default')
      expect(badge).toBeInTheDocument()
    })

    it('renders secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      
      const badge = screen.getByText('Secondary')
      expect(badge).toBeInTheDocument()
    })

    it('renders destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      
      const badge = screen.getByText('Destructive')
      expect(badge).toBeInTheDocument()
    })

    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>)
      
      const badge = screen.getByText('Success')
      expect(badge).toBeInTheDocument()
    })

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>)
      
      const badge = screen.getByText('Warning')
      expect(badge).toBeInTheDocument()
    })

    it('renders outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      
      const badge = screen.getByText('Outline')
      expect(badge).toBeInTheDocument()
    })

    it('renders without variant (uses default)', () => {
      render(<Badge>No Variant</Badge>)
      
      const badge = screen.getByText('No Variant')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('HTML Semantics', () => {
    it('renders as div by default', () => {
      render(<Badge>Badge Text</Badge>)
      
      const badge = screen.getByText('Badge Text')
      expect(badge.tagName).toBe('DIV')
    })
  })

  describe('Content Types', () => {
    it('renders text content', () => {
      render(<Badge>Simple Text</Badge>)
      
      expect(screen.getByText('Simple Text')).toBeInTheDocument()
    })

    it('renders numeric content', () => {
      render(<Badge>{42}</Badge>)
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders React elements as children', () => {
      render(
        <Badge>
          <strong>Bold</strong> and <em>italic</em>
        </Badge>
      )
      
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByText('italic')).toBeInTheDocument()
    })

    it('renders icons with text', () => {
      render(
        <Badge>
          <span role="img" aria-label="star">⭐</span>
          Featured
        </Badge>
      )
      
      expect(screen.getByLabelText('star')).toBeInTheDocument()
      expect(screen.getByText('Featured')).toBeInTheDocument()
    })
  })

  describe('Forwarded Props', () => {
    it('forwards additional HTML attributes', () => {
      render(
        <Badge 
          data-testid="custom-badge"
          title="Badge title"
          role="status"
          aria-label="Custom badge"
        >
          Badge
        </Badge>
      )
      
      const badge = screen.getByText('Badge')
      expect(badge).toHaveAttribute('data-testid', 'custom-badge')
      expect(badge).toHaveAttribute('title', 'Badge title')
      expect(badge).toHaveAttribute('role', 'status')
      expect(badge).toHaveAttribute('aria-label', 'Custom badge')
    })

    it('forwards event handlers', () => {
      const mockClick = jest.fn()
      
      render(
        <Badge 
          onClick={mockClick}
          data-testid="clickable-badge"
        >
          Interactive Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('clickable-badge')
      
      badge.click()
      expect(mockClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles zero as children', () => {
      render(<Badge>{0}</Badge>)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles empty content gracefully', () => {
      render(<Badge data-testid="empty-badge"></Badge>)
      
      const badge = screen.getByTestId('empty-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toBeEmptyDOMElement()
    })
  })

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <Badge 
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Status Badge
        </Badge>
      )
      
      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-live', 'polite')
      expect(badge).toHaveAttribute('aria-atomic', 'true')
    })

    it('can be used as a live region', () => {
      render(
        <Badge 
          role="status"
          aria-live="assertive"
        >
          Alert Badge
        </Badge>
      )
      
      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-live', 'assertive')
    })

    it('supports screen reader text', () => {
      render(
        <Badge>
          <span className="sr-only">New notification: </span>
          5
        </Badge>
      )
      
      expect(screen.getByText('New notification:')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('Variant and Content Combinations', () => {
    it('renders destructive variant with warning content', () => {
      render(<Badge variant="destructive">Error</Badge>)
      
      const badge = screen.getByText('Error')
      expect(badge).toBeInTheDocument()
    })

    it('renders secondary variant with count', () => {
      render(<Badge variant="secondary">{99}</Badge>)
      
      const badge = screen.getByText('99')
      expect(badge).toBeInTheDocument()
    })

    it('renders outline variant with status text', () => {
      render(<Badge variant="outline">Draft</Badge>)
      
      const badge = screen.getByText('Draft')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Multiple Badges', () => {
    it('renders multiple badges correctly', () => {
      render(
        <div>
          <Badge variant="default">Tag 1</Badge>
          <Badge variant="secondary">Tag 2</Badge>
          <Badge variant="destructive">Tag 3</Badge>
        </div>
      )
      
      expect(screen.getByText('Tag 1')).toBeInTheDocument()
      expect(screen.getByText('Tag 2')).toBeInTheDocument()
      expect(screen.getByText('Tag 3')).toBeInTheDocument()
    })

    it('handles badges with same content', () => {
      render(
        <div>
          <Badge>Same</Badge>
          <Badge>Same</Badge>
        </div>
      )
      
      const badges = screen.getAllByText('Same')
      expect(badges).toHaveLength(2)
    })
  })

  describe('Complex Content', () => {
    it('handles nested components', () => {
      render(
        <Badge>
          <div>
            <span>Nested</span>
            <div>
              <span>Deep</span>
            </div>
          </div>
        </Badge>
      )
      
      expect(screen.getByText('Nested')).toBeInTheDocument()
      expect(screen.getByText('Deep')).toBeInTheDocument()
    })

    it('handles mixed content types', () => {
      render(
        <Badge>
          Text {42} <span>Element</span> {true && 'Conditional'}
        </Badge>
      )
      
      const badge = screen.getByText(/Text/)
      expect(badge).toHaveTextContent('Text 42 Element Conditional')
    })
  })

  describe('badgeVariants Function', () => {
    it('returns correct classes for default variant', () => {
      const classes = badgeVariants({ variant: 'default' })
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('rounded-full')
    })

    it('returns correct classes for secondary variant', () => {
      const classes = badgeVariants({ variant: 'secondary' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for destructive variant', () => {
      const classes = badgeVariants({ variant: 'destructive' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for success variant', () => {
      const classes = badgeVariants({ variant: 'success' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for warning variant', () => {
      const classes = badgeVariants({ variant: 'warning' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for outline variant', () => {
      const classes = badgeVariants({ variant: 'outline' })
      expect(classes).toContain('inline-flex')
    })

    it('returns default variant classes when no variant specified', () => {
      const classes = badgeVariants()
      expect(classes).toContain('inline-flex')
    })
  })
}) 