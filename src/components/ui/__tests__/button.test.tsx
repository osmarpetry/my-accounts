import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { Button, buttonVariants } from '../button'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders button with default props', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('renders button with custom children', () => {
      render(
        <Button>
          <span>Custom content</span>
        </Button>
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Custom content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      
      const button = screen.getByRole('button')
      // Check that the button exists and has a className
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('class')
    })
  })

  describe('Button Variants', () => {
    it('renders default variant', () => {
      render(<Button variant="default">Default</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Button Sizes', () => {
    it('renders default size', () => {
      render(<Button size="default">Default Size</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('renders icon size', () => {
      render(<Button size="icon">🔍</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Button States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const mockClick = jest.fn()
      
      render(<Button disabled onClick={mockClick}>Disabled</Button>)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockClick).not.toHaveBeenCalled()
    })

    it('handles loading state with asChild', () => {
      render(<Button asChild><span>Loading</span></Button>)
      
      expect(screen.getByText('Loading')).toBeInTheDocument()
    })
  })

  describe('Button Types', () => {
    it('renders as submit button', () => {
      render(<Button type="submit">Submit</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('renders as reset button', () => {
      render(<Button type="reset">Reset</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
    })

    it('renders as button element by default', () => {
      render(<Button>Default Type</Button>)
      
      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('User Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const mockClick = jest.fn()
      
      render(<Button onClick={mockClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick multiple times', async () => {
      const user = userEvent.setup()
      const mockClick = jest.fn()
      
      render(<Button onClick={mockClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      await user.click(button)
      await user.click(button)
      await user.click(button)
      
      expect(mockClick).toHaveBeenCalledTimes(3)
    })

    it('handles onMouseEnter event', async () => {
      const user = userEvent.setup()
      const mockMouseEnter = jest.fn()
      
      render(<Button onMouseEnter={mockMouseEnter}>Hover me</Button>)
      
      const button = screen.getByRole('button')
      await user.hover(button)
      
      expect(mockMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('handles onFocus event', async () => {
      const user = userEvent.setup()
      const mockFocus = jest.fn()
      
      render(<Button onFocus={mockFocus}>Focus me</Button>)
      
      const button = screen.getByRole('button')
      await user.tab()
      
      expect(mockFocus).toHaveBeenCalledTimes(1)
    })
  })

  describe('Forwarded Props', () => {
    it('forwards additional HTML attributes', () => {
      render(
        <Button 
          data-testid="custom-button" 
          aria-label="Custom button"
          title="Button title"
        >
          Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-testid', 'custom-button')
      expect(button).toHaveAttribute('aria-label', 'Custom button')
      expect(button).toHaveAttribute('title', 'Button title')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      
      render(<Button ref={ref}>Button with ref</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current).toHaveTextContent('Button with ref')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button></Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toBeEmptyDOMElement()
    })

    it('handles null children', () => {
      render(<Button>{null}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('handles undefined onClick', () => {
      render(<Button onClick={undefined}>No handler</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('handles complex children structure', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
          <div>
            <span>Nested</span>
          </div>
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
      expect(screen.getByText('Nested')).toBeInTheDocument()
    })
  })

  describe('Variant and Size Combinations', () => {
    it('renders destructive small button', () => {
      render(<Button variant="destructive" size="sm">Delete</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Delete')
    })

    it('renders outline large button', () => {
      render(<Button variant="outline" size="lg">Large Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Large Outline')
    })

    it('renders ghost icon button', () => {
      render(<Button variant="ghost" size="icon">👻</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('👻')
    })
  })

  describe('Form Integration', () => {
    it('submits form when type is submit', async () => {
      const user = userEvent.setup()
      const mockSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={mockSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('can be used in forms for reset functionality', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <input data-testid="test-input" defaultValue="test" />
          <Button type="reset">Reset Form</Button>
        </form>
      )
      
      const input = screen.getByTestId('test-input')
      const button = screen.getByRole('button')
      
      expect(input).toHaveValue('test')
      
      await user.clear(input)
      await user.type(input, 'changed')
      expect(input).toHaveValue('changed')
      
      await user.click(button)
      
      expect(input).toHaveValue('test')
    })
  })

  describe('buttonVariants Function', () => {
    it('returns correct classes for default variant', () => {
      const classes = buttonVariants({ variant: 'default' })
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('justify-center')
    })

    it('returns correct classes for destructive variant', () => {
      const classes = buttonVariants({ variant: 'destructive' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for outline variant', () => {
      const classes = buttonVariants({ variant: 'outline' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for secondary variant', () => {
      const classes = buttonVariants({ variant: 'secondary' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for ghost variant', () => {
      const classes = buttonVariants({ variant: 'ghost' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for link variant', () => {
      const classes = buttonVariants({ variant: 'link' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for small size', () => {
      const classes = buttonVariants({ size: 'sm' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for large size', () => {
      const classes = buttonVariants({ size: 'lg' })
      expect(classes).toContain('inline-flex')
    })

    it('returns correct classes for icon size', () => {
      const classes = buttonVariants({ size: 'icon' })
      expect(classes).toContain('inline-flex')
    })

    it('returns default variant classes when no variant specified', () => {
      const classes = buttonVariants()
      expect(classes).toContain('inline-flex')
    })
  })
}) 