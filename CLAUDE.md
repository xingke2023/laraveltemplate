# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel application with React frontend using Inertia.js, specifically designed for WeChat ecosystem integration. The stack includes:
- **Backend**: Laravel 12 with PHP 8.2+, Laravel Socialite with WeChat provider
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite with Laravel Vite Plugin
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with custom components
- **Database**: SQLite with extended user fields for WeChat integration
- **WeChat Integration**: EasyWeChat v6.17, WeChat Pay API, OAuth authentication
- **Testing**: PHPUnit for backend, no frontend tests configured

## Development Commands

### Backend Commands
```bash
# Start development server (includes frontend build, queue, logs)
composer run dev

# Start development server with SSR
composer run dev:ssr

# Run tests
composer run test
# or
php artisan test

# Run specific test
php artisan test --filter=TestName

# Code formatting (Laravel Pint)
vendor/bin/pint

# Database operations
php artisan migrate
php artisan migrate:fresh --seed
```

### Frontend Commands
```bash
# Build for production
npm run build

# Build with SSR
npm run build:ssr

# Development server (Vite only)
npm run dev

# Linting and formatting
npm run lint
npm run format
npm run format:check

# Type checking
npm run types
```

## Architecture Overview

### Backend Structure
- **Controllers**: Follow standard Laravel controller patterns with Inertia responses
  - `WeChatController.php` - WeChat OAuth authentication flow with seamless login experience
  - `WeChatPayController.php` - EasyWeChat wrapper for payment processing
  - `WeChatPayDirectController.php` - Direct WeChat Pay API integration
- **Routes**: Organized in separate files (`web.php`, `auth.php`, `settings.php`, `wechat.php`)
- **Models**: Standard Eloquent models with WeChat user extensions in `app/Models/User.php`
- **Middleware**: Custom middleware for appearance handling and Inertia requests
- **Configuration**: WeChat-specific config in `config/wechat_pay.php` and `config/services.php`

### Frontend Structure
- **Entry Point**: `resources/js/app.tsx` - sets up Inertia app with WeChat integration
- **Pages**: `resources/js/pages/` - Inertia page components
  - Public pages: `/home`, `/hall`, `/latest` (no auth required)
  - `auth/WeChatLoginSuccess.tsx` - React-based login success with smooth transitions
  - `Payment/Index.tsx` - WeChat Pay integration
- **Components**: `resources/js/components/` - reusable UI components
  - `AppWrapper.tsx` - Wraps pages with WeChat functionality
  - `WeChatLoginPrompt.tsx` - Elegant WeChat login modal (currently disabled)
  - `WeChatAutoLogin.tsx` - Auto-login detection for WeChat browser
- **Utilities**: `resources/js/utils/wechat.ts` - WeChat browser detection and API helpers
- **Types**: TypeScript definitions for WeChat globals and API responses

### WeChat Integration Architecture

1. **Authentication Flow**:
   - WeChat browser detection via user agent
   - OAuth flow using `snsapi_base` scope for seamless login
   - User creation/update with WeChat OpenID binding
   - Session management to prevent login loops

2. **Payment Integration**:
   - Dual payment controllers for flexibility (EasyWeChat wrapper + Direct API)
   - JSAPI payment flow for in-WeChat browser
   - Certificate-based authentication with RSA signatures
   - Payment status tracking and refund capabilities

3. **Frontend WeChat Features**:
   - Browser environment detection and auto-login prompting
   - Payment button integration with WeChat JSAPI
   - VIP membership feature with QR code reveal after payment
   - Seamless page transitions using Inertia.js for login success

### Key Patterns
- **Inertia.js**: Server-side routing with client-side navigation
- **SSR Ready**: Configured for server-side rendering via `resources/js/ssr.tsx`
- **Type Safety**: Full TypeScript setup with path aliases (`@/*` → `resources/js/*`)
- **WeChat-First Design**: Auto-detection and optimization for WeChat browser environment
- **Seamless Login**: React-based page transitions eliminate refresh during WeChat authentication
- **Theme System**: Custom appearance/theme handling with local storage persistence

## Configuration Files

### Frontend Configuration
- `vite.config.ts`: Vite configuration with Laravel plugin, React, Tailwind
- `tsconfig.json`: TypeScript configuration with path aliases
- `eslint.config.js`: ESLint configuration for React and TypeScript
- `components.json`: Shadcn/ui component configuration

### Backend Configuration
- `config/inertia.php`: Inertia.js configuration with SSR enabled
- `config/wechat_pay.php`: WeChat Pay API configuration and certificates
- `config/services.php`: WeChat OAuth provider configuration 
- `phpunit.xml`: PHPUnit test configuration
- Database uses SQLite by default (`database/database.sqlite`)
- WeChat certificates stored in `storage/certs/`

## Testing

### Backend Tests
- Located in `tests/Feature/` and `tests/Unit/`
- Run with `php artisan test` or `composer run test`
- Uses SQLite in-memory database for testing

### Frontend
- No test framework currently configured
- Consider adding Jest/Vitest for component testing

## Development Notes

### WeChat Integration Specifics
- WeChat OAuth uses `snsapi_base` scope for silent authentication within WeChat browser
- Payment integration requires WeChat merchant certificates (stored in `storage/certs/`)
- WeChat login components are designed to be non-intrusive (prompt disabled by user preference)
- VIP membership feature unlocks QR codes after ¥9.9 WeChat Pay payment
- All WeChat-related functionality degrades gracefully in non-WeChat browsers

### Authentication & UI
- Hybrid authentication supports both email/password and WeChat OAuth
- Theme/appearance system implemented with React hooks and local storage
- UI components follow Radix UI patterns with Tailwind styling
- Seamless login experience using Inertia.js page transitions (no refresh)
- Public pages (`/home`, `/hall`, `/latest`) accessible without authentication

### Database & Infrastructure
- Database migrations include users table extended with WeChat fields
- SQLite default with WeChat user data persistence
- SSR enabled and configured for production builds