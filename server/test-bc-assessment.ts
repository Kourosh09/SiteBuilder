// BC Assessment API Test Script
// This script tests the BC Assessment API connection

async function testBCAssessmentAPI() {
  const apiKey = process.env.BC_ASSESSMENT_API_KEY;
  
  if (!apiKey) {
    console.log("❌ BC_ASSESSMENT_API_KEY not found in environment variables");
    return;
  }
  
  console.log("✅ BC Assessment API key found");
  console.log("🔍 Testing BC Assessment API connection...");
  
  try {
    // Test 1: Check API endpoint
    const response = await fetch('https://api.bcassessment.ca/v1/properties/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        address: "123 Main Street",
        municipality: "Vancouver",
        assessmentYear: 2024
      })
    });

    console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ BC Assessment API connection successful!");
      console.log("📊 Response data:", JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log("❌ BC Assessment API Error:");
      console.log("Response:", errorText);
      
      // Check if it's an authentication error
      if (response.status === 401) {
        console.log("🔑 Authentication failed - check your API key");
      } else if (response.status === 403) {
        console.log("🚫 Access forbidden - check your API permissions");
      } else if (response.status === 404) {
        console.log("🔍 Endpoint not found - check the API URL");
      }
    }
  } catch (error) {
    console.log("🚨 Network error:", error instanceof Error ? error.message : error);
  }
  
  // Test alternative API endpoints if main one fails
  console.log("\n🔄 Trying alternative BC Assessment endpoints...");
  
  const alternativeEndpoints = [
    'https://bcassessment.ca/api/v1/properties/search',
    'https://www.bcassessment.ca/api/properties/search',
    'https://api.bcassessment.bc.ca/v1/properties/search'
  ];
  
  for (const endpoint of alternativeEndpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: "123 Main Street",
          municipality: "Vancouver"
        })
      });
      
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        console.log(`✅ Alternative endpoint works: ${endpoint}`);
        break;
      }
    } catch (error) {
      console.log(`❌ ${endpoint} failed`);
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testBCAssessmentAPI().catch(console.error);
}

export { testBCAssessmentAPI };