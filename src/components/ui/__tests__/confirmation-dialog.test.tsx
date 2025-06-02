import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { ConfirmationDialog, useConfirmationDialog } from '../confirmation-dialog'

// Mock the dependencies
jest.mock('../dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    open ? (
      <div data-testid="dialog" onClick={() => onOpenChange(false)}>
        {children}
      </div>
    ) : null
  ),
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogDescription: ({ children, className }: any) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  DialogFooter: ({ children, className }: any) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
}))

jest.mock('../button', () => ({
  Button: ({ children, onClick, variant, disabled, className, ...props }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: any) => (
    <div data-testid="alert-triangle-icon" className={className} />
  ),
  CheckCircle: ({ className }: any) => (
    <div data-testid="check-circle-icon" className={className} />
  ),
  XCircle: ({ className }: any) => (
    <div data-testid="x-circle-icon" className={className} />
  ),
}))

describe('ConfirmationDialog Component', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders dialog when open is true', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    })

    it('does not render dialog when open is false', () => {
      render(<ConfirmationDialog {...defaultProps} open={false} />)

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })

    it('renders with default button texts', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('renders with custom button texts', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmText="Delete"
          cancelText="Keep"
        />
      )

      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Keep')).toBeInTheDocument()
    })

    it('applies correct CSS classes to content', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('sm:max-w-md')
    })
  })

  describe('Variants and Icons', () => {
    it('renders default variant with CheckCircle icon', () => {
      render(<ConfirmationDialog {...defaultProps} variant="default" />)

      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
      expect(screen.getByTestId('check-circle-icon')).toHaveClass('text-primary')
    })

    it('renders destructive variant with XCircle icon', () => {
      render(<ConfirmationDialog {...defaultProps} variant="destructive" />)

      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument()
      expect(screen.getByTestId('x-circle-icon')).toHaveClass('text-destructive')
    })

    it('renders warning variant with AlertTriangle icon', () => {
      render(<ConfirmationDialog {...defaultProps} variant="warning" />)

      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument()
      expect(screen.getByTestId('alert-triangle-icon')).toHaveClass('text-yellow-500')
    })

    it('applies correct button variant for destructive', () => {
      render(<ConfirmationDialog {...defaultProps} variant="destructive" />)

      const confirmButton = screen.getByText('Confirm')
      expect(confirmButton).toHaveAttribute('data-variant', 'destructive')
    })

    it('applies default button variant for non-destructive', () => {
      render(<ConfirmationDialog {...defaultProps} variant="warning" />)

      const confirmButton = screen.getByText('Confirm')
      expect(confirmButton).toHaveAttribute('data-variant', 'default')
    })
  })

  describe('User Interactions', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnConfirm = jest.fn()

      render(<ConfirmationDialog {...defaultProps} onConfirm={mockOnConfirm} />)

      const confirmButton = screen.getByText('Confirm')
      await user.click(confirmButton)

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel and onOpenChange when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnCancel = jest.fn()
      const mockOnOpenChange = jest.fn()

      render(
        <ConfirmationDialog
          {...defaultProps}
          onCancel={mockOnCancel}
          onOpenChange={mockOnOpenChange}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls only onOpenChange when cancel button is clicked without onCancel', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()

      render(
        <ConfirmationDialog
          {...defaultProps}
          onOpenChange={mockOnOpenChange}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange when dialog backdrop is clicked', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()

      render(
        <ConfirmationDialog
          {...defaultProps}
          onOpenChange={mockOnOpenChange}
        />
      )

      const dialog = screen.getByTestId('dialog')
      await user.click(dialog)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Loading State', () => {
    it('disables buttons when loading is true', () => {
      render(<ConfirmationDialog {...defaultProps} loading={true} />)

      const confirmButton = screen.getByText('Processing...')
      const cancelButton = screen.getByText('Cancel')

      expect(confirmButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    it('shows "Processing..." text when loading', () => {
      render(<ConfirmationDialog {...defaultProps} loading={true} />)

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
    })

    it('shows normal confirm text when not loading', () => {
      render(<ConfirmationDialog {...defaultProps} loading={false} />)

      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument()
    })

    it('enables buttons when loading is false', () => {
      render(<ConfirmationDialog {...defaultProps} loading={false} />)

      const confirmButton = screen.getByText('Confirm')
      const cancelButton = screen.getByText('Cancel')

      expect(confirmButton).not.toBeDisabled()
      expect(cancelButton).not.toBeDisabled()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct header layout with icon and title', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const header = screen.getByTestId('dialog-header')
      expect(header).toBeInTheDocument()

      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveClass('text-lg', 'font-semibold')
    })

    it('applies correct description styling', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveClass('text-muted-foreground', 'mt-2')
    })

    it('applies correct footer layout', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const footer = screen.getByTestId('dialog-footer')
      expect(footer).toHaveClass('flex-col-reverse', 'sm:flex-row', 'gap-2')
    })

    it('applies correct button styling', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const cancelButton = screen.getByText('Cancel')
      const confirmButton = screen.getByText('Confirm')

      expect(cancelButton).toHaveClass('w-full', 'sm:w-auto')
      expect(confirmButton).toHaveClass('w-full', 'sm:w-auto')
    })
  })
})

// Test component for useConfirmationDialog hook
function TestHookComponent() {
  const { showConfirmation, setLoading, ConfirmationDialog } = useConfirmationDialog()

  return (
    <div>
      <button
        onClick={() =>
          showConfirmation({
            title: 'Delete Item',
            description: 'This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'destructive',
            onConfirm: () => console.log('Confirmed'),
            onCancel: () => console.log('Cancelled'),
          })
        }
      >
        Show Dialog
      </button>
      <button onClick={() => setLoading(true)}>Set Loading</button>
      <button onClick={() => setLoading(false)}>Clear Loading</button>
      {ConfirmationDialog}
    </div>
  )
}

describe('useConfirmationDialog Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Hook Functionality', () => {
    it('initially returns null ConfirmationDialog', () => {
      render(<TestHookComponent />)

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })

    it('shows dialog when showConfirmation is called', async () => {
      const user = userEvent.setup()
      render(<TestHookComponent />)

      const showButton = screen.getByText('Show Dialog')
      await user.click(showButton)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByText('Delete Item')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    it('applies correct configuration from showConfirmation', async () => {
      const user = userEvent.setup()
      render(<TestHookComponent />)

      const showButton = screen.getByText('Show Dialog')
      await user.click(showButton)

      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument()
    })

    it('closes dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<TestHookComponent />)

      const showButton = screen.getByText('Show Dialog')
      await user.click(showButton)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
      })
    })

    it('closes dialog when onOpenChange is called with false', async () => {
      const user = userEvent.setup()
      render(<TestHookComponent />)

      const showButton = screen.getByText('Show Dialog')
      await user.click(showButton)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()

      const dialog = screen.getByTestId('dialog')
      await user.click(dialog)

      await waitFor(() => {
        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
      })
    })

    it('updates loading state when setLoading is called', async () => {
      const user = userEvent.setup()
      render(<TestHookComponent />)

      const showButton = screen.getByText('Show Dialog')
      await user.click(showButton)

      const setLoadingButton = screen.getByText('Set Loading')
      await user.click(setLoadingButton)

      expect(screen.getByText('Processing...')).toBeInTheDocument()

      const clearLoadingButton = screen.getByText('Clear Loading')
      await user.click(clearLoadingButton)

      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument()
    })

    it('handles setLoading when dialog is not open', async () => {
      const user = userEvent.setup()
      render(<TestHookComponent />)

      const setLoadingButton = screen.getByText('Set Loading')
      await user.click(setLoadingButton)

      // Should not throw error
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Hook Configuration Options', () => {
    it('supports all variant types', async () => {
      const user = userEvent.setup()
      
      function TestVariants() {
        const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

        return (
          <div>
            <button
              onClick={() =>
                showConfirmation({
                  title: 'Warning',
                  description: 'Warning message',
                  variant: 'warning',
                  onConfirm: () => {},
                })
              }
            >
              Show Warning
            </button>
            {ConfirmationDialog}
          </div>
        )
      }

      render(<TestVariants />)

      const showButton = screen.getByText('Show Warning')
      await user.click(showButton)

      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument()
    })

    it('supports custom button texts', async () => {
      const user = userEvent.setup()
      
      function TestCustomTexts() {
        const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

        return (
          <div>
            <button
              onClick={() =>
                showConfirmation({
                  title: 'Custom',
                  description: 'Custom message',
                  confirmText: 'Proceed',
                  cancelText: 'Abort',
                  onConfirm: () => {},
                })
              }
            >
              Show Custom
            </button>
            {ConfirmationDialog}
          </div>
        )
      }

      render(<TestCustomTexts />)

      const showButton = screen.getByText('Show Custom')
      await user.click(showButton)

      expect(screen.getByText('Proceed')).toBeInTheDocument()
      expect(screen.getByText('Abort')).toBeInTheDocument()
    })

    it('handles missing onCancel callback', async () => {
      const user = userEvent.setup()
      
      function TestNoCancel() {
        const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

        return (
          <div>
            <button
              onClick={() =>
                showConfirmation({
                  title: 'No Cancel',
                  description: 'No cancel callback',
                  onConfirm: () => {},
                })
              }
            >
              Show No Cancel
            </button>
            {ConfirmationDialog}
          </div>
        )
      }

      render(<TestNoCancel />)

      const showButton = screen.getByText('Show No Cancel')
      await user.click(showButton)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid show/hide operations', async () => {
      const user = userEvent.setup()
      render(<TestHookComponent />)

      const showButton = screen.getByText('Show Dialog')
      
      // Rapid clicks
      await user.click(showButton)
      await user.click(showButton)
      await user.click(showButton)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })

    it('handles empty title and description', async () => {
      const user = userEvent.setup()
      
      function TestEmpty() {
        const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()

        return (
          <div>
            <button
              onClick={() =>
                showConfirmation({
                  title: '',
                  description: '',
                  onConfirm: () => {},
                })
              }
            >
              Show Empty
            </button>
            {ConfirmationDialog}
          </div>
        )
      }

      render(<TestEmpty />)

      const showButton = screen.getByText('Show Empty')
      await user.click(showButton)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
  })
}) 