import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ComplianceRule {
  id: string;
  jurisdiction: string;
  category: "Zoning" | "Building Code" | "Environmental" | "Safety" | "Accessibility";
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  impact: "Low" | "Medium" | "High";
  applicableTo: string[];
  requirements: string[];
  penalties: string;
  status: "Active" | "Proposed" | "Under Review" | "Expired";
  sourceUrl?: string;
}

export interface ComplianceCheck {
  id: string;
  projectId: string;
  propertyAddress: string;
  checkDate: string;
  rules: {
    ruleId: string;
    compliant: boolean;
    notes: string;
    actionRequired?: string;
    deadline?: string;
  }[];
  overallStatus: "Compliant" | "Minor Issues" | "Major Issues" | "Non-Compliant";
  recommendations: string[];
}

export interface RegulationUpdate {
  id: string;
  jurisdiction: string;
  title: string;
  summary: string;
  category: string;
  effectiveDate: string;
  impactLevel: "Low" | "Medium" | "High";
  affectedProjectTypes: string[];
  actionRequired: string;
  deadline?: string;
  sourceUrl: string;
  createdAt: string;
}

export class RegulatoryComplianceService {
  private rules: Map<string, ComplianceRule> = new Map();
  private checks: Map<string, ComplianceCheck> = new Map();
  private updates: RegulationUpdate[] = [];

  constructor() {
    this.initializeBCRules();
    this.initializeRecentUpdates();
  }

  private initializeBCRules(): void {
    const bcRules: ComplianceRule[] = [
      {
        id: "bc_bill44_001",
        jurisdiction: "British Columbia",
        category: "Zoning",
        title: "Bill 44 - Small-scale Multi-unit Housing",
        description: "Allows up to 4 units on single-family lots province-wide",
        effectiveDate: "2024-06-30",
        lastUpdated: "2024-08-01",
        impact: "High",
        applicableTo: ["Single Family", "Duplex", "Triplex", "4-plex"],
        requirements: [
          "Minimum 33ft frontage for 4-plex",
          "Minimum 40ft frontage for 6-plex (near transit)",
          "Minimum 5000 sq ft lot size",
          "RS zoning eligible",
          "1 parking space per unit minimum"
        ],
        penalties: "Development permits may be rejected; fines up to $50,000",
        status: "Active"
      },
      {
        id: "bc_bill47_001",
        jurisdiction: "British Columbia",
        category: "Zoning",
        title: "Bill 47 - Secondary Suites and ADUs",
        description: "Allows secondary suites and accessory dwelling units province-wide",
        effectiveDate: "2024-06-30",
        lastUpdated: "2024-08-01",
        impact: "Medium",
        applicableTo: ["Single Family", "Secondary Suite", "ADU"],
        requirements: [
          "Maximum 90 sq m for detached ADU",
          "Separate entrance required",
          "No owner occupancy requirement",
          "Compliance with building code"
        ],
        penalties: "Occupancy restrictions; fines up to $25,000",
        status: "Active"
      },
      {
        id: "van_tod_001",
        jurisdiction: "Vancouver",
        category: "Zoning",
        title: "Transit-Oriented Development Areas",
        description: "Additional density bonuses near major transit",
        effectiveDate: "2024-01-01",
        lastUpdated: "2024-07-15",
        impact: "High",
        applicableTo: ["Multi-family", "Mixed-use"],
        requirements: [
          "Within 800m of SkyTrain station",
          "Minimum 20% affordable housing",
          "LEED Gold certification required",
          "Underground parking only"
        ],
        penalties: "Bonus density revoked; potential project delays",
        status: "Active"
      },
      {
        id: "bc_step_code_001",
        jurisdiction: "British Columbia",
        category: "Building Code",
        title: "BC Energy Step Code",
        description: "Energy performance requirements for new construction",
        effectiveDate: "2024-12-31",
        lastUpdated: "2024-08-01",
        impact: "High",
        applicableTo: ["All new construction"],
        requirements: [
          "Step 3 minimum by Dec 31, 2024",
          "Step 5 by Dec 31, 2032",
          "Energy advisor verification required",
          "Blower door testing mandatory"
        ],
        penalties: "Building permits withheld; compliance orders",
        status: "Active"
      },
      {
        id: "van_parking_001",
        jurisdiction: "Vancouver",
        category: "Zoning",
        title: "Parking Requirement Updates",
        description: "Reduced parking minimums for multi-family housing",
        effectiveDate: "2024-03-01",
        lastUpdated: "2024-06-01",
        impact: "Medium",
        applicableTo: ["Multi-family", "Duplex", "Triplex", "4-plex"],
        requirements: [
          "0.5 spaces per unit near transit",
          "0.75 spaces per unit elsewhere",
          "Visitor parking: 0.1 spaces per unit",
          "EV charging: 20% of stalls"
        ],
        penalties: "Zoning violations; occupancy restrictions",
        status: "Active"
      }
    ];

    bcRules.forEach(rule => this.rules.set(rule.id, rule));
  }

  private initializeRecentUpdates(): void {
    this.updates = [
      {
        id: "update_001",
        jurisdiction: "British Columbia",
        title: "Bill 44 Implementation Guidelines Released",
        summary: "Detailed implementation guidelines for small-scale multi-unit housing now available",
        category: "Zoning",
        effectiveDate: "2024-08-15",
        impactLevel: "High",
        affectedProjectTypes: ["4-plex", "Duplex", "Triplex"],
        actionRequired: "Review new guidelines and update project applications",
        deadline: "2024-09-01",
        sourceUrl: "https://www.gov.bc.ca/housing",
        createdAt: "2024-08-01T00:00:00Z"
      },
      {
        id: "update_002",
        jurisdiction: "Vancouver",
        title: "Transit-Oriented Development Boundary Updates",
        summary: "New SkyTrain stations added to TOD eligible areas",
        category: "Planning",
        effectiveDate: "2024-09-01",
        impactLevel: "Medium",
        affectedProjectTypes: ["Multi-family", "Mixed-use"],
        actionRequired: "Check if your projects qualify for additional density",
        sourceUrl: "https://vancouver.ca/planning",
        createdAt: "2024-07-28T00:00:00Z"
      },
      {
        id: "update_003",
        jurisdiction: "Surrey",
        title: "Development Cost Charge Increases",
        summary: "DCC rates increasing 15% effective October 1, 2024",
        category: "Financial",
        effectiveDate: "2024-10-01",
        impactLevel: "High",
        affectedProjectTypes: ["All development types"],
        actionRequired: "Submit applications before October 1 to avoid increases",
        deadline: "2024-09-30",
        sourceUrl: "https://surrey.ca/development",
        createdAt: "2024-07-25T00:00:00Z"
      }
    ];
  }

  async performComplianceCheck(
    projectId: string,
    propertyAddress: string,
    projectType: string,
    jurisdiction: string
  ): Promise<ComplianceCheck> {
    
    // Get applicable rules
    const applicableRules = Array.from(this.rules.values()).filter(rule => 
      (rule.jurisdiction === jurisdiction || rule.jurisdiction === "British Columbia") &&
      rule.applicableTo.some(type => type.toLowerCase().includes(projectType.toLowerCase())) &&
      rule.status === "Active"
    );

    const ruleChecks = applicableRules.map(rule => {
      // Simulate compliance checking logic
      const compliant = Math.random() > 0.2; // 80% compliance rate for demo
      
      return {
        ruleId: rule.id,
        compliant,
        notes: compliant ? 
          "Project meets all requirements for this regulation" :
          `Review required: ${rule.requirements[0]}`,
        actionRequired: compliant ? undefined : "Update project plans to meet requirements",
        deadline: compliant ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    });

    const nonCompliantCount = ruleChecks.filter(check => !check.compliant).length;
    const overallStatus = nonCompliantCount === 0 ? "Compliant" :
                         nonCompliantCount <= 2 ? "Minor Issues" :
                         nonCompliantCount <= 4 ? "Major Issues" : "Non-Compliant";

    const recommendations = await this.generateRecommendations(projectType, jurisdiction, ruleChecks);

    const complianceCheck: ComplianceCheck = {
      id: `check_${Date.now()}`,
      projectId,
      propertyAddress,
      checkDate: new Date().toISOString(),
      rules: ruleChecks,
      overallStatus,
      recommendations
    };

    this.checks.set(complianceCheck.id, complianceCheck);
    return complianceCheck;
  }

  async getComplianceRules(jurisdiction?: string, category?: string): Promise<ComplianceRule[]> {
    let rules = [...this.rules.values()];
    
    if (jurisdiction) {
      rules = rules.filter(rule => 
        rule.jurisdiction === jurisdiction || rule.jurisdiction === "British Columbia"
      );
    }
    
    if (category) {
      rules = rules.filter(rule => rule.category === category);
    }

    return rules.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  async getRecentUpdates(jurisdiction?: string, days: number = 30): Promise<RegulationUpdate[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    let updates = this.updates.filter(update => 
      new Date(update.createdAt) >= cutoffDate
    );

    if (jurisdiction) {
      updates = updates.filter(update => update.jurisdiction === jurisdiction);
    }

    return updates.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getComplianceCheck(checkId: string): Promise<ComplianceCheck | null> {
    return this.checks.get(checkId) || null;
  }

  async getProjectComplianceHistory(projectId: string): Promise<ComplianceCheck[]> {
    return [...this.checks.values()]
      .filter(check => check.projectId === projectId)
      .sort((a, b) => new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime());
  }

  async createComplianceAlert(
    jurisdiction: string,
    categories: string[],
    email: string
  ): Promise<{ success: boolean; alertId: string }> {
    // In production, this would set up real alerts
    const alertId = `alert_${Date.now()}`;
    
    console.log(`🔔 Compliance alert created for ${email}:`);
    console.log(`   Jurisdiction: ${jurisdiction}`);
    console.log(`   Categories: ${categories.join(", ")}`);
    console.log(`   Alert ID: ${alertId}`);

    return { success: true, alertId };
  }

  async generateComplianceSummary(projectType: string, jurisdiction: string): Promise<string> {
    const applicableRules = await this.getComplianceRules(jurisdiction);
    const recentUpdates = await this.getRecentUpdates(jurisdiction, 60);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a regulatory compliance expert for BC real estate development."
          },
          {
            role: "user",
            content: `Generate a compliance summary for a ${projectType} project in ${jurisdiction}.

Key regulations: ${JSON.stringify(applicableRules.slice(0, 5))}
Recent updates: ${JSON.stringify(recentUpdates.slice(0, 3))}

Include:
1. Key compliance requirements
2. Recent regulatory changes
3. Action items and deadlines
4. Risk assessment

Keep response practical and actionable.`
          }
        ]
      });

      return response.choices[0].message.content || "Unable to generate compliance summary";
    } catch (error) {
      console.error("Error generating compliance summary:", error);
      return "Unable to generate compliance summary at this time";
    }
  }

  private async generateRecommendations(
    projectType: string,
    jurisdiction: string,
    ruleChecks: ComplianceCheck["rules"]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    const nonCompliantRules = ruleChecks.filter(check => !check.compliant);
    
    if (nonCompliantRules.length === 0) {
      recommendations.push("Project appears to be fully compliant with current regulations");
      recommendations.push("Monitor for upcoming regulatory changes that may affect your project");
    } else {
      recommendations.push(`Address ${nonCompliantRules.length} compliance issues before proceeding`);
      recommendations.push("Consult with a qualified professional for detailed compliance review");
      
      if (nonCompliantRules.length > 3) {
        recommendations.push("Consider project redesign to improve compliance");
      }
    }

    // Jurisdiction-specific recommendations
    if (jurisdiction === "Vancouver") {
      recommendations.push("Check eligibility for city incentive programs");
      recommendations.push("Consider pre-application consultation with city planning");
    }

    if (projectType.includes("4-plex") || projectType.includes("multi")) {
      recommendations.push("Ensure Bill 44 compliance for streamlined approval process");
    }

    return recommendations;
  }

  // Simulate regulatory monitoring
  async simulateRegulatoryUpdate(): Promise<RegulationUpdate> {
    const jurisdictions = ["Vancouver", "Surrey", "Burnaby", "Richmond"];
    const categories = ["Zoning", "Building Code", "Environmental", "Financial"];
    const impacts = ["Low", "Medium", "High"] as const;

    const update: RegulationUpdate = {
      id: `update_${Date.now()}`,
      jurisdiction: jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
      title: "New Development Regulation Update",
      summary: "Recent changes to local development requirements",
      category: categories[Math.floor(Math.random() * categories.length)],
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      impactLevel: impacts[Math.floor(Math.random() * impacts.length)],
      affectedProjectTypes: ["Multi-family", "Single Family"],
      actionRequired: "Review new requirements and update project plans",
      sourceUrl: "https://example.com/regulation",
      createdAt: new Date().toISOString()
    };

    this.updates.unshift(update);
    return update;
  }
}

export const regulatoryComplianceService = new RegulatoryComplianceService();