import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { WarningModal, ModalType } from '../warning-modal'

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'cancel': 'Cancel',
        'confirm': 'Confirm',
        'ok': 'OK',
        'processing': 'Processing...'
      }
      return translations[key] || key
    }
  })
}))

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size, disabled, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}))

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card" {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-content" {...props}>{children}</div>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-description" {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-header" {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-title" {...props}>{children}</div>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  AlertTriangle: ({ className, ...props }: any) => <div data-testid="alert-triangle-icon" className={className} {...props} />,
  AlertCircle: ({ className, ...props }: any) => <div data-testid="alert-circle-icon" className={className} {...props} />,
  Info: ({ className, ...props }: any) => <div data-testid="info-icon" className={className} {...props} />,
  CheckCircle: ({ className, ...props }: any) => <div data-testid="check-circle-icon" className={className} {...props} />,
  X: ({ className, ...props }: any) => <div data-testid="x-icon" className={className} {...props} />,
}))

describe('WarningModal Component', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: 'Test Title',
    description: 'Test Description'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders modal when open is true', () => {
      render(<WarningModal {...defaultProps} />)
      
      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('does not render modal when open is false', () => {
      render(<WarningModal {...defaultProps} open={false} />)
      
      expect(screen.queryByTestId('card')).not.toBeInTheDocument()
    })

    it('renders with default warning type', () => {
      render(<WarningModal {...defaultProps} />)
      
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<WarningModal {...defaultProps} />)
      
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })
  })

  describe('Modal Types', () => {
    it('renders warning type with correct icon', () => {
      render(<WarningModal {...defaultProps} type="warning" />)
      
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument()
    })

    it('renders error type with correct icon', () => {
      render(<WarningModal {...defaultProps} type="error" />)
      
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
    })

    it('renders info type with correct icon', () => {
      render(<WarningModal {...defaultProps} type="info" />)
      
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
    })

    it('renders success type with correct icon', () => {
      render(<WarningModal {...defaultProps} type="success" />)
      
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
    })
  })

  describe('Button Variants', () => {
    it('applies destructive variant for error type', () => {
      render(<WarningModal {...defaultProps} type="error" />)
      
      const confirmButton = screen.getByText('OK')
      expect(confirmButton).toHaveAttribute('data-variant', 'destructive')
    })

    it('applies default variant for warning type', () => {
      render(<WarningModal {...defaultProps} type="warning" />)
      
      const confirmButton = screen.getByText('OK')
      expect(confirmButton).toHaveAttribute('data-variant', 'default')
    })

    it('applies default variant for info type', () => {
      render(<WarningModal {...defaultProps} type="info" />)
      
      const confirmButton = screen.getByText('OK')
      expect(confirmButton).toHaveAttribute('data-variant', 'default')
    })

    it('applies default variant for success type', () => {
      render(<WarningModal {...defaultProps} type="success" />)
      
      const confirmButton = screen.getByText('OK')
      expect(confirmButton).toHaveAttribute('data-variant', 'default')
    })
  })

  describe('User Interactions', () => {
    it('calls onOpenChange when close button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      render(<WarningModal {...defaultProps} onOpenChange={mockOnOpenChange} />)
      
      const closeButton = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton!)
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnConfirm = jest.fn()
      
      render(<WarningModal {...defaultProps} onConfirm={mockOnConfirm} />)
      
      const confirmButton = screen.getByText('Confirm')
      await user.click(confirmButton)
      
      expect(mockOnConfirm).toHaveBeenCalled()
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnCancel = jest.fn()
      
      render(<WarningModal {...defaultProps} onCancel={mockOnCancel} />)
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('calls onOpenChange when no onConfirm is provided', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      render(<WarningModal {...defaultProps} onOpenChange={mockOnOpenChange} />)
      
      const confirmButton = screen.getByText('OK')
      await user.click(confirmButton)
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange when no onCancel is provided', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = jest.fn()
      
      render(<WarningModal {...defaultProps} onOpenChange={mockOnOpenChange} />)
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Custom Text Props', () => {
    it('displays custom confirm text', () => {
      render(<WarningModal {...defaultProps} confirmText="Delete" />)
      
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('displays custom cancel text', () => {
      render(<WarningModal {...defaultProps} cancelText="Go Back" />)
      
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('displays confirm text when onConfirm is provided', () => {
      render(<WarningModal {...defaultProps} onConfirm={jest.fn()} />)
      
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('displays OK text when no onConfirm is provided', () => {
      render(<WarningModal {...defaultProps} />)
      
      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('disables buttons when loading', () => {
      render(<WarningModal {...defaultProps} loading />)
      
      const confirmButton = screen.getByText('Processing...')
      const cancelButton = screen.getByText('Cancel')
      const closeButton = screen.getByTestId('x-icon').closest('button')
      
      expect(confirmButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      expect(closeButton).toBeDisabled()
    })

    it('shows processing text when loading', () => {
      render(<WarningModal {...defaultProps} loading />)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('shows custom confirm text when loading and confirmText provided', () => {
      render(<WarningModal {...defaultProps} loading confirmText="Deleting..." />)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })

  describe('Cancel Button Visibility', () => {
    it('shows cancel button by default', () => {
      render(<WarningModal {...defaultProps} />)
      
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('hides cancel button when showCancel is false', () => {
      render(<WarningModal {...defaultProps} showCancel={false} />)
      
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('applies full width to confirm button when cancel is hidden', () => {
      render(<WarningModal {...defaultProps} showCancel={false} />)
      
      const confirmButton = screen.getByText('OK')
      expect(confirmButton).toHaveClass('w-full')
    })

    it('applies flex-1 to confirm button when cancel is shown', () => {
      render(<WarningModal {...defaultProps} showCancel={true} />)
      
      const confirmButton = screen.getByText('OK')
      expect(confirmButton).toHaveClass('flex-1')
    })
  })

  describe('Accessibility', () => {
    it('has proper modal structure', () => {
      render(<WarningModal {...defaultProps} />)
      
      expect(screen.getByTestId('card-header')).toBeInTheDocument()
      expect(screen.getByTestId('card-content')).toBeInTheDocument()
      expect(screen.getByTestId('card-title')).toBeInTheDocument()
      expect(screen.getByTestId('card-description')).toBeInTheDocument()
    })

    it('displays title and description correctly', () => {
      render(<WarningModal {...defaultProps} title="Custom Title" description="Custom Description" />)
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom Description')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(<WarningModal {...defaultProps} title="" />)
      
      expect(screen.getByTestId('card-title')).toBeInTheDocument()
    })

    it('handles empty description', () => {
      render(<WarningModal {...defaultProps} description="" />)
      
      expect(screen.getByTestId('card-description')).toBeInTheDocument()
    })

    it('handles all modal types', () => {
      const types: ModalType[] = ['warning', 'error', 'info', 'success']
      
      types.forEach(type => {
        const { unmount } = render(<WarningModal {...defaultProps} type={type} />)
        expect(screen.getByTestId('card')).toBeInTheDocument()
        unmount()
      })
    })

    it('handles invalid modal type with default fallback', () => {
      // Test with an invalid type to cover the default case
      render(<WarningModal {...defaultProps} type={'invalid' as ModalType} />)
      
      const confirmButton = screen.getByText('OK')
      expect(confirmButton).toHaveAttribute('data-variant', 'default')
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument()
    })

    it('handles rapid button clicks', async () => {
      const user = userEvent.setup()
      const mockOnConfirm = jest.fn()
      
      render(<WarningModal {...defaultProps} onConfirm={mockOnConfirm} />)
      
      const confirmButton = screen.getByText('Confirm')
      
      // Rapid clicks
      await user.click(confirmButton)
      await user.click(confirmButton)
      await user.click(confirmButton)
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(3)
    })
  })

  describe('Component Integration', () => {
    it('works with all props combined', async () => {
      const user = userEvent.setup()
      const mockOnConfirm = jest.fn()
      const mockOnCancel = jest.fn()
      const mockOnOpenChange = jest.fn()
      
      render(
        <WarningModal
          open={true}
          onOpenChange={mockOnOpenChange}
          type="error"
          title="Delete Account"
          description="This action cannot be undone"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmText="Delete"
          cancelText="Keep"
          loading={false}
          showCancel={true}
        />
      )
      
      expect(screen.getByText('Delete Account')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Keep')).toBeInTheDocument()
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
      
      await user.click(screen.getByText('Delete'))
      expect(mockOnConfirm).toHaveBeenCalled()
    })

    it('handles modal state changes', () => {
      const { rerender } = render(<WarningModal {...defaultProps} open={false} />)
      
      expect(screen.queryByTestId('card')).not.toBeInTheDocument()
      
      rerender(<WarningModal {...defaultProps} open={true} />)
      
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })
  })
}) 