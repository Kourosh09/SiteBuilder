# BuildwiseAI Setup Instructions

## 4. Framer Integration (Enhanced Marketing)

### Quick Setup Steps:

1. **Login to Framer**
   - Go to https://framer.com
   - Use your existing workspace or create new project

2. **Create Marketing Site**
   - Click "New Project" → "AI Website Generator"
   - Prompt: "Modern landing page for BuildwiseAI - AI-powered real estate development platform specializing in BC market with Bill 44 compliance, zoning analysis, permit tracking, and lead generation"

3. **Link to Your Dashboard**
   - Replace Framer's CTA buttons with: `https://your-replit-url.replit.app/dashboard`
   - Update "Get Started" buttons to link directly to your functional dashboard

4. **Domain Setup Options**
   - **Option A**: `buildwiseai.ca` (Framer) + `app.buildwiseai.ca` (Replit)
   - **Option B**: `buildwiseai.ca` (Framer) + `buildwiseai.ca/dashboard` (Replit)

5. **Brand Consistency**
   - Use brand colors: #2563eb (blue), #10b981 (green)
   - Match typography and messaging from your current site

---

## 5. Real Data Integration (Production Ready)

### Immediate: Vancouver Open Data (FREE & LIVE)
✅ **Already implemented** - Your platform now connects to real Vancouver permit data!

**Test it now:**
- `/api/permits/vancouver/live` - Real permits from Vancouver
- `/api/permits/vancouver/search?address=123 Main St` - Search by address
- `/api/permits/vancouver/stats` - Live permit statistics

### Next Steps for Full Data Integration:

#### BC Assessment API
1. **Apply for access**: https://www.bcassessment.ca/data-services
2. **Business registration required** (5-10 business days)
3. **Cost**: ~$200-500/month for API access
4. **Benefit**: Real property values, assessments, ownership data

#### MLS Data Feed
1. **Contact REBGV**: Real Estate Board of Greater Vancouver
2. **Requires**: Licensed real estate professional partnership
3. **Cost**: $300-1000/month depending on usage
4. **Benefit**: Active listings, sold data, market trends

#### Municipal Permit APIs
**Free Open Data Sources (immediate access):**
- ✅ Vancouver: Already connected
- Burnaby: https://data.burnaby.ca/
- Surrey: https://data.surrey.ca/
- Richmond: https://www.richmond.ca/discover/opendata.htm

#### Partner CRM Setup
**Recommended**: Start with HubSpot (free tier)
1. Sign up at https://hubspot.com
2. Get API key from Settings → Integrations
3. Import your existing partner contacts
4. Connect to BuildwiseAI dashboard

### Implementation Priority:
1. ✅ **Done**: Vancouver Open Data (live permits)
2. **Week 1**: Add Burnaby, Surrey, Richmond open data
3. **Week 2**: Set up HubSpot CRM integration
4. **Month 1**: Apply for BC Assessment API
5. **Month 2**: Establish MLS partnership

### Required Credentials:
Add these to Replit Secrets when ready:
- `BC_ASSESSMENT_API_KEY`
- `MLS_API_KEY` 
- `HUBSPOT_API_KEY`
- `REBGV_ACCESS_TOKEN`

---

## Current Status:
✅ **Fully functional dashboard** with all modules
✅ **Real Vancouver permit data** connected
✅ **Bill 44 compliance checking** operational
✅ **AI-powered analysis** with OpenAI integration
✅ **Ready for deployment** to your domain

## Next Actions:
1. **Test Vancouver data**: Visit `/dashboard` → Permits tab
2. **Set up Framer**: Enhanced marketing presence
3. **Deploy to production**: Connect `buildwiseai.ca` domain
4. **Add remaining BC data**: Expand to all Lower Mainland cities