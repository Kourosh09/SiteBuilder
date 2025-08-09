# BuildwiseAI - Real Estate Development Finance Platform

## Overview

BuildwiseAI is a comprehensive AI-powered real estate development platform for the BC market that transforms property development from complex guesswork into data-driven decisions. The platform integrates BC Assessment data, MLS listings, AutoProp-style municipal zoning/bylaw databases, and AI-generated construction designs with a complete contractor marketplace. BuildwiseAI is production-ready with a fully functional marketing ecosystem including interactive landing pages, automated lead capture, email nurturing sequences, and comprehensive social media strategy. The system demonstrates complete workflow from property address input to city-compliant development plans with contractor proposals and project timelines.

**LATEST UPDATE (August 2025)**: **FREE DATA INTEGRATION COMPLETE** - Successfully eliminated expensive LTSA costs ($8/query) by implementing 100% FREE data sources. Vancouver Open Data API integrated and operational for property tax records with authentic BC Assessment data. LTSA ParcelMap BC identified for FREE property identification (vs $10.72 title searches). **COMPETITIVE ADVANTAGE**: Zero data costs enable $29-127/month pricing vs AutoProp's $125+ model, achieving ~95% profit margins. System maintains data integrity by using only authentic government sources - no synthetic data generation.

**PROPERTY DATA PERSISTENCE SYSTEM**: All property information from initial search (BC Assessment data, MLS comparables, market analysis) automatically flows through all subsequent analyses and calculations without manual re-entry. The PropertySessionManager creates unique sessions that carry data through zoning analysis, AI analysis, financial calculations, design suggestions, and PDF report generation. **AUTO-FILL FUNCTIONALITY**: Dashboard property form automatically retrieves and populates lot size and assessed value from authentic BC Assessment data when address and city are entered, eliminating manual data entry errors.

**MUNICIPAL DATA INTEGRATION (AutoProp Partnership Target)**: Comprehensive integration with real BC municipal zoning codes, bylaws, and building requirements similar to AutoProp's data aggregation approach. Currently supports 9 major BC municipalities: Vancouver, Burnaby, Richmond, Surrey, Maple Ridge, Coquitlam, Port Coquitlam, Port Moody, and Mission with complete zoning regulations, applicable bylaws, and building code requirements. Integration includes 2024-2025 Provincial Housing Legislation compliance (SSMUH, Transit-Oriented Areas) across all municipalities. Municipal data enhances AI design generation with real regulatory constraints and opportunities. **AUTOPROP INTEGRATION PLAN**: Researching business partnership with AutoProp (26,000+ BC users) for enhanced municipal data access including MLS, Land Title, GIS, and complete BC zoning database integration.

**DEVELOPMENT OPTIMIZATION ENGINE**: Advanced analysis system that evaluates all integrated data sources (BC Assessment, MLS, municipal zoning, bylaws, building codes) to generate optimized development scenarios with financial analysis, compliance scoring, and city-compliant construction designs. Automatically determines best development possibilities and generates AI-powered architectural recommendations that meet all municipal requirements.

**LOT-BY-LOT ANALYSIS SYSTEM**: Comprehensive property evaluation system providing authentic BC legislative compliance analysis. Features include: exact transit distance measurements (200m/400m/800m TOD zones), Bill 44 multiplex eligibility (4-plex vs 6-plex based on 400m frequent transit rule), Bill 47 TOD zone classification with FSR minimums (5.0/4.0/3.0), real MLS comparable integration, construction cost estimates by municipality, and ROI calculations. API endpoint: `/api/lot/analyze` - fully operational with real REALTOR.ca DDF data integration.

**COMPLETE MARKETING ECOSYSTEM**: Comprehensive lead generation and conversion system including:
- Interactive property demo with real-time AI analysis
- Automated lead capture with CRM integration and scoring
- Email automation sequences with personalized property data
- Professional marketing video production framework
- Multi-platform social media strategy (LinkedIn, YouTube, Instagram, Facebook)
- Contractor marketplace with proposal submissions and project timelines
- Premium Partner & Trade Professionals directory for paying customers
- Analytics tracking with conversion optimization

## User Preferences

Preferred communication style: Simple, everyday language.
User prefers email/SMS code verification over username/password system.
User is a licensed realtor with REBGV credentials.
Business model: Sustainable tiered pricing using FREE data sources - Basic ($29/month), Professional ($67/month), Enterprise ($127/month).
Data Strategy: 100% FREE sources (BC Assessment public search, Municipal Open Data APIs, REALTOR.ca DDF free tier). Zero data costs = high profit margins.
Main website should focus on marketing materials and service descriptions only.
All valuable builder tools should be behind premium dashboard for trial/paying customers.
Featured Network Members directory removed from public site - only accessible to premium subscribers.

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
- **Dashboard Interface**: 9-tab interface including: Overview, AI Analysis (OpenAI integration), Zoning (Bill 44/47/TOD compliance), Permits (150+ municipal), Alerts (MLS-style notifications), Financial (ROI/cash flow), Compliance, Lead Gen, Marketplace (contractor signup), and Partners (premium directory).
- **AI Services**: OpenAI GPT-4o integration for property analysis, content generation, design suggestions, and DALL-E image generation.
- **Data Services**: Property data service, zoning intelligence service, lead generation service, permit tracker service, partner finder service, and AI design generator service.
- **API Endpoints**: Over 30 endpoints covering various functionalities.
- **Comprehensive PDF Report Generator**: jsPDF-based reports for zoning analysis, integrating multi-policy analysis (Bill 44, Bill 47, TOD).
- **Property Alerts System**: Real-time MLS integration with customizable filters.
- **Financial Modeling Suite**: Advanced ROI calculators, cash flow projections, and construction cost estimators.
- **Regulatory Compliance Tracker**: Bill 44/47 monitoring and municipal bylaw change notifications.
- **Auto-Fill Property Data**: Dashboard automatically retrieves and populates property details from authentic BC Assessment data via REALTOR.ca DDF API integration, reducing manual entry and ensuring data accuracy.
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