import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userEvent from '@testing-library/user-event'

// Import your store slices - using a simple mock for now
const mockAccountsSlice = {
  reducer: (state = {}) => state,
}

// Mock store creation utility
export function createMockStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      accounts: mockAccountsSlice.reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Mock i18n provider
function MockI18nProvider({ children }: { children: ReactNode }) {
  return (
    <div data-testid="mock-i18n-provider">
      {children}
    </div>
  )
}

// Test providers wrapper
interface TestProvidersProps {
  children: ReactNode
  initialState?: Record<string, unknown>
  store?: ReturnType<typeof createMockStore>
}

export function TestProviders({ 
  children, 
  initialState = {},
  store
}: TestProvidersProps) {
  const testStore = store || createMockStore(initialState)
  
  return (
    <Provider store={testStore}>
      <MockI18nProvider>
        {children}
      </MockI18nProvider>
    </Provider>
  )
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Record<string, unknown>
  store?: ReturnType<typeof createMockStore>
}

export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { store: ReturnType<typeof createMockStore> } {
  const { initialState, store, ...renderOptions } = options
  const testStore = store || createMockStore(initialState)
  
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <TestProviders store={testStore}>
        {children}
      </TestProviders>
    )
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions })
  
  return {
    ...result,
    store: testStore,
  }
}

// Utility for user interactions
export function createUser() {
  return userEvent.setup()
}

// Mock data generators
export const mockAccount = {
  id: 'acc-1',
  accountNumber: '1234567890',
  accountHolder: 'John Doe',
  accountType: 'checking' as const,
  balance: 1000,
  currency: 'USD' as const,
  isActive: true,
  ownerId: '123456',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function createMockAccount(overrides = {}) {
  return {
    ...mockAccount,
    ...overrides,
  }
}

// Component testing utilities
export function getSelectTrigger(container: HTMLElement) {
  return container.querySelector('[role="combobox"]')
}

export function getSelectContent(container: HTMLElement) {
  return container.querySelector('[role="listbox"]')
}

export function getSelectItems(container: HTMLElement) {
  return container.querySelectorAll('[role="option"]')
}

// Wait utilities
export async function waitForSelectToOpen(container: HTMLElement) {
  const content = getSelectContent(container)
  expect(content).toBeInTheDocument()
  return content
}

// Re-export everything from RTL
export * from '@testing-library/react'
export { userEvent }

// Re-export our custom render as the default render
export { customRender as render } 