# REALTOR.ca DDF Web API v1.0 - Official Specifications

## BuildwiseAI Integration Status: ✅ ACTIVE

**Date**: August 8, 2025  
**Status**: Enhanced with official DDF Web API v1.0 specifications  
**API Documentation**: https://ddfapi-docs.realtor.ca/  
**Integration**: Full OData-compliant property data access implemented  

## Authentication (OAuth 2.0)

BuildwiseAI uses the official OAuth 2.0 client credentials flow:

```
POST https://identity.crea.ca/connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id={DDF_USERNAME}
client_secret={DDF_PASSWORD}
scope=DDFApi_Read
```

**Response**:
```json
{
    "access_token": "{token}",
    "expires_in": 3600,
    "token_type": "Bearer",
    "scope": "DDFApi_Read"
}
```

## API Endpoints

Base URL: `https://ddfapi.realtor.ca/odata/v1`

### Property Endpoints
- **Get Properties**: `GET /Property`
- **Get Single Property**: `GET /Property('{PropertyKey}')`
- **Property Replication**: `GET /Property/PropertyReplication`

### Member Endpoints
- **Get Members**: `GET /Member`
- **Get Single Member**: `GET /Member('{MemberKey}')`

### Office Endpoints
- **Get Offices**: `GET /Office`
- **Get Single Office**: `GET /Office('{OfficeKey}')`

### Open House Endpoints
- **Get Open Houses**: `GET /OpenHouse`
- **Get Single Open House**: `GET /OpenHouse('{OpenHouseKey}')`

## OData Query Capabilities

BuildwiseAI leverages OData for flexible querying:

### Filtering Examples
```
/Property?$filter=City eq 'Vancouver'
/Property?$filter=ListPrice ge 500000 and ListPrice le 1000000
/Property?$filter=StandardStatus eq 'Active'
/Property?$filter=PropertyType eq 'Residential'
```

### Selection and Pagination
```
/Property?$select=ListingId,ListPrice,City,PropertyType
/Property?$top=50
/Property?$skip=100
```

### Complex Queries
```
/Property?$filter=City eq 'Vancouver' and ListPrice ge 500000&$top=25&$select=ListingId,ListPrice,BedroomsTotal,BathroomsTotal
```

## Property Data Fields

BuildwiseAI maps the following DDF fields:

### Core Property Information
- **ListingId/ListingKey**: MLS Number
- **UnparsedAddress/StreetNumber/StreetName**: Property Address
- **City**: Property City
- **StateOrProvince**: Province (BC)
- **PostalCode**: Postal Code
- **ListPrice**: Current List Price
- **StandardStatus**: Property Status (Active, Closed, Pending, etc.)

### Property Details
- **PropertyType/PropertySubType**: Property Classification
- **BedroomsTotal**: Number of Bedrooms
- **BathroomsTotal**: Number of Bathrooms
- **LivingArea/BuildingAreaTotal**: Square Footage
- **LotSizeSquareFeet**: Lot Size
- **YearBuilt**: Year of Construction
- **DaysOnMarket**: Marketing Duration

### Listing Information
- **ListingContractDate/OnMarketDate**: List Date
- **CloseDate**: Sold Date
- **PublicRemarks**: Property Description
- **VirtualTourURLUnbranded**: Virtual Tour Link

### Agent and Office
- **ListAgentFirstName/ListAgentLastName**: Listing Agent
- **ListOfficeName**: Listing Brokerage
- **ListAgentDirectPhone/ListOfficePhone**: Contact Phone
- **ListAgentEmail**: Agent Email

### Geographic Data
- **Latitude/Longitude**: Property Coordinates

### Media
- **Media**: Array of photos and virtual tours
- **MediaCategory**: Photo/VirtualTour classification
- **MediaURL**: Direct media links

## BuildwiseAI Implementation

The enhanced MLS integration includes:

### 1. Automatic Token Management
- OAuth 2.0 authentication with token refresh
- 60-minute token lifecycle with 5-minute buffer
- Automatic re-authentication on token expiry

### 2. Property Search Methods
- `getPropertyListings()` - Filtered property searches
- `getPropertyDetails()` - Single property lookup
- `getComparables()` - Market analysis data

### 3. OData Query Builder
- Dynamic filter construction
- Proper URL encoding for special characters
- Pagination support for large datasets

### 4. Error Handling
- Graceful fallback to market intelligence data
- Comprehensive logging for debugging
- User-friendly error messages

### 5. Data Transformation
- DDF field mapping to BuildwiseAI schema
- Status normalization (Active/Sold/Expired/Pending)
- Feature extraction from property details
- Media URL processing and organization

## Usage Examples

### Search Vancouver Properties
```typescript
const listings = await ddfService.getPropertyListings({
  city: 'Vancouver',
  minPrice: 500000,
  maxPrice: 1500000,
  propertyType: 'Residential',
  status: 'Active',
  limit: 25
});
```

### Get Property Details
```typescript
const property = await ddfService.getPropertyDetails('12345678');
```

### Market Analysis
```typescript
const comparables = await ddfService.getComparables(
  '123 Main Street',
  'Vancouver',
  1 // 1km radius
);
```

## Compliance and Best Practices

### REALTOR.ca Requirements
- ✅ Licensed realtor credentials required
- ✅ Proper attribution of REALTOR.ca branding
- ✅ Data usage within approved boundaries
- ✅ Regular credential validation

### Technical Standards
- ✅ RESO Data Dictionary compliance
- ✅ OData v4 specification adherence
- ✅ OAuth 2.0 security standards
- ✅ Rate limiting respect

### Data Quality Assurance
- ✅ Real-time MLS data synchronization
- ✅ Accurate property information display
- ✅ Proper media handling and attribution
- ✅ Market analysis accuracy

## Integration Benefits

1. **Authentic Data**: Real Canadian MLS listings
2. **Real-time Updates**: Live market information
3. **Comprehensive Coverage**: All participating boards
4. **Professional Standards**: REALTOR.ca certified
5. **Development Intelligence**: Market analysis capabilities

---

**Contact Information**:
- CREA Support: support@crea.ca
- DDF Documentation: https://ddfapi-docs.realtor.ca/
- BuildwiseAI Integration: Fully operational since August 2025