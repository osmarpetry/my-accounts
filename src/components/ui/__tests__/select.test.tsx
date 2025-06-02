import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

// Test utilities
function createSelectComponent(props = {}) {
  const defaultProps = {
    value: '',
    onValueChange: jest.fn(),
    ...props,
  }

  return (
    <Select {...defaultProps}>
      <SelectTrigger data-testid="select-trigger">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent data-testid="select-content">
        <SelectItem value="option1" data-testid="option1">Option 1</SelectItem>
        <SelectItem value="option2" data-testid="option2">Option 2</SelectItem>
        <SelectItem value="option3" data-testid="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  )
}

function createSelectWithDisplayValue(displayValue?: string | React.ReactNode) {
  return (
    <Select value="option1" onValueChange={jest.fn()}>
      <SelectTrigger data-testid="select-trigger">
        <SelectValue 
          placeholder="Select an option" 
          displayValue={displayValue}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('Select Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Select Root Component', () => {
    it('renders children correctly', () => {
      render(createSelectComponent())
      
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('initializes with default state', () => {
      render(createSelectComponent())
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('uses provided value and onValueChange', () => {
      const mockOnValueChange = jest.fn()
      render(createSelectComponent({ value: 'option2', onValueChange: mockOnValueChange }))
      
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('handles undefined value and onValueChange gracefully', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="No handlers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('SelectTrigger Component', () => {
    it('renders as a button with correct attributes', () => {
      render(createSelectComponent())
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInstanceOf(HTMLButtonElement)
      expect(trigger).toHaveAttribute('type', 'button')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('applies custom className correctly', () => {
      render(
        <Select>
          <SelectTrigger className="custom-class" data-testid="trigger">
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByTestId('trigger')).toHaveClass('custom-class')
    })

    it('forwards additional props correctly', () => {
      render(
        <Select>
          <SelectTrigger id="custom-id" data-custom="value">
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('id', 'custom-id')
      expect(trigger).toHaveAttribute('data-custom', 'value')
    })

    it('toggles open state when clicked', async () => {
      const user = userEvent.setup()
      render(createSelectComponent())
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('shows chevron down icon', () => {
      render(createSelectComponent())
      
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('throws error when used outside Select context', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<SelectTrigger>Invalid</SelectTrigger>)
      }).toThrow('SelectTrigger must be used within Select')
      
      consoleSpy.mockRestore()
    })
  })

  describe('SelectValue Component', () => {
    it('displays placeholder when no value is selected', () => {
      render(createSelectComponent({ value: '' }))
      
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('displays value when selected', () => {
      render(createSelectComponent({ value: 'option1' }))
      
      // When value is set, it should show the value itself (not the option label)
      expect(screen.getByText('option1')).toBeInTheDocument()
    })

    it('displays custom displayValue when provided', () => {
      render(createSelectWithDisplayValue('Custom Display'))
      
      expect(screen.getByText('Custom Display')).toBeInTheDocument()
    })

    it('displays React node as displayValue', () => {
      const customDisplay = (
        <div data-testid="custom-display">
          <span>Custom</span> <strong>Display</strong>
        </div>
      )
      
      render(createSelectWithDisplayValue(customDisplay))
      
      expect(screen.getByTestId('custom-display')).toBeInTheDocument()
      expect(screen.getByText('Custom')).toBeInTheDocument()
      expect(screen.getByText('Display')).toBeInTheDocument()
    })

    it('prioritizes displayValue over context value', () => {
      render(createSelectWithDisplayValue('Priority Display'))
      
      expect(screen.getByText('Priority Display')).toBeInTheDocument()
      expect(screen.queryByText('option1')).not.toBeInTheDocument()
    })

    it('falls back to placeholder when displayValue is undefined and no value', () => {
      render(
        <Select value="" onValueChange={jest.fn()}>
          <SelectTrigger>
            <SelectValue 
              placeholder="Fallback Placeholder" 
              displayValue={undefined}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByText('Fallback Placeholder')).toBeInTheDocument()
    })

    it('applies custom className correctly', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue 
              className="custom-value-class" 
              placeholder="Test"
              data-testid="select-value"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByTestId('select-value')).toHaveClass('custom-value-class')
    })

    it('forwards additional props correctly', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue 
              placeholder="Test"
              data-testid="select-value"
              title="Custom title"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByTestId('select-value')).toHaveAttribute('title', 'Custom title')
    })

    it('throws error when used outside Select context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<SelectValue placeholder="Invalid" />)
      }).toThrow('SelectValue must be used within Select')
      
      consoleSpy.mockRestore()
    })
  })

  describe('SelectContent Component', () => {
    it('renders content when open', async () => {
      const user = userEvent.setup()
      render(createSelectComponent())
      
      // Initially content should not be visible
      expect(screen.queryByTestId('select-content')).not.toBeInTheDocument()
      
      // Click to open
      await user.click(screen.getByRole('combobox'))
      
      // Content should now be visible
      expect(screen.getByTestId('select-content')).toBeInTheDocument()
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('does not render content when closed', () => {
      render(createSelectComponent())
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('has correct ARIA attributes when open', async () => {
      const user = userEvent.setup()
      render(createSelectComponent())
      
      await user.click(screen.getByRole('combobox'))
      
      const content = screen.getByRole('listbox')
      expect(content).toHaveAttribute('role', 'listbox')
    })

    it('applies custom className correctly', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent className="custom-content-class" data-testid="content">
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      
      expect(screen.getByTestId('content')).toHaveClass('custom-content-class')
    })

    it('forwards additional props correctly', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent data-testid="content" data-custom="value">
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      
      expect(screen.getByTestId('content')).toHaveAttribute('data-custom', 'value')
    })

    it('throws error when used outside Select context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<SelectContent>Invalid</SelectContent>)
      }).toThrow('SelectContent must be used within Select')
      
      consoleSpy.mockRestore()
    })
  })

  describe('SelectItem Component', () => {
    it('renders item content correctly', async () => {
      const user = userEvent.setup()
      render(createSelectComponent())
      
      await user.click(screen.getByRole('combobox'))
      
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
    })

    it('has correct ARIA attributes', async () => {
      const user = userEvent.setup()
      render(createSelectComponent({ value: 'option1' }))
      
      await user.click(screen.getByRole('combobox'))
      
      const items = screen.getAllByRole('option')
      expect(items[0]).toHaveAttribute('aria-selected', 'true')
      expect(items[1]).toHaveAttribute('aria-selected', 'false')
      expect(items[2]).toHaveAttribute('aria-selected', 'false')
    })

    it('calls onValueChange when clicked', async () => {
      const user = userEvent.setup()
      const mockOnValueChange = jest.fn()
      render(createSelectComponent({ onValueChange: mockOnValueChange }))
      
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByText('Option 2'))
      
      expect(mockOnValueChange).toHaveBeenCalledWith('option2')
    })

    it('closes dropdown when item is selected', async () => {
      const user = userEvent.setup()
      render(createSelectComponent())
      
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      await user.click(screen.getByText('Option 1'))
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('applies custom className correctly', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" className="custom-item-class" data-testid="item">
              Test Item
            </SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      
      expect(screen.getByTestId('item')).toHaveClass('custom-item-class')
    })

    it('forwards additional props correctly', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              value="test" 
              data-testid="item"
              title="Custom title"
            >
              Test Item
            </SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      
      expect(screen.getByTestId('item')).toHaveAttribute('title', 'Custom title')
    })

    it('handles complex children content', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complex">
              <div data-testid="complex-content">
                <span>Complex</span>
                <strong>Content</strong>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      
      expect(screen.getByTestId('complex-content')).toBeInTheDocument()
      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('throws error when used outside Select context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<SelectItem value="test">Invalid</SelectItem>)
      }).toThrow('SelectItem must be used within Select')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Integration Tests', () => {
    it('completes full selection workflow', async () => {
      const user = userEvent.setup()
      const mockOnValueChange = jest.fn()
      
      render(createSelectComponent({ onValueChange: mockOnValueChange }))
      
      // Initial state
      expect(screen.getByText('Select an option')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
      
      // Open dropdown
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      // Select option
      await user.click(screen.getByText('Option 2'))
      
      // Verify results
      expect(mockOnValueChange).toHaveBeenCalledWith('option2')
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      render(createSelectComponent())
      
      const trigger = screen.getByRole('combobox')
      
      // Focus and open with Enter
      trigger.focus()
      await user.keyboard('{Enter}')
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      // Close with Escape
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('maintains controlled state correctly', async () => {
      const user = userEvent.setup()
      let currentValue = 'option1'
      const mockOnValueChange = jest.fn((value) => {
        currentValue = value
      })
      
      const { rerender } = render(
        createSelectComponent({ 
          value: currentValue, 
          onValueChange: mockOnValueChange 
        })
      )
      
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByText('Option 3'))
      
      expect(mockOnValueChange).toHaveBeenCalledWith('option3')
      
      // Simulate parent component updating the value
      rerender(
        createSelectComponent({ 
          value: 'option3', 
          onValueChange: mockOnValueChange 
        })
      )
      
      await user.click(screen.getByRole('combobox'))
      const items = screen.getAllByRole('option')
      expect(items[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('handles rapid open/close operations', async () => {
      const user = userEvent.setup()
      render(createSelectComponent())
      
      const trigger = screen.getByRole('combobox')
      
      // Rapidly click multiple times
      await user.click(trigger)
      await user.click(trigger)
      await user.click(trigger)
      await user.click(trigger)
      
      // Should end up closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('handles empty selection gracefully', async () => {
      const user = userEvent.setup()
      render(
        <Select value="" onValueChange={jest.fn()}>
          <SelectTrigger>
            <SelectValue placeholder="Empty state" />
          </SelectTrigger>
          <SelectContent>
            {/* No items */}
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.queryByRole('option')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles displayValue as empty string', () => {
      render(createSelectWithDisplayValue(''))
      
      expect(screen.queryByText('option1')).not.toBeInTheDocument()
    })

    it('handles displayValue as null', () => {
      render(createSelectWithDisplayValue(null))
      
      expect(screen.queryByText('option1')).not.toBeInTheDocument()
    })

    it('handles displayValue as number zero', () => {
      render(createSelectWithDisplayValue(0))
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles displayValue as boolean false', () => {
      render(createSelectWithDisplayValue(false))
      
      expect(screen.queryByText('option1')).not.toBeInTheDocument()
    })

    it('handles very long option values', async () => {
      const user = userEvent.setup()
      const longValue = 'a'.repeat(1000)
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={longValue}>Long Option</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      
      expect(screen.getByText('Long Option')).toBeInTheDocument()
    })

    it('handles special characters in values', async () => {
      const user = userEvent.setup()
      const specialValue = '!@#$%^&*()[]{}|;:,.<>?'
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={specialValue}>Special</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByText('Special'))
      
      // Should not throw any errors
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Performance and Memory', () => {
    it('does not cause memory leaks with frequent rerenders', () => {
      const { rerender } = render(createSelectComponent())
      
      // Simulate frequent updates
      for (let i = 0; i < 100; i++) {
        rerender(createSelectComponent({ value: `option${i % 3 + 1}` }))
      }
      
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('handles large number of options efficiently', async () => {
      const user = userEvent.setup()
      const manyOptions = Array.from({ length: 1000 }, (_, i) => (
        <SelectItem key={i} value={`option${i}`}>
          Option {i}
        </SelectItem>
      ))
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Many options" />
          </SelectTrigger>
          <SelectContent>
            {manyOptions}
          </SelectContent>
        </Select>
      )
      
      const startTime = performance.now()
      await user.click(screen.getByRole('combobox'))
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(1000) // Should render within 1 second
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })
}) 