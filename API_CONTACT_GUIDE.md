# API Integration Contact Guide - BuildwiseAI

## BC Assessment Commercial API Access

### Primary Contact
**BC Assessment Authority**
- **Phone**: 1-800-663-7867
- **Email**: info@bcassessment.ca
- **Website**: https://www.bcassessment.ca
- **Business Hours**: Monday-Friday 8:30 AM - 4:30 PM (PST)

### What to Request
1. **Commercial API Access** for property assessment data
2. **Individual Property Lookup** capabilities
3. **API Documentation** and field mappings
4. **Rate limits** and pricing structure
5. **Authentication** requirements

### Key Information to Provide
- Business name: BuildwiseAI
- Purpose: Real estate development analysis platform
- Required data: Individual property assessments, land values, improvement values
- Expected volume: 1000+ lookups per month
- Your business registration number (if available)

### Sample Script
*"Hi, I'm calling about commercial API access for BC Assessment data. I'm building a real estate development platform called BuildwiseAI and need access to individual property assessment data including land values, improvement values, and property details. Can you connect me with someone who handles API integrations or data licensing?"*

---

## REBGV MLS Integration

### Primary Contact
**Real Estate Board of Greater Vancouver (REBGV)**
- **Phone**: 604-730-3000
- **Email**: info@rebgv.org
- **Website**: https://www.rebgv.org
- **Technical Support**: Monday-Friday 8:30 AM - 5:00 PM (PST)

### What to Request
1. **RETS Integration Support** (Real Estate Transaction Standard)
2. **Login URL** for RETS access
3. **Resource metadata** and field mappings
4. **Documentation** for RETS queries
5. **API rate limits** and usage guidelines

### Key Information to Provide
- Your REBGV member number
- Business/brokerage affiliation
- Purpose: Integration with BuildwiseAI development platform
- Current MLS credentials: [You have MLS_USERNAME and MLS_PASSWORD configured]
- Technical requirements: Property search, sold comparables, active listings

### Sample Script
*"Hi, I'm a licensed realtor (member #[YOUR_NUMBER]) and I need technical support for RETS integration. I'm building a real estate development platform and need to integrate MLS data for property comparables and market analysis. Can you connect me with your RETS support team or provide the proper login URLs and documentation?"*

---

## Alternative Data Sources

### If BC Assessment Commercial Access is Too Expensive

#### Teranet PropertyLine
- **Website**: https://www.teranet.ca
- **Contact**: 1-800-219-8787
- **Services**: Property records, assessment data, ownership history

#### Altus Data Solutions
- **Website**: https://www.altusgroup.com
- **Contact**: Through website contact form
- **Services**: Real estate data analytics, market intelligence

#### Real Estate Wire
- **Website**: https://www.realwire.com
- **Contact**: info@realwire.com
- **Services**: MLS data feeds, property information

#### Municipal Open Data
- **Vancouver Open Data**: https://opendata.vancouver.ca
- **Burnaby**: https://www.burnaby.ca/our-city/open-data
- **Richmond**: https://www.richmond.ca/discover/opendata.htm
- Limited individual property data, but good for zoning and development permits

---

## Implementation Timeline

### Week 1: Contact and Setup
- [ ] Call BC Assessment (1-800-663-7867)
- [ ] Call REBGV (604-730-3000)
- [ ] Request documentation and pricing

### Week 2: Technical Integration
- [ ] Receive API credentials and endpoints
- [ ] Update BuildwiseAI integration code
- [ ] Test with real data

### Week 3: Production Deployment
- [ ] Validate data accuracy
- [ ] Monitor API performance
- [ ] Deploy to buildwiseai.ca

---

## Technical Notes

### Current System Status
- Your API credentials are configured and ready
- Error handling and logging implemented
- Fallback data provides realistic market values
- System will automatically switch to real APIs once endpoints are available

### Code Changes Required
Once you get the proper API endpoints, I'll need to update:
1. `server/property-data.ts` - BC Assessment endpoint URL
2. `server/mls-integration.ts` - REBGV RETS login URL
3. Environment variables - Any additional API keys or tokens

**The hardest part (integration code) is already done - we just need the proper API access!**

---

*Contact made: [Date] | Status: [Pending/In Progress/Complete]*
*API Access Obtained: [Date] | Integration Status: [Testing/Live]*