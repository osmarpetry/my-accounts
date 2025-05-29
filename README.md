# Bank Accounts Management Application

A modern bank accounts management application built with Next.js 15, TypeScript, Redux Toolkit, and Tailwind CSS. Features internationalization (English/French), comprehensive testing, and a beautiful responsive UI.

## 🌟 Features

- **Account Management**: Create, edit, delete, and view bank accounts
- **Real-time Statistics**: Total balance, active accounts count, and account types overview
- **Internationalization**: Full support for English and French languages with flag icons
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **Data Validation**: Comprehensive form validation with user-friendly error messages
- **Type Safety**: Full TypeScript implementation for better development experience
- **State Management**: Redux Toolkit for reliable state management with proper serialization
- **Modern UI**: Clean, accessible interface with dark/light mode support

## 🌍 Internationalization

The application supports:
- **English** (default) 🇺🇸
- **French** 🇫🇷

Switch languages using the flag toggle button in the header. All UI text, form labels, validation messages, and user feedback are fully translated.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3002](http://localhost:3002) in your browser.

## 🧪 Testing

The application includes comprehensive testing setup:

### Unit Tests
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Run e2e tests in headed mode
npm run test:e2e:headed
```

### Run All Tests
```bash
npm run test:all
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/accounts/       # API routes for account management
│   └── page.tsx           # Main page component
├── components/
│   ├── forms/             # Form components
│   │   └── account-form.tsx
│   └── ui/                # Reusable UI components
│       └── language-switcher.tsx
├── lib/
│   ├── i18n.ts           # Internationalization setup
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod validation schemas
├── store/
│   └── redux-store.ts    # Redux store configuration
├── types/
│   └── index.ts          # TypeScript type definitions
└── __tests__/            # Unit tests
e2e/                      # End-to-end tests
```

## 🎨 UI Components

- **Cards**: Statistics and account display cards
- **Forms**: Account creation and editing forms
- **Buttons**: Primary, secondary, and outline variants
- **Language Switcher**: Flag-based language toggle
- **Loading States**: Skeleton components for better UX
- **Error Handling**: User-friendly error messages and retry options

## 🔧 Technical Details

### State Management
- Redux Toolkit for predictable state management
- Proper serialization handling for Date objects
- Memoized selectors for optimal performance

### Internationalization
- Custom i18n system with parameter interpolation
- Language persistence in Redux store
- Fallback to English for missing translations

### API Design
- RESTful API endpoints for CRUD operations
- Comprehensive error handling
- Input validation with Zod schemas

### Testing Strategy
- **Unit Tests**: Component behavior, Redux actions/selectors, utility functions
- **E2E Tests**: Complete user workflows, responsive design, error scenarios
- **Accessibility**: ARIA labels and semantic HTML testing

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:ui` - Run e2e tests with Playwright UI
- `npm run test:all` - Run all tests

## 📦 Dependencies

### Core
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### State Management
- **Redux Toolkit** - State management
- **React Redux** - React bindings for Redux

### Forms & Validation
- **Zod** - Schema validation
- **UUID** - Unique ID generation

### Testing
- **Jest** - Unit testing framework
- **Testing Library** - React component testing
- **Playwright** - End-to-end testing

## 🌐 API Endpoints

- `GET /api/accounts` - Fetch all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/[id]` - Fetch account by ID
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
