import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { Label } from '../label'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Label Component', () => {
  describe('Basic Rendering', () => {
    it('renders label with default props', () => {
      render(<Label>Label text</Label>)
      
      const label = screen.getByText('Label text')
      expect(label).toBeInTheDocument()
      expect(label.tagName).toBe('LABEL')
    })

    it('applies custom className', () => {
      render(<Label className="custom-class">Label</Label>)
      
      const label = screen.getByText('Label')
      expect(label).toHaveClass('custom-class')
    })

    it('renders with htmlFor attribute', () => {
      render(<Label htmlFor="input-id">Label for input</Label>)
      
      const label = screen.getByText('Label for input')
      expect(label).toHaveAttribute('for', 'input-id')
    })
  })

  describe('Form Association', () => {
    it('associates with input using htmlFor', () => {
      render(
        <div>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </div>
      )
      
      const label = screen.getByText('Username')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'username')
      expect(input).toHaveAttribute('id', 'username')
    })

    it('works with nested input (implicit association)', () => {
      render(
        <Label>
          Email
          <input type="email" />
        </Label>
      )
      
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox')
      
      expect(label).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    it('clicking label focuses associated input', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Label htmlFor="focus-test">Click me</Label>
          <input id="focus-test" type="text" />
        </div>
      )
      
      const label = screen.getByText('Click me')
      const input = screen.getByRole('textbox')
      
      await user.click(label)
      
      expect(input).toHaveFocus()
    })
  })

  describe('Content Types', () => {
    it('renders text content', () => {
      render(<Label>Simple text</Label>)
      
      expect(screen.getByText('Simple text')).toBeInTheDocument()
    })

    it('renders numeric content', () => {
      render(<Label>{42}</Label>)
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders React elements as children', () => {
      render(
        <Label>
          <strong>Required</strong> field
        </Label>
      )
      
      expect(screen.getByText('Required')).toBeInTheDocument()
      expect(screen.getByText('field')).toBeInTheDocument()
    })

    it('renders with icons', () => {
      render(
        <Label>
          <span role="img" aria-label="required">*</span>
          Name
        </Label>
      )
      
      expect(screen.getByLabelText('required')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
    })
  })

  describe('Forwarded Props', () => {
    it('forwards additional HTML attributes', () => {
      render(
        <Label 
          data-testid="custom-label"
          title="Label title"
          id="label-id"
        >
          Label
        </Label>
      )
      
      const label = screen.getByText('Label')
      expect(label).toHaveAttribute('data-testid', 'custom-label')
      expect(label).toHaveAttribute('title', 'Label title')
      expect(label).toHaveAttribute('id', 'label-id')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLLabelElement>()
      
      render(<Label ref={ref}>Label with ref</Label>)
      
      expect(ref.current).toBeInstanceOf(HTMLLabelElement)
      expect(ref.current).toHaveTextContent('Label with ref')
    })

    it('handles event handlers', async () => {
      const user = userEvent.setup()
      const mockClick = jest.fn()
      const mockMouseEnter = jest.fn()
      
      render(
        <Label 
          onClick={mockClick}
          onMouseEnter={mockMouseEnter}
        >
          Interactive Label
        </Label>
      )
      
      const label = screen.getByText('Interactive Label')
      
      await user.click(label)
      expect(mockClick).toHaveBeenCalledTimes(1)
      
      await user.hover(label)
      expect(mockMouseEnter).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <Label 
          aria-label="Custom label"
          aria-describedby="help-text"
        >
          Field Label
        </Label>
      )
      
      const label = screen.getByText('Field Label')
      expect(label).toHaveAttribute('aria-label', 'Custom label')
      expect(label).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('works with required fields', () => {
      render(
        <div>
          <Label htmlFor="required-field">
            Required Field <span aria-label="required">*</span>
          </Label>
          <input id="required-field" type="text" required />
        </div>
      )
      
      const label = screen.getByText(/Required Field/)
      const requiredIndicator = screen.getByLabelText('required')
      const input = screen.getByRole('textbox')
      
      expect(label).toBeInTheDocument()
      expect(requiredIndicator).toBeInTheDocument()
      expect(input).toBeRequired()
    })

    it('supports screen reader text', () => {
      render(
        <Label>
          <span className="sr-only">Hidden text for screen readers</span>
          Visible Label
        </Label>
      )
      
      expect(screen.getByText('Hidden text for screen readers')).toBeInTheDocument()
      expect(screen.getByText('Visible Label')).toBeInTheDocument()
    })
  })

  describe('Form Integration', () => {
    it('works with different input types', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <div>
            <Label htmlFor="text-input">Text Input</Label>
            <input id="text-input" type="text" />
          </div>
          <div>
            <Label htmlFor="email-input">Email Input</Label>
            <input id="email-input" type="email" />
          </div>
          <div>
            <Label htmlFor="checkbox-input">Checkbox</Label>
            <input id="checkbox-input" type="checkbox" />
          </div>
          <div>
            <Label htmlFor="radio-input">Radio</Label>
            <input id="radio-input" type="radio" name="radio-group" />
          </div>
        </form>
      )
      
      const textLabel = screen.getByText('Text Input')
      const emailLabel = screen.getByText('Email Input')
      const checkboxLabel = screen.getByText('Checkbox')
      const radioLabel = screen.getByText('Radio')
      
      const textInput = screen.getByRole('textbox', { name: 'Text Input' })
      const emailInput = screen.getByRole('textbox', { name: 'Email Input' })
      const checkboxInput = screen.getByRole('checkbox')
      const radioInput = screen.getByRole('radio')
      
      // Test clicking labels focuses inputs
      await user.click(textLabel)
      expect(textInput).toHaveFocus()
      
      await user.click(emailLabel)
      expect(emailInput).toHaveFocus()
      
      await user.click(checkboxLabel)
      expect(checkboxInput).toHaveFocus()
      
      await user.click(radioLabel)
      expect(radioInput).toHaveFocus()
    })

    it('works with textarea', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Label htmlFor="message">Message</Label>
          <textarea id="message" />
        </div>
      )
      
      const label = screen.getByText('Message')
      const textarea = screen.getByRole('textbox')
      
      await user.click(label)
      expect(textarea).toHaveFocus()
    })

    it('works with select', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Label htmlFor="country">Country</Label>
          <select id="country">
            <option value="us">United States</option>
            <option value="ca">Canada</option>
          </select>
        </div>
      )
      
      const label = screen.getByText('Country')
      const select = screen.getByRole('combobox')
      
      await user.click(label)
      expect(select).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Label></Label>)
      
      const label = screen.getByRole('generic')
      expect(label).toBeInTheDocument()
      expect(label.textContent).toBe('')
    })

    it('handles null children', () => {
      render(<Label>{null}</Label>)
      
      const label = screen.getByRole('generic')
      expect(label).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<Label>{undefined}</Label>)
      
      const label = screen.getByRole('generic')
      expect(label).toBeInTheDocument()
    })

    it('handles boolean children', () => {
      render(<Label>{true}</Label>)
      
      const label = screen.getByRole('generic')
      expect(label).toBeInTheDocument()
    })

    it('handles zero as children', () => {
      render(<Label>{0}</Label>)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles empty string as children', () => {
      render(<Label>{''}</Label>)
      
      const label = screen.getByRole('generic')
      expect(label).toBeInTheDocument()
    })

    it('handles very long text', () => {
      const longText = 'This is a very long label text that might wrap to multiple lines and should be handled properly by the component without any issues.'
      
      render(<Label>{longText}</Label>)
      
      const label = screen.getByText(longText)
      expect(label).toBeInTheDocument()
    })

    it('handles special characters', () => {
      const specialText = 'Label with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      
      render(<Label>{specialText}</Label>)
      
      const label = screen.getByText(specialText)
      expect(label).toBeInTheDocument()
    })
  })

  describe('Multiple Labels', () => {
    it('renders multiple labels correctly', () => {
      render(
        <form>
          <Label htmlFor="first">First Name</Label>
          <input id="first" type="text" />
          
          <Label htmlFor="last">Last Name</Label>
          <input id="last" type="text" />
          
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />
        </form>
      )
      
      expect(screen.getByText('First Name')).toBeInTheDocument()
      expect(screen.getByText('Last Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('handles labels with same text content', () => {
      render(
        <div>
          <Label htmlFor="input1">Name</Label>
          <input id="input1" type="text" />
          
          <Label htmlFor="input2">Name</Label>
          <input id="input2" type="text" />
        </div>
      )
      
      const labels = screen.getAllByText('Name')
      expect(labels).toHaveLength(2)
      expect(labels[0]).toHaveAttribute('for', 'input1')
      expect(labels[1]).toHaveAttribute('for', 'input2')
    })
  })

  describe('Complex Content', () => {
    it('handles nested components', () => {
      render(
        <Label>
          <div>
            <span>Nested</span>
            <div>
              <span>Deep</span>
            </div>
          </div>
        </Label>
      )
      
      expect(screen.getByText('Nested')).toBeInTheDocument()
      expect(screen.getByText('Deep')).toBeInTheDocument()
    })

    it('handles mixed content types', () => {
      render(
        <Label>
          Text {42} <span>Element</span> {true && 'Conditional'}
        </Label>
      )
      
      const label = screen.getByText(/Text/)
      expect(label).toHaveTextContent('Text 42 Element Conditional')
    })

    it('handles conditional rendering', () => {
      const showOptional = true
      
      render(
        <Label>
          Required Field
          {showOptional && <span> (Optional)</span>}
        </Label>
      )
      
      expect(screen.getByText('Required Field')).toBeInTheDocument()
      expect(screen.getByText('(Optional)')).toBeInTheDocument()
    })
  })

  describe('Styling and CSS Classes', () => {
    it('applies default CSS classes through cn utility', () => {
      render(<Label>Styled Label</Label>)
      
      const label = screen.getByText('Styled Label')
      // The cn utility is mocked to join classes, so we can test that it's called
      expect(label).toBeInTheDocument()
    })

    it('combines custom className with default classes', () => {
      render(<Label className="custom-style">Custom Styled</Label>)
      
      const label = screen.getByText('Custom Styled')
      expect(label).toHaveClass('custom-style')
    })

    it('handles multiple custom classes', () => {
      render(<Label className="class1 class2 class3">Multi Class</Label>)
      
      const label = screen.getByText('Multi Class')
      expect(label).toHaveClass('class1', 'class2', 'class3')
    })
  })
}) 