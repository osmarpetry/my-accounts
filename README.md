# Bank Account Management System

A modern, internationalized bank account management application built with Next.js 15, TypeScript, Redux Toolkit, and Tailwind CSS.

## 🌟 Features

- **Account Management**: Create, edit, delete, and view bank accounts
- **Real-time Statistics**: Total balance, active accounts count, and account types overview
- **Internationalization**: Full support for English, Spanish, Portuguese, and Chinese languages with flag icons
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **Data Validation**: Comprehensive form validation with user-friendly error messages
- **Type Safety**: Full TypeScript implementation for better development experience
- **State Management**: Redux Toolkit for reliable state management with proper serialization
- **Modern UI**: Clean, accessible interface with dark/light mode support

## 🌍 Internationalization (i18n)

The application supports **4 languages** with complete translation coverage:
- **English (en)** - Default
- **Spanish (es)**
- **Portuguese (pt)**
- **Chinese (zh)**

### I18n Coverage
✅ **All pages and forms are fully internationalized:**
- Home page with account overview
- All accounts listing page
- Account creation and editing forms
- Transfer forms
- Error messages and validation
- Navigation and UI elements
- Currency names and descriptions
- Account type descriptions

## 🏦 Core Features

### 1. Account Management
- **Create accounts** with owner ID, holder name, type, initial balance, and currency
- **Edit accounts** including balance, currency, holder name, and status
- **Deactivate/activate accounts** with business rule validation
- **Delete accounts** with confirmation dialog
- **Multi-currency support** with 11 supported currencies

### 2. Search & Filtering
- **Advanced search** by account holder name, account number, or owner ID
- **Filter by account type** (checking, savings, credit)
- **Filter by currency** (USD, EUR, GBP, CHF, CNY, SEK, NOK, DKK, PLN, CZK, HUF)
- **Filter by status** (active/inactive)
- **Balance range filtering** (min/max balance)
- **Real-time search** with immediate results

### 3. Currency Management
- **Multi-currency accounts** with support for 11 major currencies
- **Currency conversion** for transfers between different currency accounts
- **Real-time exchange rates** simulation
- **Currency switcher** in header for easy access
- **Localized currency formatting** based on user locale

### 4. Transfer System
- **Internal transfers** between accounts
- **Cross-currency transfers** with automatic conversion
- **Transfer validation** ensuring sufficient funds
- **Transfer history** tracking with detailed records

## 🎯 Business Rules (2025 Standards)

### Account Creation Rules
1. **Owner ID**: Must be unique 6-digit number (100000-999999)
2. **Account Holder**: 2-100 characters, letters, spaces, hyphens, apostrophes only
3. **Initial Balance**: Must be ≥ $0, maximum $1,000,000
4. **Currency**: Must be one of 11 supported currencies
5. **Account Type**: checking, savings, or credit

### Account Editing Rules
1. **Balance Updates**: Can update balance in real-time
2. **Currency Changes**: Allowed for flexibility in modern banking
3. **Holder Name**: Can be updated for legal name changes
4. **Status Changes**: Subject to deactivation business rules

### ⚠️ Critical Business Rule: Account Deactivation
**IMPROVED LOGIC**: Users can now update balance to zero AND deactivate in the same form submission.

#### Deactivation Rules:
- ✅ **Allow**: Deactivate if current form balance is $0.00
- ✅ **Allow**: Update balance to $0.00 and deactivate in single operation
- ❌ **Prevent**: Deactivate if form balance > $0.00
- ❌ **Prevent**: Deactivate if form balance < $0.00 (negative balance)

#### User Experience:
1. **Single Operation**: User can zero balance and deactivate in one form submission
2. **Smart Validation**: Form checks updated balance, not original balance
3. **Clear Messaging**: Error message guides user to transfer funds or zero balance
4. **Immediate Feedback**: Validation happens before API call

### Transfer Rules
1. **Sufficient Funds**: Source account must have adequate balance
2. **Active Accounts**: Both accounts must be active for transfers
3. **Cross-Currency**: Automatic conversion with simulated exchange rates
4. **Minimum Amount**: $0.01 minimum transfer amount
5. **Maximum Amount**: No artificial limits (subject to account balance)

### Search & Filter Rules
1. **Real-time Search**: Results update as user types (debounced)
2. **Case-insensitive**: Search ignores case for better UX
3. **Partial Matching**: Matches partial account numbers and names
4. **Multi-criteria**: Can combine multiple filters simultaneously
5. **Clear Filters**: Easy reset functionality for all filters

## 📱 User Interface & Experience

### Design System
- **Modern UI**: Clean, minimal design following 2025 standards
- **Responsive**: Fully responsive across desktop, tablet, and mobile
- **Dark/Light Mode**: System-aware theme switching
- **Loading States**: Skeleton components for smooth loading experience
- **Error Handling**: User-friendly error messages with modal system

### Navigation
- **Header**: Logo, navigation links, currency switcher, language switcher, theme toggle
- **Breadcrumbs**: Clear navigation path
- **Quick Actions**: Prominent buttons for common tasks
- **Back Navigation**: Consistent back button behavior

### Forms & Interactions
- **Smart Validation**: Real-time validation with visual feedback
- **Error Prevention**: Client-side validation prevents invalid API calls
- **Loading States**: Clear feedback during operations
- **Confirmation Dialogs**: Important actions require confirmation
- **Modal System**: Consistent modal design for forms and alerts

## 🧩 Component Architecture

### Page Components

#### 1. Home Page (`src/app/page.tsx`)
**Purpose**: Dashboard overview with account summary
**Features**:
- Account overview cards (shows first 3 accounts)
- Total balance display in selected currency
- Quick action buttons (Create, Transfer)
- Recent accounts with edit/delete options
- Currency-converted balance display

**I18n Coverage**: ✅ Complete
- Page title and descriptions
- Account type labels
- Action button labels
- Status indicators
- Error messages

#### 2. All Accounts Page (`src/app/accounts/page.tsx`)
**Purpose**: Complete account listing with search and filters
**Features**:
- All accounts grid view
- Advanced search and filtering
- Bulk operations support
- Account management actions
- Pagination support (future enhancement)

**I18n Coverage**: ✅ Complete
- Search placeholder text
- Filter labels and options
- Account details
- Action buttons
- Empty state messages

### Form Components

#### 1. Account Form (`src/components/forms/account-form.tsx`)
**Purpose**: Create and edit bank accounts
**Features**:
- Dynamic form (create vs edit mode)
- Real-time validation with visual feedback
- Owner ID generation for new accounts
- Currency-aware balance formatting
- Status toggle with business rule validation
- Modal-based error handling

**Key Functionality**:
```typescript
// Account creation
const createData = {
  ownerId: parseInt(formData.ownerId),
  accountHolder: formData.accountHolder.trim(),
  accountType: formData.accountType,
  initialBalance: parseFloat(formData.balance),
  currency: formData.currency,
};

// Account editing with improved deactivation logic
const preValidateAccountUpdate = () => {
  const updatedBalance = parseFloat(formData.balance) || 0;
  if (formData.isActive === false && updatedBalance > 0) {
    // Show error modal
    return false;
  }
  return true;
};
```

**I18n Coverage**: ✅ Complete
- Form labels and placeholders
- Validation error messages
- Help text and descriptions
- Button labels
- Modal content

#### 2. Transfer Form (`src/components/forms/transfer-form.tsx`)
**Purpose**: Handle money transfers between accounts
**Features**:
- Account selection with validation
- Cross-currency transfer support
- Exchange rate calculation
- Transfer amount validation
- Confirmation step before processing

**I18n Coverage**: ✅ Complete
- Form labels and instructions
- Currency conversion text
- Validation messages
- Confirmation dialog content

### UI Components

#### 1. Currency Switcher (`src/components/ui/currency-switcher.tsx`)
**Purpose**: Global currency selection for display purposes
**Features**:
- Compact display (symbol only)
- Tooltip with full currency info
- Responsive dropdown menu
- Keyboard navigation support

#### 2. Language Switcher (`src/components/ui/language-switcher.tsx`)
**Purpose**: Language selection for internationalization
**Features**:
- Flag icons for visual recognition
- Language names in native script
- Smooth language switching
- Persistent language preference

#### 3. Search & Filters (`src/components/ui/search-filters.tsx`)
**Purpose**: Advanced search and filtering functionality
**Features**:
- Real-time search with debouncing
- Multiple filter criteria
- Clear filters functionality
- Responsive filter layout

#### 4. Warning Modal (`src/components/ui/warning-modal.tsx`)
**Purpose**: Reusable modal for warnings, errors, and confirmations
**Features**:
- Multiple modal types (warning, error, info, success)
- Customizable content and actions
- Accessibility compliant
- Consistent styling

### Business Logic Components

#### 1. Redux Store (`src/store/redux-store.ts`)
**Purpose**: Global state management
**Features**:
- Account management state
- Loading and error states
- Currency conversion utilities
- Locale management
- Type-safe actions and selectors

#### 2. Utils (`src/lib/utils.ts`)
**Purpose**: Shared utility functions
**Features**:
- Currency formatting and conversion
- Date formatting
- Account search functionality
- Validation helpers
- ID generation

## 🔧 Technical Stack

### Core Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript 5**: Type-safe development
- **Redux Toolkit**: State management
- **Tailwind CSS 4**: Utility-first styling
- **React Hook Form**: Form management
- **Zod**: Runtime type validation

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon library
- **Class Variance Authority**: Component variant management
- **Tailwind Merge**: Efficient class name merging

### Internationalization
- **React i18next**: React integration for i18n
- **i18next**: Core internationalization framework
- **Browser Language Detector**: Automatic language detection

### Development & Testing
- **Jest**: Unit testing framework
- **Testing Library**: React component testing
- **Playwright**: End-to-end testing
- **ESLint**: Code linting
- **TypeScript**: Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser

### Installation
```bash
# Clone repository
git clone [repository-url]
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Type checking
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

## 📊 API Endpoints

### Account Management
- `GET /api/accounts` - Retrieve all accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

### Transactions
- `GET /api/transactions` - Retrieve transaction history
- `POST /api/transactions` - Create new transaction

### Transfers
- `POST /api/transfers` - Process money transfer

## 🔮 Future Enhancements

### Planned Features
1. **Transaction History**: Detailed transaction tracking per account
2. **Account Statements**: PDF generation for account statements
3. **Recurring Transfers**: Schedule automatic transfers
4. **Account Categories**: Organize accounts by categories
5. **Budgeting Tools**: Spending analysis and budgets
6. **Two-Factor Authentication**: Enhanced security
7. **Mobile App**: React Native companion app
8. **Real Exchange Rates**: Integration with live currency APIs
9. **Account Export**: CSV/Excel export functionality
10. **Advanced Analytics**: Account performance dashboards

### Technical Improvements
1. **Pagination**: Large dataset handling
2. **Caching**: Redis integration for performance
3. **Database**: Migration to PostgreSQL
4. **Authentication**: OAuth integration
5. **Microservices**: Service architecture
6. **Performance**: Bundle optimization and lazy loading

## 📋 Best Practices Implemented

### UX/UI Standards (2025)
- ✅ **Accessibility**: WCAG 2.1 compliant components
- ✅ **Mobile-First**: Responsive design across all devices
- ✅ **Performance**: Optimized loading and interactions
- ✅ **Intuitive Navigation**: Clear information architecture
- ✅ **Error Prevention**: Proactive validation and guidance
- ✅ **Consistent Design**: Unified design system
- ✅ **Dark Mode**: System-aware theme support

### Modern Banking UX
- ✅ **Real-time Validation**: Immediate feedback
- ✅ **Clear Status Indicators**: Visual account status
- ✅ **Secure Operations**: Confirmation for important actions
- ✅ **Multi-currency Support**: Global banking standards
- ✅ **Progressive Enhancement**: Works without JavaScript
- ✅ **Offline Resilience**: Graceful degradation

### Development Standards
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Testing**: Unit and E2E test coverage
- ✅ **Code Quality**: ESLint and Prettier
- ✅ **Documentation**: Comprehensive documentation
- ✅ **Version Control**: Semantic commits
- ✅ **Performance**: Lighthouse optimization

## 🤝 Contributing

### Development Workflow
1. Feature branches from `main`
2. Comprehensive testing required
3. Type-safe implementations
4. I18n coverage for new features
5. Documentation updates

### Code Standards
- TypeScript strict mode
- ESLint and Prettier compliance
- Component-driven architecture
- Test-driven development
- Semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
