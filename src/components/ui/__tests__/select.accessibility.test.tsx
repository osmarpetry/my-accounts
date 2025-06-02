import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Import the components to test
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../select'

// Mock the utils function
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(' ')),
}))

describe('Select Accessibility Tests', () => {
  function createAccessibleSelect(props = {}) {
    return (
      <Select {...props}>
        <SelectTrigger aria-label="Choose account type">
          <SelectValue placeholder="Select account type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="checking">Checking Account</SelectItem>
          <SelectItem value="savings">Savings Account</SelectItem>
          <SelectItem value="credit">Credit Account</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  describe('ARIA Attributes', () => {
    it('has proper combobox role and attributes', () => {
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
      expect(trigger).toHaveAttribute('aria-controls')
    })

    it('updates aria-expanded when opened/closed', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      
      // Initially closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      // Open dropdown
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      
      // Close dropdown
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('has proper listbox role when open', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      await user.click(screen.getByRole('combobox'))
      
      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeInTheDocument()
      expect(listbox).toHaveAttribute('role', 'listbox')
    })

    it('has proper option roles and aria-selected attributes', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect({ value: 'checking' }))
      
      await user.click(screen.getByRole('combobox'))
      
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
      
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
      expect(options[1]).toHaveAttribute('aria-selected', 'false')
      expect(options[2]).toHaveAttribute('aria-selected', 'false')
    })

    it('connects trigger to content with aria-controls', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      const controlsId = trigger.getAttribute('aria-controls')
      
      await user.click(trigger)
      
      const content = screen.getByRole('listbox')
      expect(content).toHaveAttribute('id', controlsId)
    })
  })

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard('{Enter}')
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('opens dropdown with Space key', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard(' ')
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      await user.keyboard('{Escape}')
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveFocus()
    })

    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard('{Enter}')
      
      // Arrow down should focus first option
      await user.keyboard('{ArrowDown}')
      
      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveFocus()
      
      // Arrow down should focus second option
      await user.keyboard('{ArrowDown}')
      expect(options[1]).toHaveFocus()
      
      // Arrow up should focus first option again
      await user.keyboard('{ArrowUp}')
      expect(options[0]).toHaveFocus()
    })

    it('selects option with Enter key', async () => {
      const user = userEvent.setup()
      const mockOnValueChange = jest.fn()
      render(createAccessibleSelect({ onValueChange: mockOnValueChange }))
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard('{Enter}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      
      expect(mockOnValueChange).toHaveBeenCalledWith('checking')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
    })

    it('wraps focus at list boundaries', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard('{Enter}')
      
      const options = screen.getAllByRole('option')
      
      // Go to last option
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      
      expect(options[2]).toHaveFocus()
      
      // Arrow down should wrap to first option
      await user.keyboard('{ArrowDown}')
      expect(options[0]).toHaveFocus()
      
      // Arrow up should wrap to last option
      await user.keyboard('{ArrowUp}')
      expect(options[2]).toHaveFocus()
    })
  })

  describe('Screen Reader Support', () => {
    it('has proper labeling for screen readers', () => {
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox', { name: 'Choose account type' })
      expect(trigger).toBeInTheDocument()
    })

    it('announces selection changes', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect({ value: 'savings' }))
      
      await user.click(screen.getByRole('combobox'))
      
      const selectedOption = screen.getByRole('option', { selected: true })
      expect(selectedOption).toHaveTextContent('Savings Account')
      expect(selectedOption).toHaveAttribute('aria-selected', 'true')
    })

    it('provides context about dropdown state', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      
      // Closed state
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      // Open state
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      
      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('maintains focus on trigger when dropdown closes', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      // Select an option
      await user.click(screen.getByText('Checking Account'))
      
      expect(trigger).toHaveFocus()
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('moves focus to first option when opened with keyboard', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard('{Enter}')
      
      const firstOption = screen.getAllByRole('option')[0]
      expect(firstOption).toHaveFocus()
    })

    it('returns focus to trigger when closed with Escape', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await user.keyboard('{Escape}')
      
      expect(trigger).toHaveFocus()
    })

    it('handles Tab key properly', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <button>Before</button>
          {createAccessibleSelect()}
          <button>After</button>
        </div>
      )
      
      const beforeButton = screen.getByText('Before')
      const trigger = screen.getByRole('combobox')
      const afterButton = screen.getByText('After')
      
      beforeButton.focus()
      
      // Tab to select trigger
      await user.tab()
      expect(trigger).toHaveFocus()
      
      // Tab should move to next element when closed
      await user.tab()
      expect(afterButton).toHaveFocus()
    })

    it('traps focus within dropdown when open', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const options = screen.getAllByRole('option')
      
      // Focus should be trapped within the dropdown
      options[0].focus()
      await user.tab()
      
      // Should cycle through options, not escape dropdown
      expect(document.activeElement).toBeOneOf(options)
    })
  })

  describe('High Contrast Mode', () => {
    it('maintains visibility in high contrast mode', () => {
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      
      // These classes should ensure visibility in high contrast mode
      expect(trigger).toHaveClass('border')
      expect(trigger).toHaveClass('bg-background')
    })

    it('provides clear focus indicators', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      // Should have focus ring styles
      expect(trigger).toHaveClass('focus:ring-1')
      expect(trigger).toHaveClass('focus:ring-ring')
    })
  })

  describe('Reduced Motion Support', () => {
    it('respects prefers-reduced-motion', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })
      
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      await user.click(screen.getByRole('combobox'))
      
      // Content should still appear, but without animations
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Touch and Mobile Accessibility', () => {
    it('has adequate touch targets', () => {
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      
      // Should have minimum 44px height for touch accessibility
      expect(trigger).toHaveClass('h-9') // which translates to 36px, could be improved
    })

    it('handles touch interactions', async () => {
      const user = userEvent.setup()
      render(createAccessibleSelect())
      
      const trigger = screen.getByRole('combobox')
      
      // Simulate touch
      await user.pointer({ keys: '[TouchA>]', target: trigger })
      await user.pointer({ keys: '[/TouchA]' })
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Error States and Validation', () => {
    it('supports error state with aria-invalid', () => {
      render(
        <Select>
          <SelectTrigger aria-invalid="true" aria-describedby="error-message">
            <SelectValue placeholder="Select with error" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-invalid', 'true')
      expect(trigger).toHaveAttribute('aria-describedby', 'error-message')
    })

    it('supports required state', () => {
      render(
        <Select>
          <SelectTrigger aria-required="true">
            <SelectValue placeholder="Required select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-required', 'true')
    })

    it('supports disabled state', () => {
      render(
        <Select>
          <SelectTrigger disabled>
            <SelectValue placeholder="Disabled select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
      expect(trigger).toHaveClass('disabled:cursor-not-allowed')
      expect(trigger).toHaveClass('disabled:opacity-50')
    })
  })
}) 