import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "@/components/ui/search-input";

describe("SearchInput", () => {
  const mockOnSearchChange = jest.fn();

  beforeEach(() => {
    mockOnSearchChange.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders with default placeholder", () => {
    render(<SearchInput onSearchChange={mockOnSearchChange} />);
    
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(
      <SearchInput 
        onSearchChange={mockOnSearchChange} 
        placeholder="Search accounts..." 
      />
    );
    
    expect(screen.getByPlaceholderText("Search accounts...")).toBeInTheDocument();
  });

  it("displays the search icon", () => {
    render(<SearchInput onSearchChange={mockOnSearchChange} />);
    
    // The search icon should be present
    expect(document.querySelector('[data-testid="search-icon"]') || 
           document.querySelector('svg')).toBeInTheDocument();
  });

  it("calls onSearchChange with debounced input", async () => {
    render(<SearchInput onSearchChange={mockOnSearchChange} debounceMs={300} />);
    
    const input = screen.getByRole("searchbox");
    
    // Type in the input
    fireEvent.change(input, { target: { value: "test" } });
    
    // Should not have called the callback yet
    expect(mockOnSearchChange).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Now it should have been called
    expect(mockOnSearchChange).toHaveBeenCalledWith("test");
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
  });

  it("shows clear button when there is text", async () => {
    render(<SearchInput onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByRole("searchbox");
    
    // Initially no clear button
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
    
    // Type some text
    fireEvent.change(input, { target: { value: "test" } });
    
    // Clear button should appear
    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("clears input when clear button is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<SearchInput onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByRole("searchbox");
    
    // Type some text
    fireEvent.change(input, { target: { value: "test" } });
    
    // Click clear button
    const clearButton = screen.getByLabelText("Clear search");
    await user.click(clearButton);
    
    // Input should be cleared
    expect(input).toHaveValue("");
    
    // onSearchChange should be called with empty string
    expect(mockOnSearchChange).toHaveBeenCalledWith("");
  });

  it("is disabled when disabled prop is true", () => {
    render(<SearchInput onSearchChange={mockOnSearchChange} disabled />);
    
    const input = screen.getByRole("searchbox");
    expect(input).toBeDisabled();
  });

  it("respects external value changes", () => {
    const { rerender } = render(
      <SearchInput onSearchChange={mockOnSearchChange} value="initial" />
    );
    
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("initial");
    
    // Change external value
    rerender(
      <SearchInput onSearchChange={mockOnSearchChange} value="updated" />
    );
    
    expect(input).toHaveValue("updated");
  });

  it("has proper accessibility attributes", () => {
    render(
      <SearchInput 
        onSearchChange={mockOnSearchChange} 
        placeholder="Search accounts" 
      />
    );
    
    const input = screen.getByRole("searchbox");
    
    expect(input).toHaveAttribute("aria-label", "Search accounts");
    expect(input).toHaveAttribute("autoComplete", "off");
    expect(input).toHaveAttribute("type", "search");
  });

  it("applies custom className", () => {
    const { container } = render(
      <SearchInput 
        onSearchChange={mockOnSearchChange} 
        className="custom-class" 
      />
    );
    
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("prevents calling onSearchChange when disabled", async () => {
    render(<SearchInput onSearchChange={mockOnSearchChange} disabled />);
    
    const input = screen.getByRole("searchbox");
    
    // Try to type (should not work since disabled)
    fireEvent.change(input, { target: { value: "test" } });
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Should not have been called
    expect(mockOnSearchChange).not.toHaveBeenCalled();
  });

  it("debounces multiple rapid changes", async () => {
    render(<SearchInput onSearchChange={mockOnSearchChange} debounceMs={300} />);
    
    const input = screen.getByRole("searchbox");
    
    // Type multiple characters rapidly
    fireEvent.change(input, { target: { value: "h" } });
    fireEvent.change(input, { target: { value: "he" } });
    fireEvent.change(input, { target: { value: "hel" } });
    fireEvent.change(input, { target: { value: "hell" } });
    fireEvent.change(input, { target: { value: "hello" } });
    
    // Should not have called yet
    expect(mockOnSearchChange).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Should have been called only once with final value
    expect(mockOnSearchChange).toHaveBeenCalledWith("hello");
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
  });
}); 