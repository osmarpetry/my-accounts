import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { Input } from '../input'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('renders input with default props', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('applies custom className', () => {
      render(<Input className="custom-class" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter your name" />)
      
      const input = screen.getByPlaceholderText('Enter your name')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      expect(input.tagName).toBe('INPUT')
    })

    it('renders email input', () => {
      render(<Input type="email" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders password input', () => {
      render(<Input type="password" />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders number input', () => {
      render(<Input type="number" />)
      
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('renders search input', () => {
      render(<Input type="search" />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('renders tel input', () => {
      render(<Input type="tel" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('renders url input', () => {
      render(<Input type="url" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('renders date input', () => {
      render(<Input type="date" />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('type', 'date')
    })

    it('renders time input', () => {
      render(<Input type="time" />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('type', 'time')
    })

    it('renders file input', () => {
      render(<Input type="file" />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('type', 'file')
    })
  })

  describe('Input States', () => {
    it('handles disabled state', () => {
      render(<Input disabled />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('handles readonly state', () => {
      render(<Input readOnly />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
    })

    it('handles required state', () => {
      render(<Input required />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })

    it('handles value prop', () => {
      render(<Input value="test value" onChange={() => {}} />)
      
      const input = screen.getByDisplayValue('test value')
      expect(input).toHaveValue('test value')
    })

    it('handles defaultValue prop', () => {
      render(<Input defaultValue="default value" />)
      
      const input = screen.getByDisplayValue('default value')
      expect(input).toHaveValue('default value')
    })
  })

  describe('User Interactions', () => {
    it('calls onChange when user types', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Input onChange={mockChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'hello')
      
      expect(mockChange).toHaveBeenCalledTimes(5) // One call per character
    })

    it('calls onFocus when input is focused', async () => {
      const user = userEvent.setup()
      const mockFocus = jest.fn()
      
      render(<Input onFocus={mockFocus} />)
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      
      expect(mockFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur when input loses focus', async () => {
      const user = userEvent.setup()
      const mockBlur = jest.fn()
      
      render(
        <div>
          <Input onBlur={mockBlur} />
          <button>Other element</button>
        </div>
      )
      
      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button')
      
      await user.click(input)
      await user.click(button)
      
      expect(mockBlur).toHaveBeenCalledTimes(1)
    })

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Input disabled onChange={mockChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'hello')
      
      expect(mockChange).not.toHaveBeenCalled()
    })

    it('does not call onChange when readonly', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Input readOnly onChange={mockChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'hello')
      
      expect(mockChange).not.toHaveBeenCalled()
    })
  })

  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup()
      const mockSubmit = jest.fn((e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        return formData.get('username')
      })
      
      render(
        <form onSubmit={mockSubmit}>
          <Input name="username" defaultValue="testuser" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('validates required field', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <Input required name="email" type="email" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button')
      
      expect(input).toBeRequired()
      
      await user.click(button)
      expect(input).toBeInvalid()
    })
  })

  describe('Forwarded Props', () => {
    it('forwards additional HTML attributes', () => {
      render(
        <Input 
          data-testid="custom-input"
          aria-label="Custom input"
          title="Input title"
          maxLength={10}
          minLength={2}
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('data-testid', 'custom-input')
      expect(input).toHaveAttribute('aria-label', 'Custom input')
      expect(input).toHaveAttribute('title', 'Input title')
      expect(input).toHaveAttribute('maxlength', '10')
      expect(input).toHaveAttribute('minlength', '2')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      
      render(<Input ref={ref} defaultValue="test" />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current).toHaveValue('test')
    })

    it('handles autoComplete attribute', () => {
      render(<Input autoComplete="email" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('autocomplete', 'email')
    })

    it('handles pattern attribute', () => {
      render(<Input pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(<Input value="" onChange={() => {}} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    it('handles null value gracefully', () => {
      render(<Input value={null as any} onChange={() => {}} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('handles undefined onChange', () => {
      render(<Input onChange={undefined} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('handles very long values', async () => {
      const user = userEvent.setup()
      const longValue = 'a'.repeat(1000)
      
      render(<Input defaultValue={longValue} />)
      
      const input = screen.getByDisplayValue(longValue)
      expect(input).toHaveValue(longValue)
    })

    it('handles special characters', () => {
      const specialChars = '!@#$%^&*()_+-=,.<>?'
      
      render(<Input defaultValue={specialChars} />)
      
      const input = screen.getByDisplayValue(specialChars)
      expect(input).toHaveValue(specialChars)
    })
  })

  describe('Number Input Specific', () => {
    it('handles min and max attributes', () => {
      render(<Input type="number" min={0} max={100} />)
      
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })

    it('handles step attribute', () => {
      render(<Input type="number" step={0.1} />)
      
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('step', '0.1')
    })

    it('accepts numeric values', async () => {
      const user = userEvent.setup()
      
      render(<Input type="number" />)
      
      const input = screen.getByRole('spinbutton')
      await user.type(input, '123.45')
      
      expect(input).toHaveValue(123.45)
    })
  })

  describe('File Input Specific', () => {
    it('handles accept attribute', () => {
      render(<Input type="file" accept=".jpg,.png,.gif" />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('accept', '.jpg,.png,.gif')
    })

    it('handles multiple attribute', () => {
      render(<Input type="file" multiple />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('multiple')
    })
  })

  describe('Accessibility', () => {
    it('supports aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" />
          <div id="help-text">Help text</div>
        </div>
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('supports aria-invalid', () => {
      render(<Input aria-invalid="true" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('supports aria-required', () => {
      render(<Input aria-required="true" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })
}) 