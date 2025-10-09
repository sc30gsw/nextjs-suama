# Project Structure

## Root Directory Organization

```
nextjs-suama/
├── .kiro/                    # Kiro spec-driven development files
├── .claude/                  # Claude Code configuration & commands
├── .next/                    # Next.js build files (auto-generated)
├── .vercel/                  # Vercel deployment configuration
├── public/                   # Static assets (images, etc.)
├── src/                      # Source code main directory
├── node_modules/             # Dependencies (managed by Bun)
├── auth-schema.ts           # Better Auth schema definition
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
├── README.md                # Project overview
├── CODING-STANDARDS.md      # Coding standards
└── CLAUDE.md                # Claude Code project settings
```

## Source Directory Structure (Bulletproof React Pattern)

### App Router Structure (`src/app/`)
```
src/app/
├── layout.tsx               # Root layout
├── page.tsx                 # Root page
├── error.tsx                # Global error page
├── not-found.tsx           # 404 page
├── unauthorized.tsx        # 401 page
├── forbidden.tsx           # 403 page
├── globals.css             # Global styles
├── favicon.ico             # Favicon
├── (auth)/                 # Authentication-related routes
│   ├── layout.tsx          # Auth layout
│   ├── loading.tsx         # Auth loading
│   ├── sign-in/page.tsx    # Sign-in page
│   ├── sign-up/page.tsx    # Sign-up page
│   ├── forgot-password/page.tsx
│   └── reset-password/[token]/page.tsx
├── (protected)/            # Authentication-required routes
│   ├── (reports)/          # Report-related routes
│   │   ├── daily/          # Daily reports
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── today/page.tsx
│   │   │   ├── mine/page.tsx
│   │   │   └── @breadcrumbs/  # Parallel routes
│   │   └── weekly/         # Weekly reports
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── list/[dates]/
│   │       │   ├── page.tsx
│   │       │   ├── register/page.tsx
│   │       │   └── edit/[weeklyReportId]/page.tsx
│   │       └── @breadcrumbs/
│   ├── (reports-contexts)/ # Report context management
│   │   ├── client/list/page.tsx
│   │   ├── project/list/page.tsx
│   │   ├── mission/list/page.tsx
│   │   ├── appeal/list/page.tsx
│   │   └── trouble/list/page.tsx
│   └── (user)/             # User management
│       ├── users/page.tsx
│       └── [userId]/
│           ├── settings/page.tsx
│           └── change-password/page.tsx
└── api/                    # API Routes
    ├── auth/[...all]/route.ts    # Better Auth
    └── [[...route]]/route.ts     # Hono API
```

### Features Directory (`src/features/`)
```
src/features/
├── auth/                   # Authentication features
│   ├── actions/            # Server Actions
│   ├── components/         # UI components
│   └── types/schemas/      # Zod schemas
├── users/                  # User management
│   ├── actions/
│   ├── api/
│   ├── components/
│   ├── server/            # Server-side fetching
│   ├── types/
│   └── utils/
├── reports/               # Report features
│   ├── daily/             # Daily reports
│   │   ├── actions/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/         # Custom hooks
│   │   ├── server/
│   │   └── types/
│   ├── weekly/            # Weekly reports
│   │   ├── actions/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── queries/       # TanStack Query
│   │   ├── server/
│   │   ├── types/
│   │   └── utils/
│   └── components/        # Shared report components
└── report-contexts/       # Report contexts
    ├── clients/
    ├── projects/
    ├── missions/
    ├── appeals/
    ├── troubles/
    ├── components/        # Shared context components
    ├── types/             # Shared type definitions
    └── utils/             # Shared utilities
```

### Shared Directories
```
src/
├── components/            # Shared components
│   ├── providers/         # Provider components
│   └── ui/               # UI components
│       ├── intent-ui/    # Intent UI wrappers
│       ├── pagination/   # Pagination
│       └── sidebar/      # Sidebar
├── constants/            # Constant definitions
├── db/                   # Database related
│   └── schema.ts         # Drizzle schema
├── hooks/                # Global hooks
├── lib/                  # Library configurations
├── types/                # Global type definitions
├── utils/                # Utility functions
├── env.ts               # Environment variable validation
└── middleware.ts        # Next.js middleware
```

## Code Organization Patterns

### Feature-Based Organization
Each feature is managed in independent directories, maintaining the following structure:

```
feature/
├── actions/             # Server Actions (1 file = 1 function)
├── api/                 # API Route Handlers
├── components/          # UI components
├── hooks/              # Custom hooks (use-*.ts)
├── server/             # Server-side fetching
├── types/              # Type definitions
│   ├── schemas/        # Zod schemas
│   └── search-params/  # nuqs search parameter types
└── utils/              # Utility functions
```

### Component Organization
- **Server Components**: Default, data fetching capable
- **Client Components**: Explicitly marked with `"use client"`, event handling
- **Shared Components**: Shared via `src/components/ui/`

### Data Fetching Colocation
- **Execute data fetching in leaf components**
- **Use React.cache in Server Components**
- **Use TanStack Query in Client Components**

## File Naming Conventions

### Files and Directories
- **Kebab-case**: File and directory names
- **Exception**: Dynamic Routes `[id]`, `[...slug]`

### Components
- **Kebab-case**: `user-search-form.tsx`
- **PascalCase**: Function names `UserSearchForm`

### Functions and Variables
- **camelCase**: `getUserData`, `searchParams`

### Constants
- **SCREAMING_SNAKE_CASE**: `API_BASE_URL`, `MAX_FILE_SIZE`

### Files by Type
```
actions/action-name.ts           # Server Action
api/route.ts                     # API Route Handler
components/component-name.tsx    # React Component
hooks/use-hook-name.ts          # Custom Hook
types/type-name.ts              # Type Definition
schemas/schema-name-schema.ts   # Zod Schema
utils/util-function-name.ts     # Utility Function
```

## Import Organization

### Path Mapping
```typescript
import { Component } from '~/components/ui/component'
import { api } from '~/lib/api'
import type { User } from '~/types/user'
```

### Import Order
1. **React-related**: React, Next.js
2. **External libraries**: Third-party packages
3. **Internal modules**: `~/` paths
4. **Relative paths**: `./`, `../`
5. **Type imports**: `import type`

### Import Examples
```typescript
// 1. React-related
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

// 2. External libraries
import { z } from 'zod'
import { Button } from '@intentui/react'

// 3. Internal modules
import { getUserData } from '~/features/users/server/fetcher'
import { UserForm } from '~/features/users/components/user-form'

// 4. Relative paths
import { LocalComponent } from './local-component'

// 5. Type imports
import type { InferResponseType } from 'hono'
import type { User } from '~/types/user'
```

## Key Architectural Principles

### 1. Single Source of Truth
- **Type definitions**: Derived from Hono RPC types or Drizzle schemas
- **Constants**: Define once, reference from multiple locations
- **Configuration**: Centrally managed through environment variables

### 2. AHA Programming
- **Avoid Hasty Abstraction**: Prevent premature abstraction
- **Abstract on third pattern**: Consider abstraction when same code appears three times
- **Prioritize concreteness**: Avoid overly abstract designs

### 3. Composition Pattern
- **Small components**: Single responsibility principle
- **Composable**: High reusability design
- **Avoid Props Drilling**: Appropriate use of Context API

### 4. Data Fetching Strategy
- **Colocation**: Fetch data where it's used
- **Parallel fetching**: Optimize with Request Memoization
- **Cache strategy**: Utilize cacheTag and cacheLife

### 5. Error Boundary Strategy
- **Graduated error handling**: Page, layout, global levels
- **User-friendly**: Appropriate error messages
- **Developer experience**: Detailed error information (during development)

### 6. Performance First
- **Prioritize Server Components**: Minimize Client Components
- **Streaming SSR**: Progressive loading with Suspense
- **Bundle Size**: Send minimal necessary JavaScript

## Directory Creation Guidelines

### When to Create New Directories
1. **Adding new features**: New directory under features/
2. **Common patterns**: When used three or more times
3. **Separation of concerns**: When responsibilities are clearly separated

### Directory Naming Rules
1. **Plural forms**: When containing multiple files (`components/`, `actions/`)
2. **Singular forms**: Single concern (`api/`, `server/`)
3. **Feature names**: Clear names representing functionality (`reports/`, `users/`)

### Forbidden Patterns
- **Generic names**: `common/`, `shared/`, `helpers/`
- **Technical types**: `containers/`, `presentational/`
- **Mixed concerns**: Directories with multiple responsibilities