import { PropertySessionData } from "../shared/schema";

/**
 * Property Session Manager
 * Manages property data persistence across all analysis and calculation modules
 */
export class PropertySessionManager {
  private sessions: Map<string, PropertySessionData> = new Map();

  /**
   * Initialize a new property session from lookup data
   */
  createSession(address: string, city: string, propertyData: any): PropertySessionData {
    const sessionId = this.generateSessionId(address, city);
    
    const session: PropertySessionData = {
      id: sessionId,
      address,
      city,
      data: propertyData, // Store complete property data
      bcAssessment: propertyData.bcAssessment,
      mlsComparables: propertyData.mlsComparables,
      marketAnalysis: propertyData.marketAnalysis,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get existing session by ID
   */
  getSession(sessionId: string): PropertySessionData | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Update session with new analysis data
   */
  updateSession(sessionId: string, updates: Partial<PropertySessionData>): PropertySessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Add zoning analysis to session
   */
  addZoningAnalysis(sessionId: string, zoningData: any): PropertySessionData | null {
    return this.updateSession(sessionId, {
      zoningAnalysis: zoningData,
      coordinates: zoningData.coordinates
    });
  }

  /**
   * Add AI analysis to session
   */
  addAIAnalysis(sessionId: string, aiAnalysis: any): PropertySessionData | null {
    return this.updateSession(sessionId, {
      aiAnalysis
    });
  }

  /**
   * Add financial analysis to session
   */
  addFinancialAnalysis(sessionId: string, financialData: any): PropertySessionData | null {
    return this.updateSession(sessionId, {
      financialAnalysis: financialData
    });
  }

  /**
   * Add design suggestions to session
   */
  addDesignSuggestions(sessionId: string, designSuggestions: any[]): PropertySessionData | null {
    return this.updateSession(sessionId, {
      designSuggestions
    });
  }

  /**
   * Get property details for subsequent analyses
   */
  getPropertyForAnalysis(sessionId: string): any | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    return {
      address: session.address,
      city: session.city,
      coordinates: session.coordinates,
      lotSize: session.bcAssessment?.lotSize,
      currentValue: session.bcAssessment?.totalAssessedValue,
      propertyType: session.bcAssessment?.propertyType,
      zoning: session.bcAssessment?.zoning || session.zoningAnalysis?.zoning?.zoningCode,
      marketData: session.marketAnalysis,
      mlsComparables: session.mlsComparables
    };
  }

  /**
   * Generate comprehensive report data
   */
  generateReportData(sessionId: string): any | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    return {
      address: session.address,
      city: session.city,
      coordinates: session.coordinates,
      lotSize: session.bcAssessment?.lotSize,
      frontage: 40, // Default frontage - could be enhanced
      zoning: session.zoningAnalysis?.zoning,
      developmentPotential: session.zoningAnalysis?.developmentPotential,
      marketContext: session.zoningAnalysis?.marketContext,
      bcAssessment: session.bcAssessment,
      mlsData: session.mlsComparables,
      aiAnalysis: session.aiAnalysis,
      financialAnalysis: session.financialAnalysis,
      designSuggestions: session.designSuggestions,
      analysisDate: new Date().toLocaleDateString('en-CA')
    };
  }

  /**
   * Clean up old sessions (older than 24 hours)
   */
  cleanupOldSessions(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt < cutoff) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(address: string, city: string): string {
    const timestamp = Date.now().toString(36);
    const hash = this.simpleHash(`${address}-${city}`).toString(36);
    return `prop_${timestamp}_${hash}`;
  }

  /**
   * Simple hash function for session IDs
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * List all active sessions (for debugging)
   */
  getActiveSessions(): PropertySessionData[] {
    return Array.from(this.sessions.values());
  }
}

// Export singleton instance
export const propertySessionManager = new PropertySessionManager();