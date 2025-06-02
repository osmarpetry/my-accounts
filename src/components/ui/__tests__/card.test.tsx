import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../card'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Card Components', () => {
  describe('Card Component', () => {
    it('renders card with default props', () => {
      render(<Card>Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card.tagName).toBe('DIV')
    })

    it('applies custom className', () => {
      render(<Card className="custom-class">Card</Card>)
      
      const card = screen.getByText('Card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <Card 
          data-testid="custom-card"
          role="article"
          aria-label="Custom card"
        >
          Card content
        </Card>
      )
      
      const card = screen.getByText('Card content')
      expect(card).toHaveAttribute('data-testid', 'custom-card')
      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-label', 'Custom card')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(<Card ref={ref}>Card with ref</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Card with ref')
    })

    it('handles event handlers', async () => {
      const user = userEvent.setup()
      const mockClick = jest.fn()
      const mockMouseEnter = jest.fn()
      
      render(
        <Card onClick={mockClick} onMouseEnter={mockMouseEnter}>
          Interactive Card
        </Card>
      )
      
      const card = screen.getByText('Interactive Card')
      
      await user.click(card)
      expect(mockClick).toHaveBeenCalledTimes(1)
      
      await user.hover(card)
      expect(mockMouseEnter).toHaveBeenCalledTimes(1)
    })

    it('handles empty children', () => {
      render(<Card data-testid="empty-card"></Card>)
      
      const card = screen.getByTestId('empty-card')
      expect(card).toBeInTheDocument()
      expect(card).toBeEmptyDOMElement()
    })

    it('handles complex nested content', () => {
      render(
        <Card>
          <div>
            <span>Nested content</span>
            <p>Paragraph</p>
          </div>
        </Card>
      )
      
      expect(screen.getByText('Nested content')).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
    })
  })

  describe('CardHeader Component', () => {
    it('renders card header with default props', () => {
      render(<CardHeader>Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
      expect(header.tagName).toBe('DIV')
    })

    it('applies custom className', () => {
      render(<CardHeader className="custom-header">Header</CardHeader>)
      
      const header = screen.getByText('Header')
      expect(header).toHaveClass('custom-header')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <CardHeader 
          data-testid="card-header"
          role="banner"
        >
          Header
        </CardHeader>
      )
      
      const header = screen.getByText('Header')
      expect(header).toHaveAttribute('data-testid', 'card-header')
      expect(header).toHaveAttribute('role', 'banner')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(<CardHeader ref={ref}>Header with ref</CardHeader>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Header with ref')
    })

    it('handles multiple children', () => {
      render(
        <CardHeader>
          <span>Title</span>
          <span>Subtitle</span>
        </CardHeader>
      )
      
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Subtitle')).toBeInTheDocument()
    })
  })

  describe('CardTitle Component', () => {
    it('renders card title with default props', () => {
      render(<CardTitle>Title text</CardTitle>)
      
      const title = screen.getByText('Title text')
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe('H3')
    })

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      
      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <CardTitle 
          data-testid="card-title"
          id="main-title"
        >
          Title
        </CardTitle>
      )
      
      const title = screen.getByText('Title')
      expect(title).toHaveAttribute('data-testid', 'card-title')
      expect(title).toHaveAttribute('id', 'main-title')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>()
      
      render(<CardTitle ref={ref}>Title with ref</CardTitle>)
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
      expect(ref.current).toHaveTextContent('Title with ref')
    })

    it('handles complex content', () => {
      render(
        <CardTitle>
          <span>Main</span> <em>Title</em>
        </CardTitle>
      )
      
      expect(screen.getByText('Main')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('can be used as heading for accessibility', () => {
      render(<CardTitle>Accessible Title</CardTitle>)
      
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('Accessible Title')
    })
  })

  describe('CardDescription Component', () => {
    it('renders card description with default props', () => {
      render(<CardDescription>Description text</CardDescription>)
      
      const description = screen.getByText('Description text')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('P')
    })

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>)
      
      const description = screen.getByText('Description')
      expect(description).toHaveClass('custom-desc')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <CardDescription 
          data-testid="card-description"
          id="desc-1"
        >
          Description
        </CardDescription>
      )
      
      const description = screen.getByText('Description')
      expect(description).toHaveAttribute('data-testid', 'card-description')
      expect(description).toHaveAttribute('id', 'desc-1')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      
      render(<CardDescription ref={ref}>Description with ref</CardDescription>)
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
      expect(ref.current).toHaveTextContent('Description with ref')
    })

    it('handles long text content', () => {
      const longText = 'This is a very long description that might wrap to multiple lines and should be handled properly by the component.'
      
      render(<CardDescription>{longText}</CardDescription>)
      
      const description = screen.getByText(longText)
      expect(description).toBeInTheDocument()
    })

    it('handles rich text content', () => {
      render(
        <CardDescription>
          This is <strong>bold</strong> and <em>italic</em> text.
        </CardDescription>
      )
      
      expect(screen.getByText('bold')).toBeInTheDocument()
      expect(screen.getByText('italic')).toBeInTheDocument()
    })
  })

  describe('CardContent Component', () => {
    it('renders card content with default props', () => {
      render(<CardContent>Content text</CardContent>)
      
      const content = screen.getByText('Content text')
      expect(content).toBeInTheDocument()
      expect(content.tagName).toBe('DIV')
    })

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>)
      
      const content = screen.getByText('Content')
      expect(content).toHaveClass('custom-content')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <CardContent 
          data-testid="card-content"
          role="main"
        >
          Content
        </CardContent>
      )
      
      const content = screen.getByText('Content')
      expect(content).toHaveAttribute('data-testid', 'card-content')
      expect(content).toHaveAttribute('role', 'main')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(<CardContent ref={ref}>Content with ref</CardContent>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Content with ref')
    })

    it('handles complex nested content', () => {
      render(
        <CardContent>
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </CardContent>
      )
      
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })

  describe('CardFooter Component', () => {
    it('renders card footer with default props', () => {
      render(<CardFooter>Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
      expect(footer.tagName).toBe('DIV')
    })

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>)
      
      const footer = screen.getByText('Footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <CardFooter 
          data-testid="card-footer"
          role="contentinfo"
        >
          Footer
        </CardFooter>
      )
      
      const footer = screen.getByText('Footer')
      expect(footer).toHaveAttribute('data-testid', 'card-footer')
      expect(footer).toHaveAttribute('role', 'contentinfo')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(<CardFooter ref={ref}>Footer with ref</CardFooter>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Footer with ref')
    })

    it('handles action buttons', () => {
      render(
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      )
      
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
  })

  describe('Complete Card Integration', () => {
    it('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description text')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('handles card without header', () => {
      render(
        <Card>
          <CardContent>Content only</CardContent>
          <CardFooter>Footer only</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Content only')).toBeInTheDocument()
      expect(screen.getByText('Footer only')).toBeInTheDocument()
    })

    it('handles card without footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title only</CardTitle>
          </CardHeader>
          <CardContent>Content only</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Title only')).toBeInTheDocument()
      expect(screen.getByText('Content only')).toBeInTheDocument()
    })

    it('handles minimal card', () => {
      render(
        <Card>
          <CardContent>Minimal content</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Minimal content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports ARIA attributes on all components', () => {
      render(
        <Card aria-label="Product card">
          <CardHeader aria-label="Product header">
            <CardTitle id="product-title">Product Name</CardTitle>
            <CardDescription aria-describedby="product-title">Product description</CardDescription>
          </CardHeader>
          <CardContent aria-label="Product details">
            Product details
          </CardContent>
          <CardFooter aria-label="Product actions">
            <button>Buy Now</button>
          </CardFooter>
        </Card>
      )
      
      const card = screen.getByLabelText('Product card')
      const header = screen.getByLabelText('Product header')
      const content = screen.getByLabelText('Product details')
      const footer = screen.getByLabelText('Product actions')
      
      expect(card).toBeInTheDocument()
      expect(header).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })

    it('maintains proper heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
          </CardHeader>
        </Card>
      )
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Main Title')
    })
  })

  describe('Edge Cases', () => {
    it('handles null and undefined children', () => {
      render(
        <Card data-testid="null-card">
          <CardHeader>{null}</CardHeader>
          <CardTitle>{undefined}</CardTitle>
          <CardDescription>{null}</CardDescription>
          <CardContent>{undefined}</CardContent>
          <CardFooter>{null}</CardFooter>
        </Card>
      )
      
      // Components should render without errors
      const card = screen.getByTestId('null-card')
      expect(card).toBeInTheDocument()
    })

    it('handles boolean and number children', () => {
      render(
        <Card>
          <CardTitle>{42}</CardTitle>
          <CardDescription>{true}</CardDescription>
          <CardContent>{0}</CardContent>
        </Card>
      )
      
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles empty string children', () => {
      render(
        <Card data-testid="empty-string-card">
          <CardTitle>{''}</CardTitle>
          <CardDescription>{''}</CardDescription>
          <CardContent>{''}</CardContent>
        </Card>
      )
      
      // Components should render without errors
      const card = screen.getByTestId('empty-string-card')
      expect(card).toBeInTheDocument()
    })
  })
}) 