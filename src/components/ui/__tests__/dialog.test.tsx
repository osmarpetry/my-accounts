import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from '../dialog'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>
}))

describe('Dialog Components', () => {
  describe('Dialog Component', () => {
    it('renders dialog when open is true', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Dialog content</DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Dialog content')).toBeInTheDocument()
    })

    it('does not render dialog when open is false', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={false} onOpenChange={mockOnOpenChange}>
          <DialogContent>Dialog content</DialogContent>
        </Dialog>
      )
      
      expect(screen.queryByText('Dialog content')).not.toBeInTheDocument()
    })

    it('calls onOpenChange when backdrop is clicked', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Dialog content</DialogContent>
        </Dialog>
      )
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-background\\/80')
      expect(backdrop).toBeInTheDocument()
      
      await user.click(backdrop!)
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('provides context to children', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Content with context</DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Content with context')).toBeInTheDocument()
    })

    it('renders backdrop with correct classes', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Dialog content</DialogContent>
        </Dialog>
      )
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-background\\/80.backdrop-blur-sm')
      expect(backdrop).toBeInTheDocument()
    })

    it('renders container with correct classes', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Dialog content</DialogContent>
        </Dialog>
      )
      
      const container = document.querySelector('.fixed.inset-0.z-50.flex.items-center.justify-center')
      expect(container).toBeInTheDocument()
    })
  })

  describe('DialogContent Component', () => {
    it('renders dialog content', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>This is dialog content</DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('This is dialog content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent className="custom-dialog">Custom styled</DialogContent>
        </Dialog>
      )
      
      const content = screen.getByText('Custom styled')
      expect(content).toHaveClass('custom-dialog')
    })

    it('renders close button with X icon', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Dialog with close button</DialogContent>
        </Dialog>
      )
      
      const closeButton = screen.getByRole('button')
      const xIcon = screen.getByTestId('x-icon')
      const srText = screen.getByText('Close')
      
      expect(closeButton).toBeInTheDocument()
      expect(xIcon).toBeInTheDocument()
      expect(srText).toBeInTheDocument()
      expect(srText).toHaveClass('sr-only')
    })

    it('calls onOpenChange when close button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Dialog content</DialogContent>
        </Dialog>
      )
      
      const closeButton = screen.getByRole('button')
      await user.click(closeButton)
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('forwards additional HTML attributes', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent 
            data-testid="custom-content"
            role="dialog"
            aria-label="Custom dialog"
          >
            Custom content
          </DialogContent>
        </Dialog>
      )
      
      const content = screen.getByTestId('custom-content')
      expect(content).toHaveAttribute('role', 'dialog')
      expect(content).toHaveAttribute('aria-label', 'Custom dialog')
    })

    it('forwards ref correctly', () => {
      const mockOnOpenChange = jest.fn()
      const ref = React.createRef<HTMLDivElement>()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent ref={ref}>Ref content</DialogContent>
        </Dialog>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Ref content')
    })

    it('throws error when used outside Dialog context', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<DialogContent>Content without context</DialogContent>)
      }).toThrow('DialogContent must be used within Dialog')
      
      consoleSpy.mockRestore()
    })

    it('has correct default classes', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Default styled content</DialogContent>
        </Dialog>
      )
      
      const content = screen.getByText('Default styled content')
      expect(content).toHaveClass('relative', 'z-50', 'grid', 'w-full', 'max-w-lg', 'gap-4', 'bg-background', 'p-6', 'shadow-card', 'duration-200', 'animate-in', 'fade-in-0', 'zoom-in-95', 'rounded-xl', 'transition-colors')
    })

    it('close button has correct classes', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Content with close button</DialogContent>
        </Dialog>
      )
      
      const closeButton = screen.getByRole('button')
      expect(closeButton).toHaveClass('absolute', 'right-4', 'top-4', 'rounded-lg', 'opacity-70', 'ring-offset-background', 'transition-opacity', 'hover:opacity-100', 'focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2', 'disabled:pointer-events-none')
    })
  })

  describe('DialogHeader Component', () => {
    it('renders dialog header', () => {
      render(<DialogHeader>Header content</DialogHeader>)
      
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<DialogHeader className="custom-header">Custom header</DialogHeader>)
      
      const header = screen.getByText('Custom header')
      expect(header).toHaveClass('custom-header')
    })

    it('has correct default classes', () => {
      render(<DialogHeader>Default header</DialogHeader>)
      
      const header = screen.getByText('Default header')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'text-center', 'sm:text-left')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <DialogHeader 
          data-testid="custom-header"
          role="banner"
        >
          Custom header
        </DialogHeader>
      )
      
      const header = screen.getByTestId('custom-header')
      expect(header).toHaveAttribute('role', 'banner')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(<DialogHeader ref={ref}>Ref header</DialogHeader>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Ref header')
    })

    it('renders as div element', () => {
      render(<DialogHeader>Header element</DialogHeader>)
      
      const header = screen.getByText('Header element')
      expect(header.tagName).toBe('DIV')
    })
  })

  describe('DialogFooter Component', () => {
    it('renders dialog footer', () => {
      render(<DialogFooter>Footer content</DialogFooter>)
      
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<DialogFooter className="custom-footer">Custom footer</DialogFooter>)
      
      const footer = screen.getByText('Custom footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('has correct default classes', () => {
      render(<DialogFooter>Default footer</DialogFooter>)
      
      const footer = screen.getByText('Default footer')
      expect(footer).toHaveClass('flex', 'flex-col-reverse', 'sm:flex-row', 'sm:justify-end', 'sm:space-x-2')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <DialogFooter 
          data-testid="custom-footer"
          role="contentinfo"
        >
          Custom footer
        </DialogFooter>
      )
      
      const footer = screen.getByTestId('custom-footer')
      expect(footer).toHaveAttribute('role', 'contentinfo')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(<DialogFooter ref={ref}>Ref footer</DialogFooter>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Ref footer')
    })

    it('renders as div element', () => {
      render(<DialogFooter>Footer element</DialogFooter>)
      
      const footer = screen.getByText('Footer element')
      expect(footer.tagName).toBe('DIV')
    })
  })

  describe('DialogTitle Component', () => {
    it('renders dialog title', () => {
      render(<DialogTitle>Title content</DialogTitle>)
      
      expect(screen.getByText('Title content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<DialogTitle className="custom-title">Custom title</DialogTitle>)
      
      const title = screen.getByText('Custom title')
      expect(title).toHaveClass('custom-title')
    })

    it('has correct default classes', () => {
      render(<DialogTitle>Default title</DialogTitle>)
      
      const title = screen.getByText('Default title')
      expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <DialogTitle 
          data-testid="custom-title"
          id="dialog-title"
        >
          Custom title
        </DialogTitle>
      )
      
      const title = screen.getByTestId('custom-title')
      expect(title).toHaveAttribute('id', 'dialog-title')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>()
      
      render(<DialogTitle ref={ref}>Ref title</DialogTitle>)
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
      expect(ref.current).toHaveTextContent('Ref title')
    })

    it('renders as h3 element', () => {
      render(<DialogTitle>Title element</DialogTitle>)
      
      const title = screen.getByText('Title element')
      expect(title.tagName).toBe('H3')
    })

    it('has correct heading role', () => {
      render(<DialogTitle>Heading title</DialogTitle>)
      
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('Heading title')
    })
  })

  describe('DialogDescription Component', () => {
    it('renders dialog description', () => {
      render(<DialogDescription>Description content</DialogDescription>)
      
      expect(screen.getByText('Description content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<DialogDescription className="custom-description">Custom description</DialogDescription>)
      
      const description = screen.getByText('Custom description')
      expect(description).toHaveClass('custom-description')
    })

    it('has correct default classes', () => {
      render(<DialogDescription>Default description</DialogDescription>)
      
      const description = screen.getByText('Default description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <DialogDescription 
          data-testid="custom-description"
          id="dialog-description"
        >
          Custom description
        </DialogDescription>
      )
      
      const description = screen.getByTestId('custom-description')
      expect(description).toHaveAttribute('id', 'dialog-description')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      
      render(<DialogDescription ref={ref}>Ref description</DialogDescription>)
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
      expect(ref.current).toHaveTextContent('Ref description')
    })

    it('renders as p element', () => {
      render(<DialogDescription>Description element</DialogDescription>)
      
      const description = screen.getByText('Description element')
      expect(description.tagName).toBe('P')
    })
  })

  describe('Complete Dialog', () => {
    it('renders complete dialog with all components', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            <div>Dialog body content</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog Description')).toBeInTheDocument()
      expect(screen.getByText('Dialog body content')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('handles dialog interactions', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Interactive Dialog</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <button onClick={() => mockOnOpenChange(false)}>Close Dialog</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      const closeButton = screen.getByText('Close Dialog')
      await user.click(closeButton)
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('handles keyboard interactions', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Dialog</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <button>Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      const actionButton = screen.getByText('Action')
      
      await user.tab()
      expect(actionButton).toHaveFocus()
      
      await user.keyboard('{Enter}')
      // Button should be clickable via keyboard
    })

    it('handles focus management', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Focus Dialog</DialogTitle>
            </DialogHeader>
            <input placeholder="First input" />
            <input placeholder="Second input" />
            <DialogFooter>
              <button>Submit</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      const firstInput = screen.getByPlaceholderText('First input')
      const secondInput = screen.getByPlaceholderText('Second input')
      const submitButton = screen.getByText('Submit')
      
      await user.tab()
      expect(firstInput).toHaveFocus()
      
      await user.tab()
      expect(secondInput).toHaveFocus()
      
      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Dialog State Management', () => {
    it('handles controlled state changes', () => {
      const mockOnOpenChange = jest.fn()
      const { rerender } = render(
        <Dialog open={false} onOpenChange={mockOnOpenChange}>
          <DialogContent>Controlled dialog</DialogContent>
        </Dialog>
      )
      
      expect(screen.queryByText('Controlled dialog')).not.toBeInTheDocument()
      
      rerender(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Controlled dialog</DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Controlled dialog')).toBeInTheDocument()
    })

    it('maintains state consistency', async () => {
      const user = userEvent.setup()
      
      const ControlledDialog = () => {
        const [open, setOpen] = React.useState(false)
        
        return (
          <div>
            <button onClick={() => setOpen(true)}>Open Dialog</button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogTitle>Controlled Dialog</DialogTitle>
                <button onClick={() => setOpen(false)}>Close Dialog</button>
              </DialogContent>
            </Dialog>
          </div>
        )
      }
      
      render(<ControlledDialog />)
      
      const openButton = screen.getByText('Open Dialog')
      await user.click(openButton)
      
      expect(screen.getByText('Controlled Dialog')).toBeInTheDocument()
      
      const closeButton = screen.getByText('Close Dialog')
      await user.click(closeButton)
      
      expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent></DialogContent>
        </Dialog>
      )
      
      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })

    it('handles multiple dialogs', () => {
      const mockOnOpenChange1 = jest.fn()
      const mockOnOpenChange2 = jest.fn()
      
      render(
        <div>
          <Dialog open={true} onOpenChange={mockOnOpenChange1}>
            <DialogContent>First dialog</DialogContent>
          </Dialog>
          <Dialog open={true} onOpenChange={mockOnOpenChange2}>
            <DialogContent>Second dialog</DialogContent>
          </Dialog>
        </div>
      )
      
      expect(screen.getByText('First dialog')).toBeInTheDocument()
      expect(screen.getByText('Second dialog')).toBeInTheDocument()
    })

    it('handles complex content', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complex Dialog</DialogTitle>
              <DialogDescription>
                This is a complex dialog with multiple elements
              </DialogDescription>
            </DialogHeader>
            <div>
              <form>
                <input type="text" placeholder="Name" />
                <input type="email" placeholder="Email" />
                <textarea placeholder="Message"></textarea>
                <select>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </form>
            </div>
            <DialogFooter>
              <button type="button">Cancel</button>
              <button type="submit">Submit</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Complex Dialog')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Message')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('handles rapid open/close', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      const { rerender } = render(
        <Dialog open={false} onOpenChange={mockOnOpenChange}>
          <DialogContent>Rapid dialog</DialogContent>
        </Dialog>
      )
      
      // Rapid state changes
      rerender(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Rapid dialog</DialogContent>
        </Dialog>
      )
      
      rerender(
        <Dialog open={false} onOpenChange={mockOnOpenChange}>
          <DialogContent>Rapid dialog</DialogContent>
        </Dialog>
      )
      
      rerender(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Rapid dialog</DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Rapid dialog')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent 
            role="dialog"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
          >
            <DialogTitle id="dialog-title">Accessible Dialog</DialogTitle>
            <DialogDescription id="dialog-description">
              This dialog is accessible
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )
      
      const content = screen.getByRole('dialog')
      expect(content).toHaveAttribute('aria-labelledby', 'dialog-title')
      expect(content).toHaveAttribute('aria-describedby', 'dialog-description')
    })

    it('has proper heading hierarchy', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Main Title</DialogTitle>
              <DialogDescription>Description text</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('Main Title')
    })

    it('close button is accessible', () => {
      const mockOnOpenChange = jest.fn()
      
      render(
        <Dialog open={true} onOpenChange={mockOnOpenChange}>
          <DialogContent>Accessible close button</DialogContent>
        </Dialog>
      )
      
      const closeButton = screen.getByRole('button')
      const srText = screen.getByText('Close')
      
      expect(closeButton).toBeInTheDocument()
      expect(srText).toHaveClass('sr-only')
    })
  })
}) 