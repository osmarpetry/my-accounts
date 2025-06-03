import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { ToastProvider, useToast } from '../toast'

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  X: ({ className, ...props }: any) => <div data-testid="x-icon" className={className} {...props} />,
  CheckCircle: ({ className, ...props }: any) => <div data-testid="check-circle-icon" className={className} {...props} />,
  AlertCircle: ({ className, ...props }: any) => <div data-testid="alert-circle-icon" className={className} {...props} />,
  Info: ({ className, ...props }: any) => <div data-testid="info-icon" className={className} {...props} />,
  ArrowUp: ({ className, ...props }: any) => <div data-testid="arrow-up-icon" className={className} {...props} />,
  Check: ({ className, ...props }: any) => <div data-testid="check-icon" className={className} {...props} />,
  Trash2: ({ className, ...props }: any) => <div data-testid="trash2-icon" className={className} {...props} />,
  ArrowRightLeft: ({ className, ...props }: any) => <div data-testid="arrow-right-left-icon" className={className} {...props} />,
  Plus: ({ className, ...props }: any) => <div data-testid="plus-icon" className={className} {...props} />,
  Edit: ({ className, ...props }: any) => <div data-testid="edit-icon" className={className} {...props} />,
}))

// Mock createPortal to render in the same container
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

// Mock window.scrollTo
const mockScrollTo = jest.fn()
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
})

// Test component that uses the toast hook
function TestComponent() {
  const {
    showToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showDeleteSuccess,
    showTransferSuccess,
    showCreateSuccess,
    showUpdateSuccess,
    showScrollToTop,
    hideScrollToTop,
  } = useToast()

  return (
    <div>
      <button onClick={() => showToast({ type: 'success', title: 'Custom toast' })}>
        Show Custom Toast
      </button>
      <button onClick={() => showSuccessToast('Success message')}>
        Show Success
      </button>
      <button onClick={() => showSuccessToast('Success with description', 'This is a description')}>
        Show Success with Description
      </button>
      <button onClick={() => showErrorToast('Error message')}>
        Show Error
      </button>
      <button onClick={() => showErrorToast('Error with description', 'This is an error description')}>
        Show Error with Description
      </button>
      <button onClick={() => showInfoToast('Info message')}>
        Show Info
      </button>
      <button onClick={() => showInfoToast('Info with description', 'This is an info description')}>
        Show Info with Description
      </button>
      <button onClick={() => showDeleteSuccess('Savings Account', '12345')}>
        Show Delete Success
      </button>
      <button onClick={() => showTransferSuccess('Checking', 'Savings', '$100.00')}>
        Show Transfer Success
      </button>
      <button onClick={() => showCreateSuccess('New Account')}>
        Show Create Success
      </button>
      <button onClick={() => showUpdateSuccess('Updated Account')}>
        Show Update Success
      </button>
      <button onClick={() => showScrollToTop()}>
        Show Scroll to Top
      </button>
      <button onClick={() => hideScrollToTop()}>
        Hide Scroll to Top
      </button>
      <button onClick={() => showToast({ 
        type: 'warning', 
        title: 'Warning message',
        description: 'Warning description',
        duration: 5000
      })}>
        Show Warning
      </button>
      <button onClick={() => showToast({ 
        type: 'info', 
        title: 'Info with action',
        action: { label: 'Action', onClick: () => console.log('Action clicked') }
      })}>
        Show Info with Action
      </button>
    </div>
  )
}

describe('Toast Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('ToastProvider Component', () => {
    it('renders children correctly', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child content</div>
        </ToastProvider>
      )
      
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('provides toast context to children', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      expect(screen.getByText('Show Custom Toast')).toBeInTheDocument()
      expect(screen.getByText('Show Success')).toBeInTheDocument()
    })

    it('handles client-side mounting correctly', () => {
      const { rerender } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Initially should render without portal content
      expect(screen.getByText('Show Custom Toast')).toBeInTheDocument()
      
      // After mounting, should still work
      rerender(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      expect(screen.getByText('Show Custom Toast')).toBeInTheDocument()
    })
  })

  describe('useToast Hook', () => {
    it('throws error when used outside ToastProvider', () => {
      const TestComponentWithoutProvider = () => {
        const { showToast } = useToast()
        return <div>Test</div>
      }
      
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponentWithoutProvider />)
      }).toThrow('useToast must be used within a ToastProvider')
      
      consoleSpy.mockRestore()
    })

    it('provides all toast methods', () => {
      let toastMethods: any = null
      
      const TestComponentForMethods = () => {
        toastMethods = useToast()
        return <div>Test</div>
      }
      
      render(
        <ToastProvider>
          <TestComponentForMethods />
        </ToastProvider>
      )
      
      expect(toastMethods).toHaveProperty('showToast')
      expect(toastMethods).toHaveProperty('showSuccessToast')
      expect(toastMethods).toHaveProperty('showErrorToast')
      expect(toastMethods).toHaveProperty('showInfoToast')
      expect(toastMethods).toHaveProperty('showDeleteSuccess')
      expect(toastMethods).toHaveProperty('showTransferSuccess')
      expect(toastMethods).toHaveProperty('showCreateSuccess')
      expect(toastMethods).toHaveProperty('showUpdateSuccess')
      expect(toastMethods).toHaveProperty('showScrollToTop')
      expect(toastMethods).toHaveProperty('hideScrollToTop')
    })
  })

  describe('Toast Display and Functionality', () => {
    it('displays custom toast with correct content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Custom Toast')
      await user.click(button)
      
      expect(screen.getByText('Custom toast')).toBeInTheDocument()
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('displays success toast with correct styling and icon', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Success')
      await user.click(button)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
      
      // Find the toast container (parent of the text element)
      const toastElement = screen.getByText('Success message').closest('[class*="bg-green-500"]')
      expect(toastElement).toBeInTheDocument()
    })

    it('displays success toast with description', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Success with Description')
      await user.click(button)
      
      expect(screen.getByText('Success with description')).toBeInTheDocument()
      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('displays error toast with correct styling and icon', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Error')
      await user.click(button)
      
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
      
      // Find the toast container (parent of the text element)
      const toastElement = screen.getByText('Error message').closest('[class*="bg-red-500"]')
      expect(toastElement).toBeInTheDocument()
    })

    it('displays error toast with description', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Error with Description')
      await user.click(button)
      
      expect(screen.getByText('Error with description')).toBeInTheDocument()
      expect(screen.getByText('This is an error description')).toBeInTheDocument()
    })

    it('displays info toast with correct styling and icon', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Info')
      await user.click(button)
      
      expect(screen.getByText('Info message')).toBeInTheDocument()
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
      
      // Find the toast container (parent of the text element)
      const toastElement = screen.getByText('Info message').closest('[class*="bg-blue-500"]')
      expect(toastElement).toBeInTheDocument()
    })

    it('displays info toast with description', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Info with Description')
      await user.click(button)
      
      expect(screen.getByText('Info with description')).toBeInTheDocument()
      expect(screen.getByText('This is an info description')).toBeInTheDocument()
    })

    it('displays warning toast with correct styling and icon', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Warning')
      await user.click(button)
      
      expect(screen.getByText('Warning message')).toBeInTheDocument()
      expect(screen.getByText('Warning description')).toBeInTheDocument()
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
      
      // Find the toast container (parent of the text element)
      const toastElement = screen.getByText('Warning message').closest('[class*="bg-yellow-500"]')
      expect(toastElement).toBeInTheDocument()
    })
  })

  describe('Specific Action Success Toasts', () => {
    it('displays delete success toast with trash icon', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Delete Success')
      await user.click(button)
      
      expect(screen.getByText('Savings Account #12345 deleted!')).toBeInTheDocument()
      expect(screen.getByTestId('trash2-icon')).toBeInTheDocument()
    })

    it('displays transfer success toast with transfer icon', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Transfer Success')
      await user.click(button)
      
      expect(screen.getByText('$100.00 transferred successfully!')).toBeInTheDocument()
      expect(screen.getByText('From Checking to Savings')).toBeInTheDocument()
      expect(screen.getByTestId('arrow-right-left-icon')).toBeInTheDocument()
    })

    it('displays create success toast with plus icon', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Create Success')
      await user.click(button)
      
      expect(screen.getByText('New Account created successfully!')).toBeInTheDocument()
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
    })

    it('displays update success toast with edit icon', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Update Success')
      await user.click(button)
      
      expect(screen.getByText('Updated Account updated successfully!')).toBeInTheDocument()
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
    })
  })

  describe('Toast Interaction and Removal', () => {
    it('allows manual toast dismissal via close button', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Success')
      await user.click(button)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      
      const closeButton = screen.getByTestId('x-icon').closest('button')
      expect(closeButton).toBeInTheDocument()
      
      await user.click(closeButton!)
      
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })

    it('auto-removes toast after default duration', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Success')
      await user.click(button)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      
      // Fast-forward time by 3000ms (default success duration)
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument()
      })
    })

    it('auto-removes error toast after longer duration', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Error')
      await user.click(button)
      
      expect(screen.getByText('Error message')).toBeInTheDocument()
      
      // Fast-forward time by 4000ms (error duration)
      act(() => {
        jest.advanceTimersByTime(4000)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('Error message')).not.toBeInTheDocument()
      })
    })

    it('auto-removes toast with custom duration', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Warning')
      await user.click(button)
      
      expect(screen.getByText('Warning message')).toBeInTheDocument()
      
      // Fast-forward time by 5000ms (custom duration)
      act(() => {
        jest.advanceTimersByTime(5000)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('Warning message')).not.toBeInTheDocument()
      })
    })

    it('displays multiple toasts simultaneously', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const successButton = screen.getByText('Show Success')
      const errorButton = screen.getByText('Show Error')
      
      await user.click(successButton)
      await user.click(errorButton)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  // describe('Scroll to Top Functionality', () => {
  //   it('shows scroll to top button when requested', async () => {
  //     const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
  //     render(
  //       <ToastProvider>
  //         <TestComponent />
  //       </ToastProvider>
  //     )
      
  //     const button = screen.getByText('Show Scroll to Top')
  //     await user.click(button)
      
  //     expect(screen.getByText('Back to top')).toBeInTheDocument()
  //     expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()
  //   })

  //   it('hides scroll to top button when requested', async () => {
  //     const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
  //     render(
  //       <ToastProvider>
  //         <TestComponent />
  //       </ToastProvider>
  //     )
      
  //     // First show the button
  //     const showButton = screen.getByText('Show Scroll to Top')
  //     await user.click(showButton)
      
  //     expect(screen.getByText('Back to top')).toBeInTheDocument()
      
  //     // Then hide it
  //     const hideButton = screen.getByText('Hide Scroll to Top')
  //     await user.click(hideButton)
      
  //     expect(screen.queryByText('Back to top')).not.toBeInTheDocument()
  //   })

  //   it('scrolls to top and hides button when clicked', async () => {
  //     const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
  //     render(
  //       <ToastProvider>
  //         <TestComponent />
  //       </ToastProvider>
  //     )
      
  //     // Show the scroll to top button
  //     const showButton = screen.getByText('Show Scroll to Top')
  //     await user.click(showButton)
      
  //     const scrollButton = screen.getByText('Back to top')
  //     expect(scrollButton).toBeInTheDocument()
      
  //     // Click the scroll to top button
  //     await user.click(scrollButton)
      
  //     expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  //     expect(screen.queryByText('Back to top')).not.toBeInTheDocument()
  //   })
  // })

  describe('Toast Icon Logic', () => {
    it('displays correct icons for different success actions', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Test delete action
      await user.click(screen.getByText('Show Delete Success'))
      expect(screen.getByTestId('trash2-icon')).toBeInTheDocument()
      
      // Clear and test transfer action
      const closeButton1 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton1!)
      
      await user.click(screen.getByText('Show Transfer Success'))
      expect(screen.getByTestId('arrow-right-left-icon')).toBeInTheDocument()
      
      // Clear and test create action
      const closeButton2 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton2!)
      
      await user.click(screen.getByText('Show Create Success'))
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
      
      // Clear and test update action
      const closeButton3 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton3!)
      
      await user.click(screen.getByText('Show Update Success'))
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
      
      // Clear and test generic success
      const closeButton4 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton4!)
      
      await user.click(screen.getByText('Show Success'))
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('displays correct icons for different toast types', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Test error icon
      await user.click(screen.getByText('Show Error'))
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
      
      // Clear and test warning icon
      const closeButton1 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton1!)
      
      await user.click(screen.getByText('Show Warning'))
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
      
      // Clear and test info icon
      const closeButton2 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton2!)
      
      await user.click(screen.getByText('Show Info'))
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
    })
  })

  describe('Toast Styling', () => {
    it('applies correct styles for different toast types', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Test success styling
      await user.click(screen.getByText('Show Success'))
      let toastElement = screen.getByText('Success message').closest('[class*="bg-green-500"]')
      expect(toastElement).toBeInTheDocument()
      
      // Clear and test error styling
      const closeButton1 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton1!)
      
      await user.click(screen.getByText('Show Error'))
      toastElement = screen.getByText('Error message').closest('[class*="bg-red-500"]')
      expect(toastElement).toBeInTheDocument()
      
      // Clear and test warning styling
      const closeButton2 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton2!)
      
      await user.click(screen.getByText('Show Warning'))
      toastElement = screen.getByText('Warning message').closest('[class*="bg-yellow-500"]')
      expect(toastElement).toBeInTheDocument()
      
      // Clear and test info styling
      const closeButton3 = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton3!)
      
      await user.click(screen.getByText('Show Info'))
      toastElement = screen.getByText('Info message').closest('[class*="bg-blue-500"]')
      expect(toastElement).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles toast with action property', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Info with Action')
      await user.click(button)
      
      expect(screen.getByText('Info with action')).toBeInTheDocument()
      // Action functionality would be tested in integration tests
    })

    it('handles rapid toast creation and removal', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const successButton = screen.getByText('Show Success')
      
      // Create multiple toasts rapidly
      await user.click(successButton)
      await user.click(successButton)
      await user.click(successButton)
      
      // Should handle multiple toasts without errors
      const toasts = screen.getAllByText('Success message')
      expect(toasts.length).toBe(3)
      
      // Remove all toasts
      const closeButtons = screen.getAllByTestId('x-icon')
      for (const closeButton of closeButtons) {
        await user.click(closeButton.closest('button')!)
      }
      
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })

    it('handles empty title and description gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      const TestComponentWithEmptyToast = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast({ type: 'info', title: '' })}>
            Show Empty Toast
          </button>
        )
      }
      
      render(
        <ToastProvider>
          <TestComponentWithEmptyToast />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Empty Toast')
      await user.click(button)
      
      // Should render without crashing, even with empty title
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
    })

    it('handles very long toast content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      const longTitle = 'This is a very long toast title that should be truncated properly'
      const longDescription = 'This is a very long toast description that should also be truncated properly to prevent layout issues'
      
      const TestComponentWithLongToast = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast({ 
            type: 'info', 
            title: longTitle,
            description: longDescription
          })}>
            Show Long Toast
          </button>
        )
      }
      
      render(
        <ToastProvider>
          <TestComponentWithLongToast />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Long Toast')
      await user.click(button)
      
      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longDescription)).toBeInTheDocument()
      
      // Check that truncate classes are applied
      const titleElement = screen.getByText(longTitle)
      const descriptionElement = screen.getByText(longDescription)
      expect(titleElement).toHaveClass('truncate')
      expect(descriptionElement).toHaveClass('truncate')
    })
  })

  describe('Performance and Memory', () => {
    it('cleans up timers when toasts are manually removed', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const button = screen.getByText('Show Success')
      await user.click(button)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      
      // Manually remove toast before auto-removal
      const closeButton = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton!)
      
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
      
      // Fast-forward past the original auto-removal time
      act(() => {
        jest.advanceTimersByTime(5000)
      })
      
      // Should not cause any issues
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })

    it('handles component unmounting gracefully', () => {
      const { unmount } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow()
    })
  })
}) 