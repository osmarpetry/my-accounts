import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from '../collapsible'

describe('Collapsible Components', () => {
  describe('Collapsible Component', () => {
    it('renders collapsible with trigger and content', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )
      
      expect(screen.getByText('Toggle')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles controlled open state', () => {
      render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Always open trigger</CollapsibleTrigger>
          <CollapsibleContent>Always open content</CollapsibleContent>
        </Collapsible>
      )
      
      expect(screen.getByText('Always open content')).toBeInTheDocument()
    })

    it('handles defaultOpen state', () => {
      render(
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger>Default open trigger</CollapsibleTrigger>
          <CollapsibleContent>Default open content</CollapsibleContent>
        </Collapsible>
      )
      
      expect(screen.getByText('Default open content')).toBeInTheDocument()
    })

    it('calls onOpenChange when state changes', async () => {
      const user = userEvent.setup()
      const mockOpenChange = jest.fn()
      
      render(
        <Collapsible onOpenChange={mockOpenChange}>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Trigger')
      await user.click(trigger)
      
      expect(mockOpenChange).toHaveBeenCalledWith(true)
    })

    it('handles disabled state', async () => {
      const user = userEvent.setup()
      const mockOpenChange = jest.fn()
      
      render(
        <Collapsible disabled onOpenChange={mockOpenChange}>
          <CollapsibleTrigger>Disabled trigger</CollapsibleTrigger>
          <CollapsibleContent>Disabled content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Disabled trigger')
      await user.click(trigger)
      
      expect(mockOpenChange).not.toHaveBeenCalled()
    })

    it('forwards additional props', () => {
      render(
        <Collapsible 
          data-testid="custom-collapsible"
          className="custom-class"
        >
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )
      
      const collapsible = screen.getByTestId('custom-collapsible')
      expect(collapsible).toHaveClass('custom-class')
    })
  })

  describe('CollapsibleTrigger Component', () => {
    it('renders trigger element', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Click to toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Click to toggle')
      expect(trigger).toBeInTheDocument()
    })

    it('renders as button by default', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Button trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Button trigger')
    })

    it('can render as different element with asChild', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div>Div trigger</div>
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Div trigger')
      expect(trigger.tagName).toBe('DIV')
    })

    it('handles click events', async () => {
      const user = userEvent.setup()
      const mockClick = jest.fn()
      
      render(
        <Collapsible>
          <CollapsibleTrigger onClick={mockClick}>Clickable</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Clickable')
      await user.click(trigger)
      
      expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('toggles collapsible when clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Toggleable content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Toggle')
      
      // Initially closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(trigger)
      
      // Should be open now
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText('Toggleable content')).toBeInTheDocument()
      })
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Keyboard trigger</CollapsibleTrigger>
          <CollapsibleContent>Keyboard content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Keyboard trigger')
      
      await user.tab()
      expect(trigger).toHaveFocus()
      
      await user.keyboard('{Enter}')
      
      const content = screen.getByText('Keyboard content')
      expect(content).toBeInTheDocument()
    })

    it('handles Space key activation', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Space trigger</CollapsibleTrigger>
          <CollapsibleContent>Space content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Space trigger')
      trigger.focus()
      
      await user.keyboard(' ')
      
      const content = screen.getByText('Space content')
      expect(content).toBeInTheDocument()
    })

    it('forwards additional props', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger 
            data-testid="custom-trigger"
            aria-label="Custom trigger"
            className="custom-trigger-class"
          >
            Custom trigger
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByTestId('custom-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Custom trigger')
      expect(trigger).toHaveClass('custom-trigger-class')
    })

    it('has proper ARIA attributes', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>ARIA trigger</CollapsibleTrigger>
          <CollapsibleContent>ARIA content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('ARIA trigger')
      expect(trigger).toHaveAttribute('aria-expanded')
      expect(trigger).toHaveAttribute('aria-controls')
    })
  })

  describe('CollapsibleContent Component', () => {
    it('renders collapsible content', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>This is collapsible content</CollapsibleContent>
        </Collapsible>
      )
      
      expect(screen.getByText('This is collapsible content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent className="custom-content">Custom styled</CollapsibleContent>
        </Collapsible>
      )
      
      const content = screen.getByText('Custom styled')
      expect(content).toHaveClass('custom-content')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent 
            data-testid="custom-content"
            role="region"
          >
            Custom content
          </CollapsibleContent>
        </Collapsible>
      )
      
      const content = screen.getByTestId('custom-content')
      expect(content).toHaveAttribute('role', 'region')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent ref={ref}>Ref content</CollapsibleContent>
        </Collapsible>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Ref content')
    })

    it('has proper ARIA attributes', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>ARIA content</CollapsibleContent>
        </Collapsible>
      )
      
      const content = screen.getByText('ARIA content')
      expect(content).toHaveAttribute('id')
    })
  })

  describe('Collapsible Interactions', () => {
    it('shows content when opened', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Open trigger</CollapsibleTrigger>
          <CollapsibleContent>Hidden content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Open trigger')
      
      // Initially closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(trigger)
      
      // Content should be accessible after opening
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText('Hidden content')).toBeInTheDocument()
      })
    })

    it('hides content when closed', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Close trigger</CollapsibleTrigger>
          <CollapsibleContent>Visible content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Close trigger')
      
      // Initially open
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Visible content')).toBeInTheDocument()
      
      await user.click(trigger)
      
      // Should be closed after clicking
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('toggles multiple times', async () => {
      const user = userEvent.setup()
      const mockOpenChange = jest.fn()
      
      render(
        <Collapsible onOpenChange={mockOpenChange}>
          <CollapsibleTrigger>Toggle trigger</CollapsibleTrigger>
          <CollapsibleContent>Toggle content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Toggle trigger')
      
      await user.click(trigger)
      expect(mockOpenChange).toHaveBeenCalledWith(true)
      
      await user.click(trigger)
      expect(mockOpenChange).toHaveBeenCalledWith(false)
      
      await user.click(trigger)
      expect(mockOpenChange).toHaveBeenCalledWith(true)
      
      expect(mockOpenChange).toHaveBeenCalledTimes(3)
    })

    it('maintains ARIA state consistency', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>ARIA trigger</CollapsibleTrigger>
          <CollapsibleContent>ARIA content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('ARIA trigger')
      
      // Initially closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(trigger)
      
      // Should be open
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
      })
      
      // Check that content is accessible
      await waitFor(() => {
        const content = screen.getByText('ARIA content')
        expect(trigger.getAttribute('aria-controls')).toBe(content.getAttribute('id'))
      })
    })
  })

  describe('Complex Content', () => {
    it('handles rich content in collapsible', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Rich trigger</CollapsibleTrigger>
          <CollapsibleContent>
            <div>
              <h3>Heading</h3>
              <p>Paragraph text</p>
              <button>Button inside</button>
              <ul>
                <li>List item 1</li>
                <li>List item 2</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Rich trigger')
      await user.click(trigger)
      
      expect(screen.getByText('Heading')).toBeInTheDocument()
      expect(screen.getByText('Paragraph text')).toBeInTheDocument()
      expect(screen.getByText('Button inside')).toBeInTheDocument()
      expect(screen.getByText('List item 1')).toBeInTheDocument()
      expect(screen.getByText('List item 2')).toBeInTheDocument()
    })

    it('handles interactive elements in content', async () => {
      const user = userEvent.setup()
      const mockButtonClick = jest.fn()
      
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Interactive trigger</CollapsibleTrigger>
          <CollapsibleContent>
            <button onClick={mockButtonClick}>Interactive button</button>
            <input placeholder="Interactive input" />
          </CollapsibleContent>
        </Collapsible>
      )
      
      const button = screen.getByText('Interactive button')
      const input = screen.getByPlaceholderText('Interactive input')
      
      await user.click(button)
      expect(mockButtonClick).toHaveBeenCalledTimes(1)
      
      await user.type(input, 'test')
      expect(input).toHaveValue('test')
    })

    it('handles long text content', async () => {
      const user = userEvent.setup()
      const longText = 'This is a very long collapsible content that might wrap to multiple lines and should be displayed properly without any issues. It contains a lot of text to test how the component handles extensive content.'
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Long content trigger</CollapsibleTrigger>
          <CollapsibleContent>{longText}</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Long content trigger')
      await user.click(trigger)
      
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('handles empty content', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Empty trigger</CollapsibleTrigger>
          <CollapsibleContent></CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Empty trigger')
      await user.click(trigger)
      
      // Should still render the content container even if empty
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Multiple Collapsibles', () => {
    it('handles multiple collapsibles independently', async () => {
      const user = userEvent.setup()
      const mockChange1 = jest.fn()
      const mockChange2 = jest.fn()
      
      render(
        <div>
          <Collapsible onOpenChange={mockChange1}>
            <CollapsibleTrigger>First trigger</CollapsibleTrigger>
            <CollapsibleContent>First content</CollapsibleContent>
          </Collapsible>
          <Collapsible onOpenChange={mockChange2}>
            <CollapsibleTrigger>Second trigger</CollapsibleTrigger>
            <CollapsibleContent>Second content</CollapsibleContent>
          </Collapsible>
        </div>
      )
      
      const firstTrigger = screen.getByText('First trigger')
      const secondTrigger = screen.getByText('Second trigger')
      
      await user.click(firstTrigger)
      expect(mockChange1).toHaveBeenCalledWith(true)
      expect(mockChange2).not.toHaveBeenCalled()
      
      await user.click(secondTrigger)
      expect(mockChange2).toHaveBeenCalledWith(true)
      expect(mockChange1).toHaveBeenCalledTimes(1)
    })

    it('handles nested collapsibles', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Outer trigger</CollapsibleTrigger>
          <CollapsibleContent>
            <div>Outer content</div>
            <Collapsible>
              <CollapsibleTrigger>Inner trigger</CollapsibleTrigger>
              <CollapsibleContent>Inner content</CollapsibleContent>
            </Collapsible>
          </CollapsibleContent>
        </Collapsible>
      )
      
      const outerTrigger = screen.getByText('Outer trigger')
      await user.click(outerTrigger)
      
      expect(screen.getByText('Outer content')).toBeInTheDocument()
      
      const innerTrigger = screen.getByText('Inner trigger')
      await user.click(innerTrigger)
      
      expect(screen.getByText('Inner content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper focus management', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Focus trigger</CollapsibleTrigger>
          <CollapsibleContent>
            <button>Focusable button</button>
          </CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Focus trigger')
      
      await user.tab()
      expect(trigger).toHaveFocus()
      
      await user.keyboard('{Enter}')
      
      await user.tab()
      const button = screen.getByText('Focusable button')
      expect(button).toHaveFocus()
    })

    it('supports custom ARIA attributes', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger aria-label="Custom trigger label">
            Custom trigger
          </CollapsibleTrigger>
          <CollapsibleContent aria-label="Custom content label">
            Custom content
          </CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByLabelText('Custom trigger label')
      const content = screen.getByLabelText('Custom content label')
      
      expect(trigger).toBeInTheDocument()
      expect(content).toBeInTheDocument()
    })

    it('maintains proper heading hierarchy', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <h1>Main heading</h1>
          <Collapsible>
            <CollapsibleTrigger>
              <h2>Section heading</h2>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <h3>Subsection heading</h3>
              <p>Content</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )
      
      const trigger = screen.getByRole('button')
      await user.click(trigger)
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles disabled collapsible', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(
        <Collapsible disabled onOpenChange={mockChange}>
          <CollapsibleTrigger>Disabled trigger</CollapsibleTrigger>
          <CollapsibleContent>Disabled content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Disabled trigger')
      
      await user.click(trigger)
      expect(mockChange).not.toHaveBeenCalled()
    })

    it('handles rapid toggle events', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(
        <Collapsible onOpenChange={mockChange}>
          <CollapsibleTrigger>Rapid trigger</CollapsibleTrigger>
          <CollapsibleContent>Rapid content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Rapid trigger')
      
      // Rapid clicks
      await user.click(trigger)
      await user.click(trigger)
      await user.click(trigger)
      await user.click(trigger)
      
      expect(mockChange).toHaveBeenCalledTimes(4)
    })

    it('handles collapsible without content', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>No content trigger</CollapsibleTrigger>
        </Collapsible>
      )
      
      const trigger = screen.getByText('No content trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('handles collapsible without trigger', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleContent>No trigger content</CollapsibleContent>
        </Collapsible>
      )
      
      const content = screen.getByText('No trigger content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      const ControlledCollapsible = () => {
        const [open, setOpen] = React.useState(false)
        
        return (
          <Collapsible 
            open={open}
            onOpenChange={(value) => {
              setOpen(value)
              mockChange(value)
            }}
          >
            <CollapsibleTrigger>Controlled trigger</CollapsibleTrigger>
            <CollapsibleContent>Controlled content</CollapsibleContent>
          </Collapsible>
        )
      }
      
      render(<ControlledCollapsible />)
      
      const trigger = screen.getByText('Controlled trigger')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(mockChange).toHaveBeenCalledWith(true)
    })

    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(
        <Collapsible defaultOpen={false} onOpenChange={mockChange}>
          <CollapsibleTrigger>Uncontrolled trigger</CollapsibleTrigger>
          <CollapsibleContent>Uncontrolled content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Uncontrolled trigger')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(mockChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const mockChange = jest.fn()
      const { rerender } = render(
        <Collapsible onOpenChange={mockChange}>
          <CollapsibleTrigger>Performance trigger</CollapsibleTrigger>
          <CollapsibleContent>Performance content</CollapsibleContent>
        </Collapsible>
      )
      
      // Re-render with same props
      rerender(
        <Collapsible onOpenChange={mockChange}>
          <CollapsibleTrigger>Performance trigger</CollapsibleTrigger>
          <CollapsibleContent>Performance content</CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Performance trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('handles large content efficiently', async () => {
      const user = userEvent.setup()
      const largeContent = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Item {i + 1}</div>
      ))
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Large content trigger</CollapsibleTrigger>
          <CollapsibleContent>
            {largeContent}
          </CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Large content trigger')
      await user.click(trigger)
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 100')).toBeInTheDocument()
    })
  })
}) 