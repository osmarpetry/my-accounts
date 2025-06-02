import React from 'react'

// Mock all lucide-react icons
export const ChevronDown = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-chevron-down" />
  </svg>
)

export const Building2 = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-building-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-building" />
  </svg>
)

// Export other commonly used icons
export const Search = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-search-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-search" />
  </svg>
)

export const User = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-user-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-user" />
  </svg>
)

export const DollarSign = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-dollar-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-dollar" />
  </svg>
)

export const Calendar = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-calendar-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-calendar" />
  </svg>
)

export const Filter = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-filter-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-filter" />
  </svg>
)

export const Check = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-check-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-check" />
  </svg>
)

export const X = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-x-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-x" />
  </svg>
)

export const Plus = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-plus-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-plus" />
  </svg>
)

export const Edit = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-edit-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-edit" />
  </svg>
)

export const Trash = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-trash-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-trash" />
  </svg>
)

export const ArrowUpDown = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-arrow-up-down-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-arrow-up-down" />
  </svg>
)

export const Eye = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-eye-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-eye" />
  </svg>
)

export const EyeOff = ({ className, ...props }: any) => (
  <svg 
    data-testid="mock-eye-off-icon" 
    className={className} 
    {...props}
  >
    <path d="mock-eye-off" />
  </svg>
)

// Default export for dynamic imports
const LucideReact = {
  ChevronDown,
  Building2,
  Search,
  User,
  DollarSign,
  Calendar,
  Filter,
  Check,
  X,
  Plus,
  Edit,
  Trash,
  ArrowUpDown,
  Eye,
  EyeOff,
}

export default LucideReact 