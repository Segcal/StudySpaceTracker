# TaxEase - Tax Management Platform

## Overview

TaxEase is a comprehensive tax management platform built with a modern full-stack architecture. The application allows users to manage income tax, property tax, and utility bills in one secure platform. It features user authentication, tax calculations, and a dashboard for tracking various tax-related information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth (OIDC-based) with session management
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple

### Database Schema
The application uses a PostgreSQL database with the following key tables:
- `users` - User profiles and authentication data
- `sessions` - Session storage for authentication
- `tax_profiles` - Tax-related information including income, property details, and calculated taxes
- `contact_messages` - User support messages

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Middleware**: Express middleware for route protection
- **Flow**: OAuth 2.0 flow with automatic user creation and profile management

### Tax Management
- **Income Tax Calculation**: 17% tax rate on reported income
- **Property Tax Calculation**: 1.2% tax rate on property value
- **Utility Bills**: Electric and gas bill tracking
- **Profile Management**: Complete tax profile with NIN, property details, and income information

### User Interface
- **Design System**: Modern, accessible UI with Radix UI components
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Theme**: Professional blue/gray color scheme with CSS custom properties
- **Components**: Reusable UI components including forms, cards, modals, and navigation

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating sessions stored in PostgreSQL
2. **Profile Creation**: New users complete a registration form with tax-related information
3. **Tax Calculations**: Backend calculates taxes based on income and property values
4. **Dashboard Display**: Frontend displays tax information, due dates, and utility bills
5. **Contact System**: Users can submit support messages through a modal form

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection and querying
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **express**: Web server framework
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **@radix-ui/***: UI component primitives

### Authentication Dependencies
- **openid-client**: OIDC authentication handling
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with hot module replacement
- **Backend**: tsx for TypeScript execution with automatic restarts
- **Database**: Neon Database with connection pooling
- **Environment**: Replit-specific configurations and error handling

### Production Build
- **Frontend**: Vite production build with static asset optimization
- **Backend**: esbuild bundle for Node.js with external dependencies
- **Database**: Production PostgreSQL with connection pooling
- **Deployment**: Express server serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPLIT_DOMAINS**: Allowed domains for Replit Auth
- **ISSUER_URL**: OIDC issuer URL for authentication
- **NODE_ENV**: Environment mode (development/production)

The application follows a monorepo structure with shared TypeScript definitions, ensuring type safety across the full stack. The architecture prioritizes developer experience with hot reloading, comprehensive error handling, and modern tooling while maintaining production-ready performance and security.