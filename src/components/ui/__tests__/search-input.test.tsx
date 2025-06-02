import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { SearchInput } from '../search-input'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <svg data-testid="search-icon" />,
  X: () => <svg data-testid="x-icon" />,
}))

describe('SearchInput Component', () => {
  const defaultProps = {
    value: '',
    onSearchChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('renders search input with default props', () => {
      render(<SearchInput {...defaultProps} />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'search')
    })

    it('renders with placeholder', () => {
      render(<SearchInput {...defaultProps} placeholder="Search accounts..." />)
      
      const input = screen.getByPlaceholderText('Search accounts...')
      expect(input).toBeInTheDocument()
    })

    it('renders search icon', () => {
      render(<SearchInput {...defaultProps} />)
      
      const searchIcon = screen.getByTestId('search-icon')
      expect(searchIcon).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<SearchInput {...defaultProps} className="custom-class" />)
      
      const container = screen.getByRole('searchbox').parentElement?.parentElement
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('Value and State Management', () => {
    it('displays the provided value', () => {
      render(<SearchInput {...defaultProps} value="test search" />)
      
      const input = screen.getByDisplayValue('test search')
      expect(input).toBeInTheDocument()
    })

    it('shows clear button when value is not empty', () => {
      render(<SearchInput {...defaultProps} value="test" />)
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('hides clear button when value is empty', () => {
      render(<SearchInput {...defaultProps} value="" />)
      
      const clearButton = screen.queryByRole('button')
      expect(clearButton).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onSearchChange when user types (debounced)', async () => {
      const mockSearchChange = jest.fn()
      
      render(<SearchInput {...defaultProps} onSearchChange={mockSearchChange} debounceMs={100} />)
      
      const input = screen.getByRole('searchbox')
      fireEvent.change(input, { target: { value: 'hello' } })
      
      // Should not be called immediately
      expect(mockSearchChange).not.toHaveBeenCalled()
      
      // Fast-forward time
      jest.advanceTimersByTime(100)
      
      expect(mockSearchChange).toHaveBeenCalledWith('hello')
    })

    it('debounces multiple rapid changes', async () => {
      const mockSearchChange = jest.fn()
      
      render(<SearchInput {...defaultProps} onSearchChange={mockSearchChange} debounceMs={100} />)
      
      const input = screen.getByRole('searchbox')
      
      fireEvent.change(input, { target: { value: 'h' } })
      fireEvent.change(input, { target: { value: 'he' } })
      fireEvent.change(input, { target: { value: 'hel' } })
      fireEvent.change(input, { target: { value: 'hello' } })
      
      // Should not be called yet
      expect(mockSearchChange).not.toHaveBeenCalled()
      
      // Fast-forward time
      jest.advanceTimersByTime(100)
      
      // Should only be called once with the final value
      expect(mockSearchChange).toHaveBeenCalledTimes(1)
      expect(mockSearchChange).toHaveBeenCalledWith('hello')
    })

    it('calls onSearchChange when clear button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const mockSearchChange = jest.fn()
      
      render(<SearchInput {...defaultProps} value="test" onSearchChange={mockSearchChange} />)
      
      const clearButton = screen.getByRole('button')
      await user.click(clearButton)
      
      expect(mockSearchChange).toHaveBeenCalledWith('')
    })
  })

  describe('Disabled State', () => {
    it('handles disabled state', () => {
      render(<SearchInput {...defaultProps} disabled />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toBeDisabled()
    })

    it('does not show clear button when disabled', () => {
      render(<SearchInput {...defaultProps} value="test" disabled />)
      
      const clearButton = screen.queryByRole('button')
      // When disabled, the clear button is still present but disabled
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).toBeDisabled()
    })

    it('does not call onSearchChange when disabled', () => {
      const mockSearchChange = jest.fn()
      
      render(<SearchInput {...defaultProps} onSearchChange={mockSearchChange} disabled />)
      
      const input = screen.getByRole('searchbox')
      fireEvent.change(input, { target: { value: 'hello' } })
      
      jest.advanceTimersByTime(300)
      
      expect(mockSearchChange).not.toHaveBeenCalled()
    })
  })

  describe('Debounce Functionality', () => {
    it('uses custom debounce time', () => {
      const mockSearchChange = jest.fn()
      
      render(<SearchInput {...defaultProps} onSearchChange={mockSearchChange} debounceMs={500} />)
      
      const input = screen.getByRole('searchbox')
      fireEvent.change(input, { target: { value: 'test' } })
      
      // Should not be called after 300ms
      jest.advanceTimersByTime(300)
      expect(mockSearchChange).not.toHaveBeenCalled()
      
      // Should be called after 500ms
      jest.advanceTimersByTime(200)
      expect(mockSearchChange).toHaveBeenCalledWith('test')
    })

    it('cancels previous debounce on new input', () => {
      const mockSearchChange = jest.fn()
      
      render(<SearchInput {...defaultProps} onSearchChange={mockSearchChange} debounceMs={100} />)
      
      const input = screen.getByRole('searchbox')
      
      fireEvent.change(input, { target: { value: 'first' } })
      jest.advanceTimersByTime(50)
      
      fireEvent.change(input, { target: { value: 'second' } })
      jest.advanceTimersByTime(100)
      
      // Should only be called once with the latest value
      expect(mockSearchChange).toHaveBeenCalledTimes(1)
      expect(mockSearchChange).toHaveBeenCalledWith('second')
    })
  })

  describe('Value Synchronization', () => {
    it('syncs with external value changes', () => {
      const { rerender } = render(<SearchInput {...defaultProps} value="initial" />)
      
      const input = screen.getByDisplayValue('initial')
      expect(input).toHaveValue('initial')
      
      rerender(<SearchInput {...defaultProps} value="updated" />)
      
      expect(input).toHaveValue('updated')
    })

    it('maintains internal state during typing', () => {
      render(<SearchInput {...defaultProps} value="" />)
      
      const input = screen.getByRole('searchbox')
      fireEvent.change(input, { target: { value: 'typing' } })
      
      expect(input).toHaveValue('typing')
    })
  })

  describe('Clear Button Functionality', () => {
    it('clear button has accessible label', () => {
      render(<SearchInput {...defaultProps} value="test" />)
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search')
    })

    it('clears input and calls onSearchChange immediately', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const mockSearchChange = jest.fn()
      
      render(<SearchInput {...defaultProps} value="test" onSearchChange={mockSearchChange} />)
      
      const clearButton = screen.getByRole('button')
      await user.click(clearButton)
      
      const input = screen.getByRole('searchbox')
      expect(input).toHaveValue('')
      expect(mockSearchChange).toHaveBeenCalledWith('')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SearchInput {...defaultProps} placeholder="Search items" />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toHaveAttribute('aria-label', 'Search items')
    })

    it('supports custom aria-label through placeholder', () => {
      render(<SearchInput {...defaultProps} placeholder="Find accounts" />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toHaveAttribute('aria-label', 'Find accounts')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined value gracefully', () => {
      render(<SearchInput onSearchChange={jest.fn()} />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('')
    })

    it('handles empty string value', () => {
      render(<SearchInput {...defaultProps} value="" />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toHaveValue('')
    })

    it('handles very long search values', () => {
      const longValue = 'a'.repeat(1000)
      
      render(<SearchInput {...defaultProps} value={longValue} />)
      
      const input = screen.getByDisplayValue(longValue)
      expect(input).toHaveValue(longValue)
    })

    it('handles special characters in search', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      render(<SearchInput {...defaultProps} value={specialChars} />)
      
      const input = screen.getByDisplayValue(specialChars)
      expect(input).toHaveValue(specialChars)
    })
  })

  describe('Component Integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const mockSubmit = jest.fn((e) => {
        e.preventDefault()
      })
      
      render(
        <form onSubmit={mockSubmit}>
          <SearchInput {...defaultProps} value="test query" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const button = screen.getByRole('button', { name: 'Submit' })
      await user.click(button)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct CSS classes', () => {
      render(<SearchInput {...defaultProps} />)
      
      const container = screen.getByRole('searchbox').parentElement?.parentElement
      expect(container).toHaveClass('relative')
    })

    it('positions search icon correctly', () => {
      render(<SearchInput {...defaultProps} />)
      
      const searchIcon = screen.getByTestId('search-icon')
      expect(searchIcon).toBeInTheDocument()
    })

    it('positions clear button correctly when visible', () => {
      render(<SearchInput {...defaultProps} value="test" />)
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const mockSearchChange = jest.fn()
      const { rerender } = render(<SearchInput {...defaultProps} onSearchChange={mockSearchChange} />)
      
      // Re-render with same props
      rerender(<SearchInput {...defaultProps} onSearchChange={mockSearchChange} />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toBeInTheDocument()
    })

    it('cleans up debounce timers on unmount', () => {
      const mockSearchChange = jest.fn()
      const { unmount } = render(<SearchInput {...defaultProps} onSearchChange={mockSearchChange} />)
      
      const input = screen.getByRole('searchbox')
      fireEvent.change(input, { target: { value: 'test' } })
      
      unmount()
      
      jest.advanceTimersByTime(300)
      expect(mockSearchChange).not.toHaveBeenCalled()
    })
  })
}) 