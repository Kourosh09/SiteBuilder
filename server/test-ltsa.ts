/**
 * Direct LTSA Enterprise Test Endpoint
 */
import express from 'express';
import { LTSAEnterpriseService } from './ltsa-enterprise-service';

const router = express.Router();
const ltsaService = new LTSAEnterpriseService();

router.post('/test-ltsa', async (req, res) => {
  try {
    const { address, city } = req.body;
    
    console.log(`🧪 Testing LTSA Enterprise integration for ${address}, ${city}`);
    
    // Test configuration
    const isConfigured = ltsaService.isConfigured();
    console.log(`🔧 LTSA Enterprise configured: ${isConfigured}`);
    
    if (!isConfigured) {
      return res.json({
        success: false,
        error: 'LTSA Enterprise credentials not configured',
        configured: false
      });
    }
    
    // Test connection
    const connectionTest = await ltsaService.testConnection();
    console.log(`🔗 LTSA Connection test: ${connectionTest}`);
    
    // Test web automation
    console.log(`🤖 Testing web automation for property search...`);
    const propertyData = await ltsaService.getBCAssessmentData(address, city);
    
    res.json({
      success: true,
      configured: isConfigured,
      connectionTest: connectionTest,
      propertyData: propertyData,
      message: 'LTSA Enterprise test completed'
    });
    
  } catch (error) {
    console.error('LTSA test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      configured: ltsaService.isConfigured()
    });
  }
});

export default router;