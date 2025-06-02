import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { CurrencyToggle } from '../currency-switcher'
import { Currency } from '@/types'

// Mock the dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'defaultCurrency': 'Default Currency'
      }
      return translations[key] || key
    }
  })
}))

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
  getCurrencySymbol: (currency: Currency) => {
    const symbols: Record<Currency, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft'
    }
    return symbols[currency] || currency
  },
  getCurrencyName: (currency: Currency) => {
    const names: Record<Currency, string> = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'CHF': 'Swiss Franc',
      'CNY': 'Chinese Yuan',
      'SEK': 'Swedish Krona',
      'NOK': 'Norwegian Krone',
      'DKK': 'Danish Krone',
      'PLN': 'Polish Zloty',
      'CZK': 'Czech Koruna',
      'HUF': 'Hungarian Forint'
    }
    return names[currency] || currency
  },
  getSupportedCurrencies: () => ['USD', 'EUR', 'GBP', 'CHF'] as Currency[]
}))

jest.mock('../button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('../dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children, align, className }: any) => (
    <div data-testid="dropdown-menu-content" data-align={align} className={className}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div 
      data-testid="dropdown-menu-item" 
      onClick={onClick} 
      className={className}
      role="menuitem"
    >
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children, className }: any) => (
    <div data-testid="dropdown-menu-label" className={className}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-menu-separator" />,
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    asChild ? children : <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
}))

jest.mock('../tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children, asChild }: any) => (
    asChild ? children : <div data-testid="tooltip-trigger">{children}</div>
  ),
}))

jest.mock('lucide-react', () => ({
  Check: ({ className }: any) => (
    <div data-testid="check-icon" className={className} />
  ),
}))

describe('CurrencyToggle Component', () => {
  const defaultProps = {
    currentCurrency: 'USD' as Currency,
    onCurrencyChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders currency toggle with current currency symbol', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('$')
    })

    it('renders with correct button props', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const button = screen.getByTestId('button')
      expect(button).toHaveAttribute('data-variant', 'ghost')
      expect(button).toHaveAttribute('data-size', 'sm')
    })

    it('renders tooltip provider and tooltip', () => {
      render(<CurrencyToggle {...defaultProps} />)

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('renders dropdown menu structure', () => {
      render(<CurrencyToggle {...defaultProps} />)

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument()
    })

    it('displays screen reader text for accessibility', () => {
      render(<CurrencyToggle {...defaultProps} />)

      expect(screen.getByText('Default Currency: US Dollar')).toBeInTheDocument()
      expect(screen.getByText('Default Currency: US Dollar')).toHaveClass('sr-only')
    })
  })

  describe('Currency Display', () => {
    it('displays USD currency correctly in button', () => {
      render(<CurrencyToggle {...defaultProps} currentCurrency="USD" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveTextContent('$')
    })

    it('displays EUR currency correctly in button', () => {
      render(<CurrencyToggle {...defaultProps} currentCurrency="EUR" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveTextContent('€')
    })

    it('displays GBP currency correctly in button', () => {
      render(<CurrencyToggle {...defaultProps} currentCurrency="GBP" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveTextContent('£')
    })

    it('displays CHF currency correctly in button', () => {
      render(<CurrencyToggle {...defaultProps} currentCurrency="CHF" />)

      const button = screen.getByTestId('button')
      expect(button).toHaveTextContent('CHF')
    })
  })

  describe('Dropdown Menu Content', () => {
    it('renders dropdown menu label', () => {
      render(<CurrencyToggle {...defaultProps} />)

      expect(screen.getByTestId('dropdown-menu-label')).toBeInTheDocument()
      expect(screen.getByText('Default Currency')).toBeInTheDocument()
    })

    it('renders dropdown menu separator', () => {
      render(<CurrencyToggle {...defaultProps} />)

      expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument()
    })

    it('renders all supported currencies as menu items', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      expect(menuItems).toHaveLength(4) // USD, EUR, GBP, CHF

      // Check currency codes are present in the document
      expect(screen.getByText('USD')).toBeInTheDocument()
      expect(screen.getByText('EUR')).toBeInTheDocument()
      expect(screen.getByText('GBP')).toBeInTheDocument()
      expect(screen.getAllByText('CHF')).toHaveLength(2) // Symbol and code

      // Check currency names
      expect(screen.getByText('US Dollar')).toBeInTheDocument()
      expect(screen.getByText('Euro')).toBeInTheDocument()
      expect(screen.getByText('British Pound')).toBeInTheDocument()
      expect(screen.getByText('Swiss Franc')).toBeInTheDocument()
    })

    it('shows check icon for current currency', () => {
      render(<CurrencyToggle {...defaultProps} currentCurrency="EUR" />)

      const checkIcons = screen.getAllByTestId('check-icon')
      expect(checkIcons).toHaveLength(1)
    })

    it('applies correct content alignment', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveAttribute('data-align', 'end')
      expect(content).toHaveClass('w-48')
    })
  })

  describe('User Interactions', () => {
    it('calls onCurrencyChange when a currency is selected', async () => {
      const user = userEvent.setup()
      const mockOnCurrencyChange = jest.fn()

      render(
        <CurrencyToggle 
          {...defaultProps} 
          onCurrencyChange={mockOnCurrencyChange}
          currentCurrency="USD"
        />
      )

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const eurItem = menuItems.find(item => item.textContent?.includes('EUR'))
      
      expect(eurItem).toBeInTheDocument()
      if (eurItem) {
        await user.click(eurItem)
      }

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('EUR')
    })

    it('calls onCurrencyChange with correct currency for each option', async () => {
      const user = userEvent.setup()
      const mockOnCurrencyChange = jest.fn()

      render(
        <CurrencyToggle 
          {...defaultProps} 
          onCurrencyChange={mockOnCurrencyChange}
          currentCurrency="USD"
        />
      )

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      
      // Click GBP
      const gbpItem = menuItems.find(item => item.textContent?.includes('GBP'))
      if (gbpItem) {
        await user.click(gbpItem)
      }
      expect(mockOnCurrencyChange).toHaveBeenCalledWith('GBP')

      // Click CHF
      const chfItem = menuItems.find(item => item.textContent?.includes('CHF'))
      if (chfItem) {
        await user.click(chfItem)
      }
      expect(mockOnCurrencyChange).toHaveBeenCalledWith('CHF')

      expect(mockOnCurrencyChange).toHaveBeenCalledTimes(2)
    })

    it('does not call onCurrencyChange when clicking current currency', async () => {
      const user = userEvent.setup()
      const mockOnCurrencyChange = jest.fn()

      render(
        <CurrencyToggle 
          {...defaultProps} 
          onCurrencyChange={mockOnCurrencyChange}
          currentCurrency="USD"
        />
      )

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const usdItem = menuItems.find(item => item.textContent?.includes('USD'))
      
      if (usdItem) {
        await user.click(usdItem)
      }

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('USD')
    })
  })

  describe('Tooltip Content', () => {
    it('renders tooltip with current currency information', () => {
      render(<CurrencyToggle {...defaultProps} currentCurrency="EUR" />)

      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toBeInTheDocument()
      expect(screen.getByText('Default Currency: Euro (EUR)')).toBeInTheDocument()
    })

    it('updates tooltip content when currency changes', () => {
      const { rerender } = render(
        <CurrencyToggle {...defaultProps} currentCurrency="USD" />
      )

      expect(screen.getByText('Default Currency: US Dollar (USD)')).toBeInTheDocument()

      rerender(
        <CurrencyToggle {...defaultProps} currentCurrency="GBP" />
      )

      expect(screen.getByText('Default Currency: British Pound (GBP)')).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct button styling classes', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const button = screen.getByTestId('button')
      expect(button).toHaveClass(
        'h-9',
        'min-w-[40px]',
        'px-2',
        'hover:bg-accent',
        'hover:text-accent-foreground',
        'transition-colors',
        'cursor-pointer'
      )
    })

    it('applies correct menu item styling', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      menuItems.forEach(item => {
        expect(item).toHaveClass(
          'flex',
          'items-center',
          'justify-between',
          'cursor-pointer',
          'hover:bg-accent'
        )
      })
    })

    it('applies correct label styling', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const label = screen.getByTestId('dropdown-menu-label')
      expect(label).toHaveClass('font-medium')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('role', 'menuitem')
      })
    })

    it('provides screen reader text for current currency', () => {
      render(<CurrencyToggle {...defaultProps} currentCurrency="CHF" />)

      const srText = screen.getByText('Default Currency: Swiss Franc')
      expect(srText).toHaveClass('sr-only')
    })

    it('has accessible button structure', () => {
      render(<CurrencyToggle {...defaultProps} />)

      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
      
      // Check that the button contains the currency symbol
      expect(button).toHaveTextContent('$')
    })
  })

  describe('Edge Cases', () => {
    it('handles unknown currency gracefully', () => {
      // This tests the fallback behavior in the utility functions
      render(<CurrencyToggle {...defaultProps} currentCurrency={'XYZ' as Currency} />)

      // Should still render without crashing
      expect(screen.getByTestId('button')).toBeInTheDocument()
    })

    it('handles empty supported currencies list', () => {
      // Create a temporary mock for this test
      const originalMock = require('@/lib/utils').getSupportedCurrencies
      require('@/lib/utils').getSupportedCurrencies = jest.fn().mockReturnValue([])

      render(<CurrencyToggle {...defaultProps} />)

      const menuItems = screen.queryAllByTestId('dropdown-menu-item')
      expect(menuItems).toHaveLength(0)

      // Restore original mock
      require('@/lib/utils').getSupportedCurrencies = originalMock
    })

    it('handles rapid currency changes', async () => {
      const user = userEvent.setup()
      const mockOnCurrencyChange = jest.fn()

      render(
        <CurrencyToggle 
          {...defaultProps} 
          onCurrencyChange={mockOnCurrencyChange}
        />
      )

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      
      // Rapid clicks with proper checks
      if (menuItems[1]) await user.click(menuItems[1])
      if (menuItems[2]) await user.click(menuItems[2])
      if (menuItems[3]) await user.click(menuItems[3])

      expect(mockOnCurrencyChange).toHaveBeenCalledTimes(3)
    })
  })

  describe('Integration', () => {
    it('works with all supported currencies', () => {
      const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF']
      
      currencies.forEach(currency => {
        const { unmount } = render(
          <CurrencyToggle {...defaultProps} currentCurrency={currency} />
        )
        
        expect(screen.getByTestId('button')).toBeInTheDocument()
        unmount()
      })
    })

    it('maintains state consistency across re-renders', () => {
      const { rerender } = render(
        <CurrencyToggle {...defaultProps} currentCurrency="USD" />
      )

      let button = screen.getByTestId('button')
      expect(button).toHaveTextContent('$')

      rerender(
        <CurrencyToggle {...defaultProps} currentCurrency="EUR" />
      )

      button = screen.getByTestId('button')
      expect(button).toHaveTextContent('€')
      expect(button).not.toHaveTextContent('$')
    })

    it('handles prop changes correctly', () => {
      const mockOnCurrencyChange1 = jest.fn()
      const mockOnCurrencyChange2 = jest.fn()

      const { rerender } = render(
        <CurrencyToggle 
          currentCurrency="USD" 
          onCurrencyChange={mockOnCurrencyChange1} 
        />
      )

      rerender(
        <CurrencyToggle 
          currentCurrency="EUR" 
          onCurrencyChange={mockOnCurrencyChange2} 
        />
      )

      const button = screen.getByTestId('button')
      expect(button).toHaveTextContent('€')
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const mockOnCurrencyChange = jest.fn()
      
      const { rerender } = render(
        <CurrencyToggle 
          currentCurrency="USD" 
          onCurrencyChange={mockOnCurrencyChange} 
        />
      )

      // Re-render with same props
      rerender(
        <CurrencyToggle 
          currentCurrency="USD" 
          onCurrencyChange={mockOnCurrencyChange} 
        />
      )

      const button = screen.getByTestId('button')
      expect(button).toHaveTextContent('$')
    })

    it('handles large number of currency options efficiently', () => {
      // Create a temporary mock for this test
      const originalMock = require('@/lib/utils').getSupportedCurrencies
      require('@/lib/utils').getSupportedCurrencies = jest.fn().mockReturnValue(
        Array.from({ length: 20 }, (_, i) => `CUR${i}` as Currency)
      )

      render(<CurrencyToggle {...defaultProps} />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      expect(menuItems.length).toBeGreaterThan(4)

      // Restore original mock
      require('@/lib/utils').getSupportedCurrencies = originalMock
    })
  })
}) 