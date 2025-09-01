# Overview

MomPlanner is a comprehensive web application designed specifically for mothers with children aged 3 months to 2 years. The app serves as a complete planning tool that helps mothers track and manage various aspects of their child's daily routine, including feeding schedules, sleep patterns, meal planning, task management, and personal notes. Built as a premium application with subscription-worthy features, it provides an intuitive dashboard with progress tracking, charts, and data visualization to help mothers make informed decisions about their child's care.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a modern component-based architecture. The application uses Vite as the build tool and development server, providing fast hot module replacement and optimized builds. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, ensuring accessibility and consistent design patterns.

Key architectural decisions:
- **Component Library**: Uses shadcn/ui with Radix UI for accessible, pre-built components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod for validation
- **Mobile-First Design**: Responsive layout with bottom navigation optimized for mobile use

## Backend Architecture
The backend follows a REST API architecture built with Express.js and TypeScript. The server implements a modular structure with separate concerns for routing, storage, and middleware.

Key architectural decisions:
- **API Design**: RESTful endpoints with CRUD operations for all resources
- **Data Validation**: Zod schemas shared between frontend and backend for type safety
- **Storage Layer**: Abstracted storage interface allowing for future database implementations
- **Error Handling**: Centralized error handling middleware with consistent error responses
- **Development Setup**: Integrated Vite development server with API proxy

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema is designed to support multi-user scenarios while currently implementing a single default user system.

Key architectural decisions:
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe queries and migrations
- **Schema Design**: Normalized tables for users, feedings, sleep sessions, meals, tasks, and notes
- **Data Types**: Proper handling of timestamps, durations, and categorized data
- **Migrations**: Automated schema migrations with drizzle-kit

## Authentication and Authorization
Currently implements a simplified authentication system with a default user approach, designed to be easily extensible for multi-user scenarios.

Key architectural decisions:
- **Current State**: Single default user system for MVP
- **Future Extensibility**: Schema includes user references for easy multi-user migration
- **Session Management**: Prepared for cookie-based sessions with connect-pg-simple

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Drizzle ORM**: Type-safe database toolkit with migration support

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Consistent icon library for UI elements
- **Google Fonts**: Inter font family for typography

## Development Tools
- **Vite**: Modern build tool with fast development server
- **TypeScript**: Static type checking across the entire application
- **React Query**: Server state management and caching
- **React Hook Form**: Performant form handling with validation
- **Zod**: Runtime type validation and schema definition

## Data Visualization
- **Recharts**: Charting library for progress tracking and data visualization
- **Date-fns**: Date manipulation and formatting with Portuguese locale support

## Hosting and Deployment
- **Replit**: Development and hosting platform with integrated tools
- **esbuild**: Fast JavaScript bundler for production builds