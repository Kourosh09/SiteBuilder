# BuildwiseAI - Real Estate Development Finance Platform

## Overview

BuildwiseAI is a web application designed to streamline financial management for real estate developers and investors. It provides AI-powered tools for feasibility analysis, development budgeting, joint venture structuring, and automated investor reporting. The platform targets small to mid-size real estate developers, offering efficient, specialized financial management solutions. It is built as a single-page application with a React frontend and an Express backend. BuildwiseAI is production-ready, featuring a complete AI-powered real estate development platform, a fully functional contractor marketplace, and is configured for secure deployment. It incorporates the latest 2025 BC housing regulations, including SSMUH compliance analysis and Bill 47 TOA analysis, and integrates with the official DDF Web API v1.0 for real-time MLS data.

**PROPERTY DATA PERSISTENCE SYSTEM**: All property information from initial search (BC Assessment data, MLS comparables, market analysis) automatically flows through all subsequent analyses and calculations without manual re-entry. The PropertySessionManager creates unique sessions that carry data through zoning analysis, AI analysis, financial calculations, design suggestions, and PDF report generation.

**MUNICIPAL DATA INTEGRATION (AutoProp-Style)**: Comprehensive integration with real BC municipal zoning codes, bylaws, and building requirements similar to AutoProp's data aggregation approach. Currently supports Vancouver, Burnaby, Richmond, and Surrey with complete zoning regulations, applicable bylaws, and building code requirements. Municipal data enhances AI design generation with real regulatory constraints and opportunities.

**DEVELOPMENT OPTIMIZATION ENGINE**: Advanced analysis system that evaluates all integrated data sources (BC Assessment, MLS, municipal zoning, bylaws, building codes) to generate optimized development scenarios with financial analysis, compliance scoring, and city-compliant construction designs. Automatically determines best development possibilities and generates AI-powered architectural recommendations that meet all municipal requirements.

## User Preferences

Preferred communication style: Simple, everyday language.
User prefers email/SMS code verification over username/password system.
User is a licensed realtor with REBGV credentials.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **UI Components**: Shadcn/ui, built on Radix UI primitives.
- **Styling**: Tailwind CSS with custom design tokens.
- **State Management**: TanStack Query (React Query).
- **Forms**: React Hook Form with Zod validation.
- **Build Tool**: Vite.

### Backend Architecture
- **Runtime**: Node.js with Express.js (ES modules).
- **Language**: TypeScript.
- **API Design**: RESTful API endpoints.
- **Middleware**: Custom logging middleware.
- **Error Handling**: Centralized error handling.

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM.
- **ORM**: Drizzle ORM for type-safe operations.
- **Schema Management**: Shared schema definitions (Zod).
- **Migrations**: Drizzle Kit.
- **Development Storage**: In-memory storage.
- **Production Storage**: Neon Database serverless PostgreSQL.

### Core Platform Features & Design
- **Authentication**: Email/SMS verification system with protected dashboard access.
- **Dashboard Interface**: 9-tab interface including: Overview, AI Analysis (OpenAI integration), Zoning (Bill 44/47/TOD compliance), Permits (150+ municipal), Alerts (MLS-style notifications), Financial (ROI/cash flow), Compliance, Lead Gen, and Partners.
- **AI Services**: OpenAI GPT-4o integration for property analysis, content generation, design suggestions, and DALL-E image generation.
- **Data Services**: Property data service, zoning intelligence service, lead generation service, permit tracker service, partner finder service, and AI design generator service.
- **API Endpoints**: Over 30 endpoints covering various functionalities.
- **Comprehensive PDF Report Generator**: jsPDF-based reports for zoning analysis, integrating multi-policy analysis (Bill 44, Bill 47, TOD).
- **Property Alerts System**: Real-time MLS integration with customizable filters.
- **Financial Modeling Suite**: Advanced ROI calculators, cash flow projections, and construction cost estimators.
- **Regulatory Compliance Tracker**: Bill 44/47 monitoring and municipal bylaw change notifications.
- **BC-First Strategy**: Platform primarily focused on BC municipalities, with expansion plans.
- **Technical Stack**: React/TypeScript frontend, Express backend, OpenAI API integration.
- **Design Patterns**: Shared Schema, Component-Driven Development, End-to-end Type Safety, Error Boundaries, Responsive Design, Performance Optimization.

## External Dependencies

- **Database Hosting**: Neon Database (@neondatabase/serverless).
- **AI Integration**: OpenAI API.
- **UI Framework**: Radix UI component ecosystem.
- **Validation**: Zod.
- **Date Handling**: date-fns.
- **Styling**: Class Variance Authority.
- **MLS Integration**: REALTOR.ca DDF Web API v1.0.
- **Marketing Integration**: Framer (for the marketing site).
- **Mapping**: Geographic coordinate data for mapping applications (implied from MLS integration).
- **Specific Data Sources**: Official BC government regulations (gov.bc.ca/housing-initiatives, BC Laws Bill 47), Vancouver Open Data API (for permits).
- **Potential Future Integrations**: BC Assessment Commercial API, REBGV-specific RETS endpoints (user to obtain access).