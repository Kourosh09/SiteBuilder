# Real Data Integration Guide for BuildwiseAI

## 1. BC Assessment API Integration

### Setup Steps:
1. Register at: https://www.bcassessment.ca/data-services
2. Apply for API access (requires business registration)
3. Get API credentials (usually takes 5-10 business days)

### Implementation:
```typescript
// server/bc-assessment-api.ts
const BC_ASSESSMENT_API_KEY = process.env.BC_ASSESSMENT_API_KEY;
const BC_ASSESSMENT_BASE_URL = 'https://api.bcassessment.ca/v1';

export async function getPropertyData(address: string, city: string) {
  const response = await fetch(`${BC_ASSESSMENT_BASE_URL}/properties/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BC_ASSESSMENT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      address,
      municipality: city
    })
  });
  return response.json();
}
```

## 2. MLS Data Integration

### Setup Steps:
1. Contact Real Estate Board of Greater Vancouver (REBGV)
2. Apply for MLS data feed license (requires real estate industry credentials)
3. Alternative: Partner with licensed real estate professional

### Implementation:
```typescript
// server/mls-integration.ts
export async function getMLSListings(city: string, propertyType: string) {
  // Requires MLS RETS feed or API access
  // Contact local real estate boards for access
}
```

## 3. Municipal Permit Database Integration

### BC Municipalities with Open Data:
- **Vancouver**: https://opendata.vancouver.ca/
- **Burnaby**: https://data.burnaby.ca/
- **Surrey**: https://data.surrey.ca/
- **Richmond**: https://www.richmond.ca/discover/opendata.htm

### Implementation:
```typescript
// server/permit-data.ts
export async function getVancouverPermits() {
  const response = await fetch('https://opendata.vancouver.ca/api/records/1.0/search/?dataset=issued-building-permits');
  return response.json();
}

export async function getBurnabyPermits() {
  const response = await fetch('https://data.burnaby.ca/api/records/1.0/search/?dataset=building-permits');
  return response.json();
}
```

## 4. Partner CRM Database Setup

### Option A: Professional CRM Integration
- **HubSpot**: Free tier available, good API
- **Salesforce**: Enterprise features, complex setup
- **Airtable**: Simple setup, good for startups

### Option B: Custom Database
```sql
-- partners table structure
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  type VARCHAR(50), -- architect, engineer, contractor, developer
  city VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  specialties TEXT[],
  rating DECIMAL(2,1),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. Required Environment Variables
Add these to your Replit secrets:
```
BC_ASSESSMENT_API_KEY=your_api_key_here
MLS_API_KEY=your_mls_key_here
HUBSPOT_API_KEY=your_hubspot_key_here
VANCOUVER_OPEN_DATA_KEY=your_vancouver_key_here
```

## 6. Implementation Priority
1. **Start with**: Vancouver Open Data (free, immediate access)
2. **Next**: BC Assessment API application
3. **Then**: Partner CRM setup
4. **Finally**: MLS integration (requires industry credentials)