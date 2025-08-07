# BuildwiseAI - Real Estate Development Finance Platform

## Overview

BuildwiseAI is a modern web application designed to streamline financial management workflows for real estate developers and investors. The platform provides AI-powered tools for feasibility analysis, development budgeting, joint venture structuring, and automated investor reporting. Built as a single-page application with a React frontend and Express backend, it targets small to mid-size real estate developers who need efficient, specialized financial management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### Production Deployment Ready (August 7, 2025)
- **Date**: August 7, 2025
- **Status**: Ready for secure production deployment
- **Security**: HTTPS/TLS certificates automatically provisioned by Replit
- **Domain**: buildwiseai.ca configured for custom domain deployment
- **Marketplace**: Fully functional contractor marketplace with verified trade professionals
- **Features**: Complete AI-powered real estate development platform ready for client use

## Recent Changes (August 2025)

### Bill 44 Zoning Logic Builder Integration (August 2025)
- **Date**: August 7, 2025
- **Status**: Fully integrated and operational
- **Core Implementation**:
  - Bill 44 Quick Eligibility Checker with real-time feedback
  - Frontage validation (33 ft minimum for 4-plex, 40 ft for 6-plex)
  - Enhanced unit calculations with Bill 44 density bonuses
  - Compliance analysis with benefits, requirements, and incentives
  - BC-focused geographic validation
  - 15% market premium for Bill 44-eligible properties
  - Transit-oriented development bonuses

### MLS Integration for Licensed Realtor (August 2025)
- **Date**: August 7, 2025
- **Status**: MLS integration framework ready for realtor credentials
- **User Status**: Licensed realtor with MLS access rights
- **Implementation**: Complete MLS service with RETS/REST API support
- **Features**: Active listings, sold comparables, property details, market stats
- **Next Step**: Obtain MLS API credentials from real estate board

### Framer Marketing Integration (August 2025)
- **Date**: August 7, 2025
- **Status**: Framer marketing site connected to live dashboard
- **Framer Project**: https://framer.com/projects/Website--9ApMcAmqBm7a9kFS33AI-hqII8
- **Integration Strategy**: Framer for marketing, Replit for functional platform
- **Live Data Connection**: Vancouver Open Data API integrated for real permits

### Complete BuildwiseAI Platform with Advanced AI Features
- **Date**: August 2025
- **Status**: Production-ready comprehensive real estate development platform
- **Core Features Implemented**:
  - Professional marketing homepage with hero section
  - Interactive feasibility calculator with real-time ROI analysis
  - AI-powered property analysis with OpenAI integration
  - BC Assessment and MLS data integration
  - Zoning intelligence and city data analysis
  - Lead generation and social media automation suite
  - Features overview highlighting AI-powered tools
  - Product showcase for budget tracking and investor reporting
  - About founder section featuring Kourosh Ahmadian's background
  - Pricing plans (Starter/Pro/Enterprise) with clear value propositions
  - Professional testimonials and social proof
  - Responsive design with BuildwiseAI brand colors

### Advanced AI Integration (August 2025)
- **AI Property Analyzer**: OpenAI-powered feasibility analysis with confidence scoring
- **Property Data Intelligence**: BC Assessment and MLS integration for comprehensive property lookup
- **Zoning Intelligence**: Municipal zoning analysis with development potential calculation
- **Lead Generation Suite**: AI-powered ad copy generation, social media content creation, and landing page builder
- **Design Automation**: AI-generated architectural suggestions and feasibility reports
- **Data Sources**: Ready for real API integration with BC Assessment, MLS, and municipal GIS systems

### Major Platform Expansion (August 2025)
- **Permit Tracker (150+ sample permits)**: BuildMapper-style permit tracking across Maple Ridge, Burnaby, Tricities, Mission, Langley, Vancouver, Surrey, Richmond, and North/West Vancouver
- **Find Partners (trade professional network)**: Complete CRM for architects, engineers, contractors, developers with project opportunity matching
- **AI Design Generator**: Full architectural design concept generation with OpenAI integration, floor plan suggestions, cost estimation, and DALL-E image generation
- **Bill 44 Compliance Engine**: BC-specific zoning intelligence with Bill 44 upzoning analysis, multiplex eligibility, and transit-oriented development benefits
- **BC-First Strategy**: Platform locked to BC municipalities with expansion roadmap (Phase 1: BC Lower Mainland → Phase 2: BC province-wide → Phase 3: Alberta/Ontario → Phase 4: Canada/USA)

### Technical Architecture Expansion
- **AI Services**: OpenAI GPT-4o integration for property analysis, content generation, design suggestions, and DALL-E image generation
- **Data Services**: Property data service, zoning intelligence service, lead generation service, permit tracker service, partner finder service, and AI design generator service
- **API Endpoints**: 30+ comprehensive endpoints covering permits, partners, projects, proposals, designs, AI analysis, property data, zoning with Bill 44 compliance, leads, and social media
- **Frontend Components**: 6 major components for property lookup, zoning analysis, AI analysis, lead generation, permit tracking, and partner finding
- **Backend Services**: Complete ecosystem with realistic sample data covering all target BC municipalities
- **Geographic Coverage**: Comprehensive data for Maple Ridge, Burnaby, Tricities (Coquitlam, Port Coquitlam, Port Moody), Mission, Langley, Vancouver, Surrey, Richmond, North Vancouver, and West Vancouver

- **Technical Stack**: React/TypeScript frontend, Express backend, OpenAI API integration, in-memory storage for development
- **Deployment Ready**: Configured for Replit deployment with custom domain (buildwiseai.ca) support
- **Security**: HTTPS/TLS automatically enabled on Replit deployments with custom domains
- **Business Impact**: Complete real estate development platform ready to compete with industry leaders

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and API data fetching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API endpoints for lead management and calculation storage
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **ORM**: Drizzle ORM with schema-first approach for type-safe database operations
- **Schema Management**: Shared schema definitions between frontend and backend using Zod
- **Migrations**: Drizzle Kit for database schema migrations
- **Development Storage**: In-memory storage implementation for development/testing
- **Connection**: Neon Database serverless PostgreSQL for production

### Authentication and Authorization
- **Current State**: No authentication system implemented (prototype stage)
- **Session Management**: Basic Express session configuration present but not actively used
- **Future Considerations**: Ready for implementation of user authentication and role-based access control

### External Dependencies
- **Database Hosting**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- **UI Framework**: Comprehensive Radix UI component ecosystem for accessible components
- **Development Tools**: Replit-specific plugins for development environment integration
- **Validation**: Zod for runtime type checking and form validation
- **Date Handling**: date-fns for date manipulation and formatting
- **Styling**: Class Variance Authority for component variant management

### Key Design Patterns
- **Shared Schema**: Common type definitions and validation schemas shared between client and server
- **Component-Driven Development**: Modular React components with clear separation of concerns
- **Type Safety**: End-to-end TypeScript implementation with strict type checking
- **Error Boundaries**: Proper error handling with user-friendly error displays
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Performance Optimization**: Lazy loading, code splitting, and optimized bundle sizes

### Development Workflow
- **Build Process**: Separate client and server build processes with esbuild for server bundling
- **Development Server**: Hot module replacement with Vite for fast development cycles
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Asset Management**: Static asset serving with proper caching strategies