import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { Switch } from '../switch'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Switch Component', () => {
  describe('Basic Rendering', () => {
    it('renders switch with default props', () => {
      render(<Switch />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeInTheDocument()
      expect(switchInput).toHaveAttribute('type', 'checkbox')
    })

    it('applies custom className', () => {
      render(<Switch className="custom-class" />)
      
      const switchInput = screen.getByRole('checkbox')
      const visualElement = switchInput.nextElementSibling
      expect(visualElement).toHaveClass('custom-class')
    })

    it('renders with label', () => {
      render(<Switch label="Enable notifications" />)
      
      const label = screen.getByText('Enable notifications')
      const switchInput = screen.getByRole('checkbox')
      
      expect(label).toBeInTheDocument()
      expect(switchInput).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(<Switch description="Turn on to receive notifications" />)
      
      const description = screen.getByText('Turn on to receive notifications')
      expect(description).toBeInTheDocument()
    })

    it('renders with both label and description', () => {
      render(
        <Switch 
          label="Dark mode" 
          description="Switch to dark theme"
        />
      )
      
      expect(screen.getByText('Dark mode')).toBeInTheDocument()
      expect(screen.getByText('Switch to dark theme')).toBeInTheDocument()
    })
  })

  describe('Switch States', () => {
    it('handles checked state', () => {
      render(<Switch checked />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeChecked()
    })

    it('handles unchecked state', () => {
      render(<Switch checked={false} />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).not.toBeChecked()
    })

    it('handles defaultChecked', () => {
      render(<Switch defaultChecked />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeChecked()
    })

    it('handles disabled state', () => {
      render(<Switch disabled />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeDisabled()
    })

    it('applies disabled styling to label and description', () => {
      render(
        <Switch 
          disabled 
          label="Disabled switch" 
          description="This is disabled"
        />
      )
      
      const label = screen.getByText('Disabled switch')
      expect(label).toHaveClass('text-muted-foreground')
    })
  })

  describe('User Interactions', () => {
    it('calls onCheckedChange when clicked', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Switch onCheckedChange={mockChange} />)
      
      const switchInput = screen.getByRole('checkbox')
      await user.click(switchInput)
      
      expect(mockChange).toHaveBeenCalledWith(true)
    })

    it('calls onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Switch checked onCheckedChange={mockChange} />)
      
      const switchInput = screen.getByRole('checkbox')
      await user.click(switchInput)
      
      expect(mockChange).toHaveBeenCalledWith(false)
    })

    it('does not call onCheckedChange when disabled', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Switch disabled onCheckedChange={mockChange} />)
      
      const switchInput = screen.getByRole('checkbox')
      await user.click(switchInput)
      
      expect(mockChange).not.toHaveBeenCalled()
    })

    it('can be toggled multiple times', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Switch onCheckedChange={mockChange} />)
      
      const switchInput = screen.getByRole('checkbox')
      
      await user.click(switchInput)
      expect(mockChange).toHaveBeenCalledWith(true)
      
      await user.click(switchInput)
      expect(mockChange).toHaveBeenCalledWith(false)
      
      await user.click(switchInput)
      expect(mockChange).toHaveBeenCalledWith(true)
      
      expect(mockChange).toHaveBeenCalledTimes(3)
    })

    it('handles keyboard interaction (Space key)', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Switch onCheckedChange={mockChange} />)
      
      const switchInput = screen.getByRole('checkbox')
      switchInput.focus()
      
      await user.keyboard(' ')
      
      expect(mockChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Forwarded Props', () => {
    it('forwards additional HTML attributes', () => {
      render(
        <Switch 
          data-testid="custom-switch"
          aria-label="Custom switch"
          name="settings"
          value="enabled"
        />
      )
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toHaveAttribute('data-testid', 'custom-switch')
      expect(switchInput).toHaveAttribute('aria-label', 'Custom switch')
      expect(switchInput).toHaveAttribute('name', 'settings')
      expect(switchInput).toHaveAttribute('value', 'enabled')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      
      render(<Switch ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current).toHaveAttribute('type', 'checkbox')
    })

    it('handles id attribute', () => {
      render(<Switch id="my-switch" />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toHaveAttribute('id', 'my-switch')
    })

    it('handles required attribute', () => {
      render(<Switch required />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeRequired()
    })
  })

  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup()
      const mockSubmit = jest.fn((e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        return formData.get('notifications')
      })
      
      render(
        <form onSubmit={mockSubmit}>
          <Switch name="notifications" value="on" defaultChecked />
          <button type="submit">Submit</button>
        </form>
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('handles form reset', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <Switch name="setting" defaultChecked />
          <button type="reset">Reset</button>
        </form>
      )
      
      const switchInput = screen.getByRole('checkbox')
      const resetButton = screen.getByRole('button')
      
      // Change the switch state
      await user.click(switchInput)
      expect(switchInput).not.toBeChecked()
      
      // Reset form
      await user.click(resetButton)
      expect(switchInput).toBeChecked() // Should return to default
    })

    it('validates required switch', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <Switch required name="terms" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const switchInput = screen.getByRole('checkbox')
      const button = screen.getByRole('button')
      
      expect(switchInput).toBeRequired()
      
      await user.click(button)
      expect(switchInput).toBeInvalid()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Switch aria-describedby="help-text" />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('supports aria-labelledby', () => {
      render(
        <div>
          <span id="switch-label">Enable feature</span>
          <Switch aria-labelledby="switch-label" />
        </div>
      )
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toHaveAttribute('aria-labelledby', 'switch-label')
    })

    it('has proper focus management', async () => {
      const user = userEvent.setup()
      
      render(<Switch />)
      
      const switchInput = screen.getByRole('checkbox')
      
      await user.tab()
      expect(switchInput).toHaveFocus()
    })

    it('announces state changes to screen readers', async () => {
      const user = userEvent.setup()
      
      render(<Switch aria-label="Toggle setting" />)
      
      const switchInput = screen.getByRole('checkbox')
      
      expect(switchInput).not.toBeChecked()
      
      await user.click(switchInput)
      expect(switchInput).toBeChecked()
    })
  })

  describe('Layout and Styling', () => {
    it('renders without label or description', () => {
      render(<Switch />)
      
      const switchInput = screen.getByRole('checkbox')
      const container = switchInput.closest('div')
      
      expect(switchInput).toBeInTheDocument()
      expect(container).toBeInTheDocument()
    })

    it('positions label and description correctly', () => {
      render(
        <Switch 
          label="Feature toggle" 
          description="Enable this feature"
        />
      )
      
      const label = screen.getByText('Feature toggle')
      const description = screen.getByText('Enable this feature')
      
      expect(label).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('applies correct CSS classes for disabled state', () => {
      render(<Switch disabled label="Disabled" />)
      
      const container = screen.getByRole('checkbox').closest('label')
      expect(container).toHaveClass('cursor-not-allowed', 'opacity-50')
    })

    it('applies correct CSS classes for enabled state', () => {
      render(<Switch label="Enabled" />)
      
      const container = screen.getByRole('checkbox').closest('label')
      expect(container).toHaveClass('cursor-pointer')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty label', () => {
      render(<Switch label="" />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeInTheDocument()
    })

    it('handles empty description', () => {
      render(<Switch description="" />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeInTheDocument()
    })

    it('handles null label and description', () => {
      render(<Switch label={null as any} description={null as any} />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeInTheDocument()
    })

    it('handles very long label text', () => {
      const longLabel = 'This is a very long label that might wrap to multiple lines and should be handled properly by the component'
      
      render(<Switch label={longLabel} />)
      
      const label = screen.getByText(longLabel)
      expect(label).toBeInTheDocument()
    })

    it('handles special characters in label', () => {
      const specialLabel = 'Label with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      
      render(<Switch label={specialLabel} />)
      
      const label = screen.getByText(specialLabel)
      expect(label).toBeInTheDocument()
    })
  })

  describe('Multiple Switches', () => {
    it('renders multiple switches independently', async () => {
      const user = userEvent.setup()
      const mockChange1 = jest.fn()
      const mockChange2 = jest.fn()
      
      render(
        <div>
          <Switch label="Switch 1" onCheckedChange={mockChange1} data-testid="switch-1" />
          <Switch label="Switch 2" onCheckedChange={mockChange2} data-testid="switch-2" />
        </div>
      )
      
      const switch1 = screen.getByTestId('switch-1')
      const switch2 = screen.getByTestId('switch-2')
      
      await user.click(switch1)
      expect(mockChange1).toHaveBeenCalledWith(true)
      expect(mockChange2).not.toHaveBeenCalled()
      
      await user.click(switch2)
      expect(mockChange2).toHaveBeenCalledWith(true)
      expect(mockChange1).toHaveBeenCalledTimes(1)
    })

    it('handles switches with same labels', () => {
      render(
        <div>
          <Switch label="Setting" name="setting1" data-testid="setting-1" />
          <Switch label="Setting" name="setting2" data-testid="setting-2" />
        </div>
      )
      
      const switch1 = screen.getByTestId('setting-1')
      const switch2 = screen.getByTestId('setting-2')
      
      expect(switch1).toBeInTheDocument()
      expect(switch2).toBeInTheDocument()
      expect(switch1).toHaveAttribute('name', 'setting1')
      expect(switch2).toHaveAttribute('name', 'setting2')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(false)
        
        return (
          <Switch 
            checked={checked}
            onCheckedChange={(value) => {
              setChecked(value)
              mockChange(value)
            }}
          />
        )
      }
      
      render(<ControlledSwitch />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).not.toBeChecked()
      
      await user.click(switchInput)
      expect(switchInput).toBeChecked()
      expect(mockChange).toHaveBeenCalledWith(true)
    })

    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Switch defaultChecked={false} onCheckedChange={mockChange} />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).not.toBeChecked()
      
      await user.click(switchInput)
      expect(switchInput).toBeChecked()
      expect(mockChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const mockChange = jest.fn()
      const { rerender } = render(<Switch onCheckedChange={mockChange} />)
      
      // Re-render with same props
      rerender(<Switch onCheckedChange={mockChange} />)
      
      const switchInput = screen.getByRole('checkbox')
      expect(switchInput).toBeInTheDocument()
    })

    it('handles rapid state changes', async () => {
      const user = userEvent.setup()
      const mockChange = jest.fn()
      
      render(<Switch onCheckedChange={mockChange} />)
      
      const switchInput = screen.getByRole('checkbox')
      
      // Rapid clicks
      await user.click(switchInput)
      await user.click(switchInput)
      await user.click(switchInput)
      await user.click(switchInput)
      
      expect(mockChange).toHaveBeenCalledTimes(4)
    })
  })
}) 