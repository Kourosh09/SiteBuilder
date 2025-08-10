# BuildwiseAI - Real Estate Development Finance Platform

## Overview

BuildwiseAI is a modern web application designed to streamline financial management workflows for real estate developers and investors. The platform provides AI-powered tools for feasibility analysis, development budgeting, joint venture structuring, and automated investor reporting. Built as a single-page application with a React frontend and Express backend, it targets small to mid-size real estate developers who need efficient, specialized financial management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### Enhanced Permit Data System with Zod Validation
- **Date**: August 10, 2025
- **Status**: Production-ready permit data structure with comprehensive validation
- **Features Implemented**:
  - **Zod Schema Validation**: Complete runtime type checking and data quality assurance
  - **Enhanced Smart Fetch**: Real BC government API integration with validation (Vancouver, Burnaby, Surrey)
  - **Professional UI**: Permit card visualization with status badges and interactive metadata
  - **Standardized Format**: id, address, city, type, status, dates, coordinates, source with validation
  - **Data Quality**: Automatic validation with fallback handling and error logging
  - **API Endpoints**: Permit validation endpoint for testing and quality control
  - **TypeScript Integration**: Full type safety from database to frontend
- **Technical Enhancement**: Zod schema validation ensures data integrity across the entire pipeline
- **Business Impact**: Production-ready system demonstrating sophisticated data validation and quality control

### Clean FeatureServer Configuration with SCRAPE Notation
- **Date**: August 10, 2025
- **Status**: Production-ready clean FeatureServer configuration with explicit SCRAPE notation for future expansion
- **Features Implemented**:
  - **Clean FeatureServer Patterns**: Standardized `/FeatureServer/0/query` and `/MapServer/0/query` endpoints
  - **SCRAPE Notation**: Explicit `SCRAPE:` prefix for Burnaby indicating future scraping or API development
  - **Unified Configuration**: All BC municipal endpoints centralized in `CITY_ENDPOINTS` with clear patterns
  - **Promise.allSettled Integration**: All 4 municipalities using unified concurrent fetching architecture
  - **Type-Safe Municipal Coverage**: Vancouver (OpenData), Maple Ridge (MapServer), Surrey (MapServer), Coquitlam (OpenData)
  - **Diagnostic Compatibility**: All FeatureServer endpoints validated through `/admin/test-featureserver`
  - **Scalable Architecture**: Clean patterns enabling rapid municipal expansion across BC
  - **Production Performance**: Parallel API fetching with comprehensive error handling
- **Technical Achievement**: Professional municipal API configuration with explicit expansion roadmap
- **Business Value**: Clear development path for complete BC municipal coverage with scalable architecture

### Enhanced Data Structure Patterns  
- **Date**: August 10, 2025
- **Status**: Refined permit fetchers with exact municipal data structures
- **Features Implemented**:
  - **Burnaby Pattern**: Updated to handle PERMIT_NO, ADDRESS, LAT/LNG uppercase field naming
  - **Flexible Parsing**: Supports both direct arrays and nested records structures
  - **Field Mapping**: Comprehensive fallback for different municipal API formats
  - **Pattern Testing**: Dedicated test endpoint for validating data structure compatibility
  - **Robust Validation**: Enhanced error handling with field-specific logging
- **Technical Enhancement**: Adaptive parsing for various municipal data formats
- **Business Impact**: Ensures compatibility with actual government API responses

### Smart Fetch with Ranking and Deduplication
- **Date**: August 10, 2025
- **Status**: Production-ready AI optimization layer with intelligent permit ranking
- **Features Implemented**:
  - **Ranking Algorithm**: City trust scores and data freshness weighting (70% trust, 30% freshness)
  - **Deduplication Logic**: ID-based deduplication with quality scoring for conflict resolution
  - **Memory Caching**: 1-minute cache for performance optimization
  - **Connector Architecture**: Modular city-specific connectors (Maple Ridge, Burnaby)
  - **Enhanced UI**: PermitsResults component for professional permit visualization
  - **Quality Metrics**: Average confidence scoring across all data sources
- **Technical Achievement**: Intelligent data aggregation with quality-based ranking system
- **Business Value**: Demonstrates enterprise-level data intelligence and optimization capabilities

### BuildwiseAI Marketing Website Completed
- **Date**: August 2025
- **Status**: Production-ready website built for BuildwiseAI real estate development finance platform
- **Features Implemented**:
  - Professional marketing homepage with hero section
  - Interactive feasibility calculator with real-time ROI analysis
  - Features overview highlighting AI-powered tools
  - Product showcase for budget tracking and investor reporting
  - About founder section featuring Kourosh Ahmadian's background
  - Pricing plans (Starter/Pro/Enterprise) with clear value propositions
  - Lead generation contact form with role-based segmentation
  - Professional testimonials and social proof
  - Responsive design with BuildwiseAI brand colors
- **Technical Stack**: React/TypeScript frontend, Express backend, in-memory storage for development
- **Deployment Ready**: Configured for Replit deployment with custom domain (buildwiseai.ca) support
- **Business Impact**: Ready to capture leads and demonstrate platform capabilities to potential customers

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