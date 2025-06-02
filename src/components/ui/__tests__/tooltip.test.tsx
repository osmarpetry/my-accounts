import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider 
} from '../tooltip'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Tooltip Components', () => {
  const TooltipWrapper = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider>{children}</TooltipProvider>
  )

  describe('TooltipProvider Component', () => {
    it('renders children correctly', () => {
      render(
        <TooltipProvider>
          <div data-testid="child">Child content</div>
        </TooltipProvider>
      )
      
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('accepts delayDuration prop', () => {
      render(
        <TooltipProvider delayDuration={500}>
          <div>Provider with delay</div>
        </TooltipProvider>
      )
      
      expect(screen.getByText('Provider with delay')).toBeInTheDocument()
    })

    it('accepts skipDelayDuration prop', () => {
      render(
        <TooltipProvider skipDelayDuration={200}>
          <div>Provider with skip delay</div>
        </TooltipProvider>
      )
      
      expect(screen.getByText('Provider with skip delay')).toBeInTheDocument()
    })

    it('accepts disableHoverableContent prop', () => {
      render(
        <TooltipProvider disableHoverableContent>
          <div>Provider without hoverable content</div>
        </TooltipProvider>
      )
      
      expect(screen.getByText('Provider without hoverable content')).toBeInTheDocument()
    })
  })

  describe('Tooltip Component', () => {
    it('renders tooltip with trigger and content', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Hover me')
      expect(trigger).toBeInTheDocument()
      
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('Tooltip content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('handles open prop for controlled state', async () => {
      render(
        <TooltipWrapper>
          <Tooltip open={true}>
            <TooltipTrigger>Always visible trigger</TooltipTrigger>
            <TooltipContent>Always visible content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const contents = screen.getAllByText('Always visible content')
      expect(contents.length).toBeGreaterThan(0)
    })

    it('handles defaultOpen state', async () => {
      render(
        <TooltipWrapper>
          <Tooltip defaultOpen>
            <TooltipTrigger>Default open trigger</TooltipTrigger>
            <TooltipContent>Default open content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const contents = screen.getAllByText('Default open content')
      expect(contents.length).toBeGreaterThan(0)
    })

    it('calls onOpenChange when state changes', async () => {
      const onOpenChange = jest.fn()
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip onOpenChange={onOpenChange}>
            <TooltipTrigger>Change trigger</TooltipTrigger>
            <TooltipContent>Change content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Change trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true)
      })
    })

    it('handles delayDuration prop', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip delayDuration={100}>
            <TooltipTrigger>Quick tooltip</TooltipTrigger>
            <TooltipContent>Quick content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Quick tooltip')
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('Quick content')
        expect(contents.length).toBeGreaterThan(0)
      }, { timeout: 200 })
    })

    it('handles disableHoverableContent prop', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip disableHoverableContent>
            <TooltipTrigger>No hover trigger</TooltipTrigger>
            <TooltipContent>No hover content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('No hover trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('No hover content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })
  })

  describe('TooltipTrigger Component', () => {
    it('renders trigger element', () => {
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Click me</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('handles asChild prop', () => {
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Custom button</button>
            </TooltipTrigger>
            <TooltipContent>Custom content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const button = screen.getByRole('button', { name: 'Custom button' })
      expect(button).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger className="custom-trigger">
              Styled trigger
            </TooltipTrigger>
            <TooltipContent>Styled content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Styled trigger')
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Keyboard trigger</TooltipTrigger>
            <TooltipContent>Keyboard content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Keyboard trigger')
      await user.tab()
      
      expect(trigger).toHaveFocus()
      
      await waitFor(() => {
        const contents = screen.getAllByText('Keyboard content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('handles click events', async () => {
      const onClick = jest.fn()
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger onClick={onClick}>
              Clickable trigger
            </TooltipTrigger>
            <TooltipContent>Click content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Clickable trigger')
      await user.click(trigger)
      
      expect(onClick).toHaveBeenCalled()
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger ref={ref}>Ref trigger</TooltipTrigger>
            <TooltipContent>Ref content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('TooltipContent Component', () => {
    it('renders tooltip content', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>This is tooltip content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('This is tooltip content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('applies custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent className="custom-tooltip">
              Custom styled
            </TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('Custom styled')
        expect(contents.length).toBeGreaterThan(0)
        expect(contents[0]).toHaveClass('custom-tooltip')
      })
    })

    it('handles different side positions', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent side="left">Left side content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('Left side content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('handles sideOffset', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent sideOffset={10}>Offset content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('Offset content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('handles align prop', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent align="start">Aligned content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('Aligned content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('handles alignOffset', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent alignOffset={5}>Align offset content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('Align offset content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('forwards ref correctly', async () => {
      const ref = React.createRef<HTMLDivElement>()
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent ref={ref}>Ref content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement)
      })
    })
  })

  describe('Tooltip Interactions', () => {
    it('shows tooltip on hover', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Hover trigger</TooltipTrigger>
            <TooltipContent>Hover content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Hover trigger')
      
      expect(screen.queryByText('Hover content')).not.toBeInTheDocument()
      
      await user.hover(trigger)
      
      await waitFor(() => {
        const contents = screen.getAllByText('Hover content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('shows tooltip on focus', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Focus trigger</TooltipTrigger>
            <TooltipContent>Focus content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Focus trigger')
      await user.tab()
      
      expect(trigger).toHaveFocus()
      
      await waitFor(() => {
        const contents = screen.getAllByText('Focus content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('hides tooltip on blur', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <TooltipWrapper>
            <Tooltip>
              <TooltipTrigger>Blur trigger</TooltipTrigger>
              <TooltipContent>Blur content</TooltipContent>
            </Tooltip>
          </TooltipWrapper>
          <button>Other button</button>
        </div>
      )
      
      const trigger = screen.getByText('Blur trigger')
      const otherButton = screen.getByText('Other button')
      
      await user.tab()
      expect(trigger).toHaveFocus()
      
      await waitFor(() => {
        const contents = screen.getAllByText('Blur content')
        expect(contents.length).toBeGreaterThan(0)
      })
      
      await user.click(otherButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Blur content')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>ARIA trigger</TooltipTrigger>
            <TooltipContent>ARIA content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('ARIA trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-describedby')
        const contents = screen.getAllByText('ARIA content')
        expect(contents.length).toBeGreaterThan(0)
      })
    })

    it('supports screen readers', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Screen reader trigger</TooltipTrigger>
            <TooltipContent>Screen reader content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Screen reader trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const tooltipElements = screen.getAllByRole('tooltip')
        expect(tooltipElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Multiple Tooltips', () => {
    it('handles multiple tooltips independently', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <div>
            <Tooltip>
              <TooltipTrigger>First trigger</TooltipTrigger>
              <TooltipContent>First content</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>Second trigger</TooltipTrigger>
              <TooltipContent>Second content</TooltipContent>
            </Tooltip>
          </div>
        </TooltipWrapper>
      )
      
      const firstTrigger = screen.getByText('First trigger')
      const secondTrigger = screen.getByText('Second trigger')
      
      // Test that both triggers exist and can be interacted with
      expect(firstTrigger).toBeInTheDocument()
      expect(secondTrigger).toBeInTheDocument()
      
      await user.hover(firstTrigger)
      
      await waitFor(() => {
        const firstContents = screen.getAllByText('First content')
        expect(firstContents.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Empty trigger</TooltipTrigger>
            <TooltipContent></TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Empty trigger')
      await user.hover(trigger)
      
      // Should not throw error
      expect(trigger).toBeInTheDocument()
    })

    it('handles complex content', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Complex trigger</TooltipTrigger>
            <TooltipContent>
              <div>
                <strong>Bold text</strong>
                <br />
                <em>Italic text</em>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Complex trigger')
      await user.hover(trigger)
      
      await waitFor(() => {
        const boldTexts = screen.getAllByText('Bold text')
        const italicTexts = screen.getAllByText('Italic text')
        expect(boldTexts.length).toBeGreaterThan(0)
        expect(italicTexts.length).toBeGreaterThan(0)
      })
    })

    it('handles rapid hover/unhover', async () => {
      const user = userEvent.setup()
      
      render(
        <TooltipWrapper>
          <Tooltip>
            <TooltipTrigger>Rapid trigger</TooltipTrigger>
            <TooltipContent>Rapid content</TooltipContent>
          </Tooltip>
        </TooltipWrapper>
      )
      
      const trigger = screen.getByText('Rapid trigger')
      
      // Rapid hover/unhover
      await user.hover(trigger)
      await user.unhover(trigger)
      await user.hover(trigger)
      
      // Should not throw error
      expect(trigger).toBeInTheDocument()
    })
  })
}) 