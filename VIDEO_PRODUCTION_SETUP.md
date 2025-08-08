# BuildwiseAI Video Production Setup Guide
## Complete Technical Implementation for Marketing Video

### 🎬 Pre-Production Checklist

#### Technical Requirements
- **Screen Recording Software**: OBS Studio (free) or Camtasia (paid)
- **Video Resolution**: 1920x1080 (1080p minimum)
- **Frame Rate**: 30fps or 60fps
- **Audio**: Professional USB microphone or headset
- **Browser**: Chrome/Firefox with developer tools disabled for clean recording

#### Demo Environment Setup
```bash
# Ensure clean demo data
npm run dev
# System should be running on localhost:5000

# Test demo endpoints before recording
curl -X POST http://localhost:5000/api/marketing/demo \
  -H "Content-Type: application/json" \
  -d '{"address": "123 Demo Street", "city": "Vancouver"}'
```

---

### 🎯 Scene-by-Scene Recording Guide

#### Scene 1: Hook & Problem (10 seconds)
**Recording Steps:**
1. Start with split-screen showing:
   - Left: Cluttered desk with papers/calculator
   - Right: Clean BuildwiseAI interface
2. **Voiceover Start**: *"Traditional real estate development takes months..."*
3. Smooth transition to BuildwiseAI homepage

#### Scene 2: Property Entry (10 seconds)
**Screen Actions:**
1. Navigate to BuildwiseAI homepage
2. Scroll to Interactive Property Demo section
3. Type in property address: "555 Marketing Demo Street"
4. Select city: "Vancouver"
5. Click "Analyze Property with AI" button
6. **Voiceover**: *"Simply enter any BC property address..."*

#### Scene 3: Data Integration (15 seconds)
**Screen Recording:**
1. Show loading animation with data source icons
2. Display results showing:
   - BC Assessment: Property value $1,678,852
   - MLS: 6 comparable properties
   - Vancouver zoning: RS-1 requirements
   - Building codes: Energy Step Code Level 3
3. **Voiceover**: *"Watch as AI instantly gathers data from multiple sources..."*

#### Scene 4: Development Scenarios (15 seconds)
**Demo Results Display:**
```
Record the actual API response showing:
- Single Family + Suite: 25% ROI
- Duplex Development: 30% ROI
- Fourplex (Bill 44): 35% ROI ⭐ RECOMMENDED
- Apartment Building: 42% ROI

Highlight the recommended scenario with:
- 4 units, $1,088,000 construction cost
- $370,200 net profit
- 10-month timeline
```
4. **Voiceover**: *"AI generates multiple scenarios with complete financial analysis..."*

#### Scene 5: Construction Design (15 seconds)
**Screen Capture:**
1. Show AI-generated architectural description
2. Display construction specifications:
   - Modern West Coast Contemporary
   - Fiber cement siding
   - Energy code compliant
   - Accessibility features
3. **Voiceover**: *"AI creates city-compliant construction designs..."*

#### Scene 6: Contractor Timeline (10 seconds)
**Contractor Proposals:**
```
Show live contractor proposal data:
1. Vancouver Construction Co. - $1,050,000, 9 months
2. Pacific Builders Ltd. - $1,120,000, 8 months  
3. Modern Homes Inc. - $995,000, 10 months
```
4. **Voiceover**: *"Licensed contractors submit proposals with timelines..."*

#### Scene 7: Final CTA (5 seconds)
**Results Summary Screen:**
```
Display final project summary:
✅ Property analyzed with all data sources
✅ Optimal development scenario identified
✅ City-compliant design generated  
✅ Licensed contractor proposals received
✅ Complete timeline and budget confirmed

TOTAL ESTIMATED PROFIT: $370,200
PROJECTED ROI: 35%
TIME TO COMPLETION: 10 months

[GET STARTED FREE] button prominent
```
5. **Voiceover**: *"From address to reality-ready plan in under 5 minutes. Start today."*

---

### 🎙️ Professional Voiceover Script

#### Complete 75-Second Narration
*"Traditional real estate development takes months of research and guesswork. What if AI could analyze everything in minutes?*

*Simply enter any BC property address and watch as AI instantly gathers BC Assessment data, MLS comparables, municipal zoning codes, and building requirements from four BC cities.*

*AI generates multiple development scenarios with complete financial analysis. See single family, duplex, and multiplex options with precise ROI calculations.*

*AI creates city-compliant construction designs with contractor timelines. Modern designs that meet all municipal requirements and building codes.*

*Licensed contractors submit proposals with detailed timelines and costs. Compare options and select the best fit for your project.*

*From property address to reality-ready development plan in under five minutes. Transform your development process today. Start your free analysis now."*

---

### 📊 Post-Production Requirements

#### Video Editing Checklist
- **Intro/Outro**: 3-second branded intro/outro
- **Text Overlays**: Key metrics and CTAs
- **Background Music**: Subtle, professional (royalty-free)
- **Color Grading**: Consistent brand colors (#0079F2)
- **Transitions**: Smooth cuts between scenes
- **Export Settings**: 1080p MP4, H.264 codec

#### Key Metrics to Highlight
```
Animation Text Overlays:
- "4 BC Cities Integrated" 
- "Multiple Data Sources"
- "35% ROI Calculated"
- "$370K Profit Estimated"
- "Licensed Contractors Ready"
- "City-Compliant Designs"
```

---

### 📱 Multi-Platform Distribution

#### Platform-Specific Versions
1. **YouTube (75 seconds)**: Full version with detailed workflow
2. **Instagram Reels (30 seconds)**: Condensed highlights version
3. **LinkedIn (60 seconds)**: Professional focus version
4. **TikTok (15 seconds)**: Ultra-short attention grabber

#### Landing Page Integration
- **Hero Section**: Video embedded above property demo
- **Autoplay**: Muted autoplay with click-to-unmute
- **Mobile Responsive**: Optimized for all devices
- **CTA Overlay**: "Try This Live Demo Below" arrow pointing down

---

### 🔧 Technical Testing Protocol

#### Pre-Recording Tests
```bash
# Test all demo endpoints
curl -X POST localhost:5000/api/marketing/demo -d '{"address":"Demo St","city":"Vancouver"}'

# Verify lead capture
curl -X POST localhost:5000/api/leads/capture -d '{"name":"Test","email":"test@test.com","developmentType":"duplex"}'

# Check contractor proposals
curl -X GET localhost:5000/api/leads/lead_123/timeline
```

#### Recording Day Checklist
- [ ] Demo data populated and tested
- [ ] All API endpoints responding correctly
- [ ] Browser cache cleared for clean UI
- [ ] Microphone levels tested and optimized
- [ ] Screen recording software configured
- [ ] Backup recording method ready
- [ ] Script rehearsed and timed

---

### 🎯 Success Metrics & Tracking

#### Video Performance KPIs
- **View Duration**: Target 65%+ completion rate
- **Click-Through Rate**: Target 5%+ to landing page
- **Lead Conversion**: Target 2%+ video viewers to leads
- **Cost Per Lead**: Target <$50 per qualified lead

#### A/B Testing Variations
1. **Version A**: Focus on speed and automation
2. **Version B**: Emphasize ROI and profit potential
3. **Version C**: Highlight contractor marketplace

This production guide ensures your marketing video effectively demonstrates BuildwiseAI's complete value proposition while maintaining professional quality and maximizing lead generation potential.