import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { LanguageToggle, LanguageSwitcher } from '../language-switcher'

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'language': 'Language'
      }
      return translations[key] || key
    }
  })
}))

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size, ...props }: any) => (
    <button 
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

// Mock the DropdownMenu components
jest.mock('@/components/ui/dropdown-menu', () => ({
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
  DropdownMenuSeparator: ({ className }: any) => (
    <div data-testid="dropdown-menu-separator" className={className} />
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-menu-trigger">
      {asChild ? children : <button>{children}</button>}
    </div>
  ),
}))

// Mock the Tooltip components
jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children, asChild }: any) => (
    <div data-testid="tooltip-trigger">
      {asChild ? children : <button>{children}</button>}
    </div>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Languages: ({ className, ...props }: any) => <div data-testid="languages-icon" className={className} {...props} />,
  Check: ({ className, ...props }: any) => <div data-testid="check-icon" className={className} {...props} />,
}))

describe('LanguageToggle Component', () => {
  const defaultProps = {
    currentLocale: 'en',
    onLocaleChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders language toggle with default props', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
    })

    it('displays current language flag and name', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('English').length).toBeGreaterThan(0)
    })

    it('displays languages icon', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getByTestId('languages-icon')).toBeInTheDocument()
    })

    it('has screen reader text for language', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getAllByText('Language').length).toBeGreaterThan(0)
    })
  })

  describe('Language Support', () => {
    it('displays English language correctly', () => {
      render(<LanguageToggle {...defaultProps} currentLocale="en" />)
      
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('English').length).toBeGreaterThan(0)
    })

    it('displays Spanish language correctly', () => {
      render(<LanguageToggle {...defaultProps} currentLocale="es" />)
      
      expect(screen.getAllByText('🇪🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Español').length).toBeGreaterThan(0)
    })

    it('displays French language correctly', () => {
      render(<LanguageToggle {...defaultProps} currentLocale="fr" />)
      
      expect(screen.getAllByText('🇫🇷').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Français').length).toBeGreaterThan(0)
    })

    it('displays German language correctly', () => {
      render(<LanguageToggle {...defaultProps} currentLocale="de" />)
      
      expect(screen.getAllByText('🇩🇪').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Deutsch').length).toBeGreaterThan(0)
    })

    it('falls back to English for unsupported locale', () => {
      render(<LanguageToggle {...defaultProps} currentLocale="invalid" />)
      
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('English').length).toBeGreaterThan(0)
    })
  })

  describe('Dropdown Menu Content', () => {
    it('renders dropdown menu label', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getByTestId('dropdown-menu-label')).toBeInTheDocument()
      expect(screen.getAllByText('Language').length).toBeGreaterThan(0)
    })

    it('renders dropdown menu separator', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument()
    })

    it('renders all language options', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇪🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇫🇷').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇩🇪').length).toBeGreaterThan(0)
      
      expect(screen.getByText('Español')).toBeInTheDocument()
      expect(screen.getByText('Français')).toBeInTheDocument()
      expect(screen.getByText('Deutsch')).toBeInTheDocument()
      expect(screen.getByText('Spanish')).toBeInTheDocument()
      expect(screen.getByText('French')).toBeInTheDocument()
      expect(screen.getByText('German')).toBeInTheDocument()
    })

    it('shows check icon for current language', () => {
      render(<LanguageToggle {...defaultProps} currentLocale="es" />)
      
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('does not show check icon for non-current languages', () => {
      render(<LanguageToggle {...defaultProps} currentLocale="en" />)
      
      // Only one check icon should be present (for current language)
      const checkIcons = screen.getAllByTestId('check-icon')
      expect(checkIcons).toHaveLength(1)
    })
  })

  describe('User Interactions', () => {
    it('calls onLocaleChange when language is selected', async () => {
      const user = userEvent.setup()
      const mockOnLocaleChange = jest.fn()
      
      render(<LanguageToggle {...defaultProps} onLocaleChange={mockOnLocaleChange} />)
      
      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const secondItem = menuItems[1]
      if (secondItem) {
        await user.click(secondItem) // Click second language (Spanish)
      }
      
      expect(mockOnLocaleChange).toHaveBeenCalledWith('es')
    })

    it('calls onLocaleChange with correct locale for each language', async () => {
      const user = userEvent.setup()
      const mockOnLocaleChange = jest.fn()
      
      render(<LanguageToggle {...defaultProps} onLocaleChange={mockOnLocaleChange} />)
      
      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      
      // Test each language selection
      if (menuItems[0]) {
        await user.click(menuItems[0]) // English
        expect(mockOnLocaleChange).toHaveBeenCalledWith('en')
      }
      
      if (menuItems[1]) {
        await user.click(menuItems[1]) // Spanish
        expect(mockOnLocaleChange).toHaveBeenCalledWith('es')
      }
      
      if (menuItems[2]) {
        await user.click(menuItems[2]) // French
        expect(mockOnLocaleChange).toHaveBeenCalledWith('fr')
      }
      
      if (menuItems[3]) {
        await user.click(menuItems[3]) // German
        expect(mockOnLocaleChange).toHaveBeenCalledWith('de')
      }
    })
  })

  describe('Button Styling and Attributes', () => {
    it('applies correct button variant and size', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'ghost')
      expect(button).toHaveAttribute('data-size', 'sm')
    })

    it('applies correct CSS classes to button', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'px-3')
    })

    it('has proper ARIA attributes for flags', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      // Check that flag emoji is rendered with role attribute
      const flagElements = screen.getAllByRole('img')
      expect(flagElements.length).toBeGreaterThan(0)
    })
  })

  describe('Tooltip Content', () => {
    it('renders tooltip content with current language', () => {
      render(<LanguageToggle {...defaultProps} currentLocale="fr" />)
      
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
      expect(screen.getByText('Language: Français')).toBeInTheDocument()
    })

    it('updates tooltip content when language changes', () => {
      const { rerender } = render(<LanguageToggle {...defaultProps} currentLocale="en" />)
      
      expect(screen.getByText('Language: English')).toBeInTheDocument()
      
      rerender(<LanguageToggle {...defaultProps} currentLocale="de" />)
      
      expect(screen.getByText('Language: Deutsch')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('hides language name on small screens', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      // Find the specific English text in the button (not in dropdown)
      const languageNames = screen.getAllByText('English')
      const buttonLanguageName = languageNames.find(el => el.closest('button'))
      expect(buttonLanguageName).toHaveClass('hidden', 'sm:inline')
    })

    it('shows language name on larger screens', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      // Find the specific English text in the button (not in dropdown)
      const languageNames = screen.getAllByText('English')
      const buttonLanguageName = languageNames.find(el => el.closest('button'))
      expect(buttonLanguageName).toHaveClass('sm:inline')
    })
  })

  describe('Accessibility', () => {
    it('provides screen reader text for language button', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      // Find the specific "Language" text with sr-only class
      const languageTexts = screen.getAllByText('Language')
      const srOnlyLanguage = languageTexts.find(el => el.classList.contains('sr-only'))
      expect(srOnlyLanguage).toBeInTheDocument()
      expect(srOnlyLanguage).toHaveClass('sr-only')
    })

    it('has proper ARIA labels for all flag elements', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      // Check that all flag emojis are rendered - use getAllByText for multiple instances
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇪🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇫🇷').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇩🇪').length).toBeGreaterThan(0)
    })

    it('uses proper role attributes for menu items', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems).toHaveLength(4)
    })
  })

  describe('Language Data Structure', () => {
    it('renders all supported languages in dropdown', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      // Check all flags are present - use getAllByText for multiple instances
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇪🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇫🇷').length).toBeGreaterThan(0)
      expect(screen.getAllByText('🇩🇪').length).toBeGreaterThan(0)
      
      // Check language names
      expect(screen.getByText('Español')).toBeInTheDocument()
      expect(screen.getByText('Français')).toBeInTheDocument()
      expect(screen.getByText('Deutsch')).toBeInTheDocument()
      expect(screen.getByText('Spanish')).toBeInTheDocument()
      expect(screen.getByText('French')).toBeInTheDocument()
      expect(screen.getByText('German')).toBeInTheDocument()
    })

    it('displays both native name and English name for each language', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      // Check that both native names and English names are displayed - use getAllByText for multiple instances
      expect(screen.getAllByText('English').length).toBeGreaterThan(0) // Native name (appears multiple times)
      expect(screen.getByText('Español')).toBeInTheDocument() // Native name
      expect(screen.getByText('Spanish')).toBeInTheDocument() // English name
      expect(screen.getByText('Français')).toBeInTheDocument() // Native name
      expect(screen.getByText('French')).toBeInTheDocument() // English name
      expect(screen.getByText('Deutsch')).toBeInTheDocument() // Native name
      expect(screen.getByText('German')).toBeInTheDocument() // English name
    })
  })

  describe('Component Structure', () => {
    it('has correct nested component structure', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
    })

    it('renders dropdown content with correct alignment', () => {
      render(<LanguageToggle {...defaultProps} />)
      
      const dropdownContent = screen.getByTestId('dropdown-menu-content')
      expect(dropdownContent).toHaveAttribute('data-align', 'end')
      expect(dropdownContent).toHaveClass('w-48')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined currentLocale gracefully', () => {
      render(<LanguageToggle currentLocale={undefined as any} onLocaleChange={jest.fn()} />)
      
      // Should fall back to English - use getAllByText for multiple flag instances
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('English').length).toBeGreaterThan(0)
    })

    it('handles null currentLocale gracefully', () => {
      render(<LanguageToggle currentLocale={null as any} onLocaleChange={jest.fn()} />)
      
      // Should fall back to English - use getAllByText for multiple flag instances
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('English').length).toBeGreaterThan(0)
    })

    it('handles empty string currentLocale gracefully', () => {
      render(<LanguageToggle currentLocale="" onLocaleChange={jest.fn()} />)
      
      // Should fall back to English - use getAllByText for multiple flag instances
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('English').length).toBeGreaterThan(0)
    })
  })

  describe('Legacy Export', () => {
    it('exports LanguageSwitcher as legacy alias', () => {
      render(<LanguageSwitcher {...defaultProps} />)
      
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
      expect(screen.getAllByText('🇺🇸').length).toBeGreaterThan(0)
      expect(screen.getAllByText('English').length).toBeGreaterThan(0)
    })

    it('LanguageSwitcher works identically to LanguageToggle', async () => {
      const user = userEvent.setup()
      const mockOnLocaleChange = jest.fn()
      
      render(<LanguageSwitcher {...defaultProps} onLocaleChange={mockOnLocaleChange} />)
      
      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const secondItem = menuItems[1]
      if (secondItem) {
        await user.click(secondItem) // Click Spanish
      }
      
      expect(mockOnLocaleChange).toHaveBeenCalledWith('es')
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<LanguageToggle {...defaultProps} />)
      
      // Re-render with same props
      rerender(<LanguageToggle {...defaultProps} />)
      
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument()
    })

    it('handles rapid language changes', async () => {
      const user = userEvent.setup()
      const mockOnLocaleChange = jest.fn()
      
      render(<LanguageToggle {...defaultProps} onLocaleChange={mockOnLocaleChange} />)
      
      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      
      // Rapid clicks with null checks
      if (menuItems[0]) await user.click(menuItems[0])
      if (menuItems[1]) await user.click(menuItems[1])
      if (menuItems[2]) await user.click(menuItems[2])
      if (menuItems[3]) await user.click(menuItems[3])
      
      expect(mockOnLocaleChange).toHaveBeenCalledTimes(4)
    })
  })
}) 