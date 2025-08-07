import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ProjectFinancials {
  id: string;
  projectName: string;
  propertyDetails: {
    address: string;
    purchasePrice: number;
    lotSize: number;
    developmentType: string;
    units: number;
  };
  costs: {
    landCost: number;
    hardCosts: number;
    softCosts: number;
    financing: number;
    contingency: number;
    total: number;
  };
  revenue: {
    salePrice: number;
    totalRevenue: number;
    netRevenue: number;
  };
  timeline: {
    acquisitionMonths: number;
    developmentMonths: number;
    salesMonths: number;
    totalMonths: number;
  };
  returns: {
    grossProfit: number;
    netProfit: number;
    roi: number;
    irr: number;
    profitMargin: number;
  };
  cashFlow: CashFlowPeriod[];
  risks: RiskFactor[];
  createdAt: string;
}

export interface CashFlowPeriod {
  month: number;
  period: string;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  description: string;
}

export interface RiskFactor {
  category: string;
  description: string;
  impact: "Low" | "Medium" | "High";
  probability: "Low" | "Medium" | "High";
  mitigation: string;
}

export interface MarketData {
  averageConstructionCostPerSqFt: number;
  averageSalePricePerSqFt: number;
  currentInterestRates: {
    construction: number;
    permanent: number;
  };
  marketTrends: {
    demandLevel: "Low" | "Medium" | "High";
    priceGrowth: number;
    inventoryLevels: "Low" | "Medium" | "High";
  };
  lastUpdated: string;
}

export class FinancialModelingService {
  private projects: Map<string, ProjectFinancials> = new Map();
  
  // Current BC market data (would be updated from real sources)
  private currentMarketData: MarketData = {
    averageConstructionCostPerSqFt: 475,
    averageSalePricePerSqFt: 850,
    currentInterestRates: {
      construction: 7.25,
      permanent: 6.75
    },
    marketTrends: {
      demandLevel: "High",
      priceGrowth: 8.5,
      inventoryLevels: "Low"
    },
    lastUpdated: new Date().toISOString()
  };

  async createFinancialModel(projectData: {
    projectName: string;
    address: string;
    purchasePrice: number;
    lotSize: number;
    developmentType: string;
    units: number;
    targetSqFtPerUnit?: number;
  }): Promise<ProjectFinancials> {
    
    const avgSqFtPerUnit = projectData.targetSqFtPerUnit || this.getDefaultSqFt(projectData.developmentType);
    const totalSqFt = projectData.units * avgSqFtPerUnit;

    // Calculate costs
    const landCost = projectData.purchasePrice;
    const hardCosts = totalSqFt * this.currentMarketData.averageConstructionCostPerSqFt;
    const softCosts = hardCosts * 0.25; // 25% of hard costs
    const financing = (landCost + hardCosts) * 0.08; // 8% financing costs
    const contingency = (hardCosts + softCosts) * 0.1; // 10% contingency
    const totalCosts = landCost + hardCosts + softCosts + financing + contingency;

    // Calculate revenue
    const averageUnitPrice = (totalSqFt / projectData.units) * this.currentMarketData.averageSalePricePerSqFt;
    const totalRevenue = averageUnitPrice * projectData.units;
    const netRevenue = totalRevenue * 0.95; // Account for sales costs

    // Calculate returns
    const grossProfit = totalRevenue - totalCosts;
    const netProfit = netRevenue - totalCosts;
    const roi = (netProfit / totalCosts) * 100;
    const profitMargin = (netProfit / netRevenue) * 100;

    // Calculate timeline
    const timeline = this.calculateTimeline(projectData.developmentType, projectData.units);
    const irr = this.calculateIRR(totalCosts, netRevenue, timeline.totalMonths);

    // Generate cash flow
    const cashFlow = this.generateCashFlow(landCost, hardCosts, softCosts, financing, netRevenue, timeline);

    // Identify risks
    const risks = await this.identifyRisks(projectData, {
      roi,
      timeline: timeline.totalMonths,
      marketConditions: this.currentMarketData.marketTrends
    });

    const projectFinancials: ProjectFinancials = {
      id: `proj_${Date.now()}`,
      projectName: projectData.projectName,
      propertyDetails: {
        address: projectData.address,
        purchasePrice: projectData.purchasePrice,
        lotSize: projectData.lotSize,
        developmentType: projectData.developmentType,
        units: projectData.units
      },
      costs: {
        landCost,
        hardCosts,
        softCosts,
        financing,
        contingency,
        total: totalCosts
      },
      revenue: {
        salePrice: averageUnitPrice,
        totalRevenue,
        netRevenue
      },
      timeline,
      returns: {
        grossProfit,
        netProfit,
        roi,
        irr,
        profitMargin
      },
      cashFlow,
      risks,
      createdAt: new Date().toISOString()
    };

    this.projects.set(projectFinancials.id, projectFinancials);
    return projectFinancials;
  }

  async getProject(projectId: string): Promise<ProjectFinancials | null> {
    return this.projects.get(projectId) || null;
  }

  async getAllProjects(): Promise<ProjectFinancials[]> {
    return [...this.projects.values()];
  }

  async updateProject(projectId: string, updates: Partial<ProjectFinancials>): Promise<ProjectFinancials | null> {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const updatedProject = { ...project, ...updates };
    this.projects.set(projectId, updatedProject);
    return updatedProject;
  }

  async generateSensitivityAnalysis(projectId: string): Promise<{
    priceScenarios: any[];
    costScenarios: any[];
    marketScenarios: any[];
  }> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error("Project not found");

    // Price sensitivity (±20%)
    const priceScenarios = [-20, -10, 0, 10, 20].map(change => {
      const newPrice = project.revenue.salePrice * (1 + change / 100);
      const newRevenue = newPrice * project.propertyDetails.units * 0.95;
      const newProfit = newRevenue - project.costs.total;
      const newROI = (newProfit / project.costs.total) * 100;

      return {
        scenario: `${change > 0 ? '+' : ''}${change}%`,
        salePrice: newPrice,
        totalRevenue: newRevenue,
        netProfit: newProfit,
        roi: newROI
      };
    });

    // Cost sensitivity (±15%)
    const costScenarios = [-15, -10, 0, 10, 15].map(change => {
      const newCosts = project.costs.total * (1 + change / 100);
      const newProfit = project.revenue.netRevenue - newCosts;
      const newROI = (newProfit / newCosts) * 100;

      return {
        scenario: `${change > 0 ? '+' : ''}${change}%`,
        totalCosts: newCosts,
        netProfit: newProfit,
        roi: newROI
      };
    });

    // Market scenarios
    const marketScenarios = [
      { name: "Bear Market", priceChange: -15, costChange: 5, timeChange: 3 },
      { name: "Current Market", priceChange: 0, costChange: 0, timeChange: 0 },
      { name: "Bull Market", priceChange: 20, costChange: 10, timeChange: -2 }
    ].map(scenario => {
      const newPrice = project.revenue.salePrice * (1 + scenario.priceChange / 100);
      const newCosts = project.costs.total * (1 + scenario.costChange / 100);
      const newRevenue = newPrice * project.propertyDetails.units * 0.95;
      const newProfit = newRevenue - newCosts;
      const newROI = (newProfit / newCosts) * 100;

      return {
        name: scenario.name,
        salePrice: newPrice,
        totalCosts: newCosts,
        netProfit: newProfit,
        roi: newROI,
        timelineMonths: project.timeline.totalMonths + scenario.timeChange
      };
    });

    return {
      priceScenarios,
      costScenarios,
      marketScenarios
    };
  }

  private getDefaultSqFt(developmentType: string): number {
    const defaults: Record<string, number> = {
      "Single Family": 2500,
      "Duplex": 1800,
      "Triplex": 1400,
      "4-plex": 1200,
      "6-plex": 1000,
      "Townhouse": 1600,
      "Condo": 900
    };
    return defaults[developmentType] || 1200;
  }

  private calculateTimeline(developmentType: string, units: number): ProjectFinancials["timeline"] {
    const baseMonths = {
      acquisitionMonths: 2,
      developmentMonths: 12 + Math.floor(units / 4), // Additional month per 4 units
      salesMonths: Math.min(6 + Math.floor(units / 2), 18) // Cap at 18 months
    };

    const totalMonths = baseMonths.acquisitionMonths + baseMonths.developmentMonths + baseMonths.salesMonths;

    return {
      ...baseMonths,
      totalMonths
    };
  }

  private calculateIRR(totalCosts: number, netRevenue: number, timelineMonths: number): number {
    // Simplified IRR calculation
    const monthlyReturn = Math.pow(netRevenue / totalCosts, 1 / timelineMonths) - 1;
    return (Math.pow(1 + monthlyReturn, 12) - 1) * 100;
  }

  private generateCashFlow(
    landCost: number,
    hardCosts: number,
    softCosts: number,
    financing: number,
    netRevenue: number,
    timeline: ProjectFinancials["timeline"]
  ): CashFlowPeriod[] {
    const periods: CashFlowPeriod[] = [];
    let cumulativeCashFlow = 0;

    // Acquisition phase
    for (let month = 1; month <= timeline.acquisitionMonths; month++) {
      const cashOut = month === 1 ? landCost : financing * 0.1;
      const netCashFlow = -cashOut;
      cumulativeCashFlow += netCashFlow;

      periods.push({
        month,
        period: "Acquisition",
        cashIn: 0,
        cashOut,
        netCashFlow,
        cumulativeCashFlow,
        description: month === 1 ? "Land purchase" : "Acquisition costs"
      });
    }

    // Development phase
    const monthlyHardCosts = hardCosts / timeline.developmentMonths;
    const monthlySoftCosts = softCosts / timeline.developmentMonths;

    for (let month = timeline.acquisitionMonths + 1; month <= timeline.acquisitionMonths + timeline.developmentMonths; month++) {
      const cashOut = monthlyHardCosts + monthlySoftCosts;
      const netCashFlow = -cashOut;
      cumulativeCashFlow += netCashFlow;

      periods.push({
        month,
        period: "Development",
        cashIn: 0,
        cashOut,
        netCashFlow,
        cumulativeCashFlow,
        description: "Construction and development costs"
      });
    }

    // Sales phase
    const monthlySales = netRevenue / timeline.salesMonths;
    
    for (let month = timeline.acquisitionMonths + timeline.developmentMonths + 1; month <= timeline.totalMonths; month++) {
      const cashIn = monthlySales;
      const netCashFlow = cashIn;
      cumulativeCashFlow += netCashFlow;

      periods.push({
        month,
        period: "Sales",
        cashIn,
        cashOut: 0,
        netCashFlow,
        cumulativeCashFlow,
        description: "Unit sales revenue"
      });
    }

    return periods;
  }

  private async identifyRisks(projectData: any, analysis: any): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = [
      {
        category: "Market Risk",
        description: "Property values may decline during development period",
        impact: analysis.roi < 15 ? "High" : analysis.roi < 25 ? "Medium" : "Low",
        probability: this.currentMarketData.marketTrends.demandLevel === "High" ? "Low" : "Medium",
        mitigation: "Monitor market conditions closely, consider pre-sales strategy"
      },
      {
        category: "Construction Risk",
        description: "Cost overruns and schedule delays",
        impact: "Medium",
        probability: projectData.units > 6 ? "Medium" : "Low",
        mitigation: "Fixed-price contracts, experienced contractors, 10% contingency"
      },
      {
        category: "Regulatory Risk",
        description: "Changes in zoning or building codes",
        impact: "High",
        probability: "Low",
        mitigation: "Secure permits early, stay updated on municipal changes"
      },
      {
        category: "Financial Risk",
        description: "Interest rate increases affecting financing costs",
        impact: "Medium",
        probability: "Medium",
        mitigation: "Lock in rates early, consider fixed-rate construction financing"
      }
    ];

    if (analysis.timeline > 24) {
      risks.push({
        category: "Timeline Risk",
        description: "Extended development timeline increases carrying costs",
        impact: "High",
        probability: "Medium",
        mitigation: "Aggressive project management, experienced team, buffer in timeline"
      });
    }

    return risks;
  }

  async getMarketData(): Promise<MarketData> {
    return this.currentMarketData;
  }

  async updateMarketData(data: Partial<MarketData>): Promise<MarketData> {
    this.currentMarketData = {
      ...this.currentMarketData,
      ...data,
      lastUpdated: new Date().toISOString()
    };
    return this.currentMarketData;
  }
}

export const financialModelingService = new FinancialModelingService();