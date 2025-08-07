// Partner Finder & Trade Professional Network for BuildwiseAI
export interface TradePartner {
  id: string;
  name: string;
  company: string;
  tradeType: 'architect' | 'engineer' | 'contractor' | 'developer' | 'realtor' | 'consultant' | 'surveyor' | 'lawyer' | 'financier';
  specializations: string[];
  serviceAreas: string[];
  experience: number; // years
  portfolio: {
    projectName: string;
    location: string;
    value: number;
    year: number;
    description: string;
    imageUrl?: string;
  }[];
  credentials: string[];
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
    address?: string;
  };
  rating: number;
  reviewCount: number;
  verified: boolean;
  createdAt: Date;
  lastActive: Date;
  availability: 'available' | 'busy' | 'unavailable';
}

export interface ProjectOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  projectType: 'residential' | 'commercial' | 'mixed-use' | 'industrial' | 'renovation';
  projectSize: 'small' | 'medium' | 'large' | 'mega';
  estimatedValue: number;
  timeline: string;
  requiredTrades: string[];
  clientName: string;
  clientType: 'developer' | 'builder' | 'property-owner' | 'investor';
  contactInfo: {
    email: string;
    phone?: string;
  };
  proposals: TradeProposal[];
  status: 'open' | 'reviewing' | 'awarded' | 'closed';
  postedDate: Date;
  deadline?: Date;
  requirements: string[];
}

export interface TradeProposal {
  id: string;
  projectId: string;
  partnerId: string;
  partnerName: string;
  company: string;
  tradeType: string;
  proposedValue: number;
  timeline: string;
  approach: string;
  experience: string;
  portfolio: string[];
  certifications: string[];
  references: string[];
  submittedAt: Date;
  status: 'submitted' | 'shortlisted' | 'accepted' | 'declined';
}

export interface PartnerSearchFilters {
  tradeType?: string;
  serviceArea?: string;
  experience?: { min: number; max: number };
  specialization?: string;
  availability?: string;
  rating?: number;
  verified?: boolean;
}

export class PartnerFinderService {
  private partners: TradePartner[] = [];
  private opportunities: ProjectOpportunity[] = [];
  private proposals: TradeProposal[] = [];

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Add a new trade partner
   */
  async addPartner(partnerData: Omit<TradePartner, 'id' | 'createdAt' | 'lastActive' | 'rating' | 'reviewCount'>): Promise<TradePartner> {
    const partner: TradePartner = {
      ...partnerData,
      id: this.generateId(),
      createdAt: new Date(),
      lastActive: new Date(),
      rating: 4.5, // Default rating for new partners
      reviewCount: 0
    };

    this.partners.push(partner);
    return partner;
  }

  /**
   * Search partners with filters
   */
  searchPartners(filters: PartnerSearchFilters = {}): TradePartner[] {
    let filteredPartners = [...this.partners];

    if (filters.tradeType) {
      filteredPartners = filteredPartners.filter(p => p.tradeType === filters.tradeType);
    }

    if (filters.serviceArea) {
      filteredPartners = filteredPartners.filter(p => 
        p.serviceAreas.some(area => area.toLowerCase().includes(filters.serviceArea!.toLowerCase()))
      );
    }

    if (filters.experience) {
      filteredPartners = filteredPartners.filter(p => 
        p.experience >= filters.experience!.min && p.experience <= filters.experience!.max
      );
    }

    if (filters.specialization) {
      filteredPartners = filteredPartners.filter(p =>
        p.specializations.some(spec => spec.toLowerCase().includes(filters.specialization!.toLowerCase()))
      );
    }

    if (filters.availability) {
      filteredPartners = filteredPartners.filter(p => p.availability === filters.availability);
    }

    if (filters.rating) {
      filteredPartners = filteredPartners.filter(p => p.rating >= filters.rating!);
    }

    if (filters.verified !== undefined) {
      filteredPartners = filteredPartners.filter(p => p.verified === filters.verified);
    }

    return filteredPartners.sort((a, b) => b.rating - a.rating);
  }

  /**
   * Get partner by ID
   */
  getPartnerById(id: string): TradePartner | null {
    return this.partners.find(p => p.id === id) || null;
  }

  /**
   * Post a new project opportunity
   */
  async postProjectOpportunity(opportunityData: Omit<ProjectOpportunity, 'id' | 'proposals' | 'postedDate'>): Promise<ProjectOpportunity> {
    const opportunity: ProjectOpportunity = {
      ...opportunityData,
      id: this.generateId(),
      proposals: [],
      postedDate: new Date()
    };

    this.opportunities.push(opportunity);
    return opportunity;
  }

  /**
   * Get all project opportunities
   */
  getProjectOpportunities(status?: ProjectOpportunity['status']): ProjectOpportunity[] {
    let opportunities = [...this.opportunities];
    
    if (status) {
      opportunities = opportunities.filter(opp => opp.status === status);
    }

    return opportunities.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());
  }

  /**
   * Get project opportunity by ID
   */
  getOpportunityById(id: string): ProjectOpportunity | null {
    return this.opportunities.find(opp => opp.id === id) || null;
  }

  /**
   * Submit a proposal for a project
   */
  async submitProposal(proposalData: Omit<TradeProposal, 'id' | 'submittedAt' | 'status'>): Promise<TradeProposal> {
    const proposal: TradeProposal = {
      ...proposalData,
      id: this.generateId(),
      submittedAt: new Date(),
      status: 'submitted'
    };

    this.proposals.push(proposal);

    // Add proposal to the project opportunity
    const opportunity = this.opportunities.find(opp => opp.id === proposalData.projectId);
    if (opportunity) {
      opportunity.proposals.push(proposal);
    }

    return proposal;
  }

  /**
   * Get proposals for a project
   */
  getProjectProposals(projectId: string): TradeProposal[] {
    return this.proposals
      .filter(proposal => proposal.projectId === projectId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  /**
   * Get proposals by partner
   */
  getPartnerProposals(partnerId: string): TradeProposal[] {
    return this.proposals
      .filter(proposal => proposal.partnerId === partnerId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  /**
   * Update proposal status
   */
  updateProposalStatus(proposalId: string, status: TradeProposal['status']): boolean {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal) return false;

    proposal.status = status;
    return true;
  }

  /**
   * Get recommended partners for a project
   */
  getRecommendedPartners(projectType: string, location: string, requiredTrades: string[]): TradePartner[] {
    return this.partners.filter(partner => {
      // Match trade type
      const tradeMatch = requiredTrades.some(trade => 
        partner.tradeType.includes(trade.toLowerCase() as any) ||
        partner.specializations.some(spec => spec.toLowerCase().includes(trade.toLowerCase()))
      );

      // Match service area
      const locationMatch = partner.serviceAreas.some(area =>
        area.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(area.toLowerCase())
      );

      // High rating and verified
      const qualityMatch = partner.rating >= 4.0 && partner.verified;

      return tradeMatch && locationMatch && qualityMatch;
    }).sort((a, b) => b.rating - a.rating).slice(0, 10);
  }

  /**
   * Get partner statistics
   */
  getPartnerStats(): {
    totalPartners: number;
    byTradeType: Record<string, number>;
    byCity: Record<string, number>;
    averageRating: number;
    verifiedPercentage: number;
  } {
    const totalPartners = this.partners.length;

    const byTradeType: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    let totalRating = 0;
    let verifiedCount = 0;

    this.partners.forEach(partner => {
      // Trade type stats
      byTradeType[partner.tradeType] = (byTradeType[partner.tradeType] || 0) + 1;

      // City stats (first service area)
      if (partner.serviceAreas.length > 0) {
        const city = partner.serviceAreas[0];
        byCity[city] = (byCity[city] || 0) + 1;
      }

      totalRating += partner.rating;
      if (partner.verified) verifiedCount++;
    });

    return {
      totalPartners,
      byTradeType,
      byCity,
      averageRating: totalRating / totalPartners,
      verifiedPercentage: (verifiedCount / totalPartners) * 100
    };
  }

  /**
   * Initialize sample data
   */
  private initializeSampleData(): void {
    // Sample trade partners
    const samplePartners: Omit<TradePartner, 'id' | 'createdAt' | 'lastActive' | 'rating' | 'reviewCount'>[] = [
      {
        name: "Sarah Chen",
        company: "Chen Architecture Group",
        tradeType: "architect",
        specializations: ["Residential Design", "Multi-family", "Green Building"],
        serviceAreas: ["Vancouver", "Burnaby", "Richmond"],
        experience: 12,
        portfolio: [
          {
            projectName: "Maple Ridge Townhomes",
            location: "Maple Ridge",
            value: 2800000,
            year: 2023,
            description: "32-unit townhouse development with modern design"
          }
        ],
        credentials: ["AIBC", "LEED AP", "Passive House Designer"],
        contactInfo: {
          email: "sarah@chenarch.com",
          phone: "604-555-0123",
          website: "www.chenarchitecture.com"
        },
        verified: true,
        availability: "available"
      },
      {
        name: "Mike Thompson",
        company: "Thompson Structural Engineering",
        tradeType: "engineer",
        specializations: ["Structural Engineering", "Seismic Design", "High-Rise"],
        serviceAreas: ["Lower Mainland", "Fraser Valley"],
        experience: 18,
        portfolio: [
          {
            projectName: "Burnaby Mixed-Use Tower",
            location: "Burnaby",
            value: 15000000,
            year: 2023,
            description: "28-story mixed-use development with podium"
          }
        ],
        credentials: ["PEng", "EGBC", "SEBC"],
        contactInfo: {
          email: "mike@thompsoneng.ca",
          phone: "604-555-0456"
        },
        verified: true,
        availability: "busy"
      },
      {
        name: "David Kim",
        company: "Pacific Coast Contractors",
        tradeType: "contractor",
        specializations: ["Residential Construction", "Custom Homes", "Renovations"],
        serviceAreas: ["Coquitlam", "Port Coquitlam", "Port Moody"],
        experience: 15,
        portfolio: [
          {
            projectName: "Tri-Cities Luxury Homes",
            location: "Coquitlam",
            value: 3500000,
            year: 2023,
            description: "High-end single-family development"
          }
        ],
        credentials: ["Licensed Contractor", "CSA Gold Seal", "HPO"],
        contactInfo: {
          email: "david@pacificcoast.ca",
          phone: "604-555-0789"
        },
        verified: true,
        availability: "available"
      }
    ];

    // Add sample partners
    samplePartners.forEach(async (partnerData) => {
      await this.addPartner(partnerData);
    });

    // Sample project opportunities
    const sampleOpportunities: Omit<ProjectOpportunity, 'id' | 'proposals' | 'postedDate'>[] = [
      {
        title: "Maple Ridge Multi-Family Development",
        description: "New 40-unit townhouse and apartment development requiring full design and construction team",
        location: "Downtown Maple Ridge",
        city: "Maple Ridge",
        projectType: "residential",
        projectSize: "large",
        estimatedValue: 18000000,
        timeline: "24 months",
        requiredTrades: ["architect", "engineer", "contractor"],
        clientName: "Ridge Development Corp",
        clientType: "developer",
        contactInfo: {
          email: "projects@ridgedev.ca",
          phone: "604-555-9999"
        },
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        requirements: [
          "Minimum 10 years experience",
          "Previous multi-family projects",
          "Local references required",
          "LEED certification preferred"
        ]
      },
      {
        title: "Burnaby Mixed-Use Renovation",
        description: "Historic building conversion to modern mixed-use with retail and residential units",
        location: "Brentwood Burnaby",
        city: "Burnaby",
        projectType: "mixed-use",
        projectSize: "medium",
        estimatedValue: 8500000,
        timeline: "18 months",
        requiredTrades: ["architect", "engineer", "contractor", "consultant"],
        clientName: "Heritage Properties Ltd",
        clientType: "developer",
        contactInfo: {
          email: "info@heritageprops.com"
        },
        status: "reviewing",
        requirements: [
          "Heritage building experience",
          "Seismic upgrade expertise",
          "City approval track record"
        ]
      }
    ];

    // Add sample opportunities
    sampleOpportunities.forEach(async (opportunityData) => {
      await this.postProjectOpportunity(opportunityData);
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const partnerFinderService = new PartnerFinderService();