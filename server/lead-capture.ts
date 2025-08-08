/**
 * Lead Capture and Contact Management Service
 * Handles visitor inquiries, contact forms, and marketing automation
 */

export interface LeadCaptureData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  propertyAddress?: string;
  city?: string;
  developmentType: 'single-family' | 'duplex' | 'multiplex' | 'apartment' | 'commercial' | 'mixed-use';
  projectBudget?: string;
  timeline?: string;
  experience: 'first-time' | 'some-experience' | 'experienced' | 'professional';
  specificNeeds: string[];
  message?: string;
  source: 'landing-page' | 'property-analysis' | 'contact-form' | 'referral';
  leadStatus: 'new' | 'contacted' | 'qualified' | 'proposal-sent' | 'converted' | 'archived';
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractorProposal {
  id?: string;
  leadId: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  licenseNumber: string;
  specialties: string[];
  proposalSummary: string;
  estimatedCost: number;
  timeline: string;
  keyMilestones: {
    milestone: string;
    duration: string;
    cost: number;
  }[];
  references: {
    projectName: string;
    clientName: string;
    completedDate: string;
    projectValue: number;
  }[];
  certifications: string[];
  insuranceInfo: {
    liability: number;
    workersComp: boolean;
    bonded: boolean;
  };
  proposalStatus: 'submitted' | 'under-review' | 'accepted' | 'rejected';
  submittedAt: Date;
}

export class LeadCaptureService {
  private leads: Map<string, LeadCaptureData> = new Map();
  private proposals: Map<string, ContractorProposal> = new Map();

  /**
   * Capture lead from landing page interactions
   */
  captureLead(leadData: Omit<LeadCaptureData, 'id' | 'createdAt' | 'updatedAt'>): LeadCaptureData {
    const lead: LeadCaptureData = {
      ...leadData,
      id: this.generateLeadId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.leads.set(lead.id!, lead);
    console.log(`📧 New lead captured: ${lead.name} (${lead.email}) - ${lead.developmentType} project`);
    
    // Trigger automated email sequence
    this.triggerWelcomeEmail(lead);
    
    return lead;
  }

  /**
   * Update lead status and information
   */
  updateLead(leadId: string, updates: Partial<LeadCaptureData>): LeadCaptureData | null {
    const lead = this.leads.get(leadId);
    if (!lead) return null;

    const updatedLead = {
      ...lead,
      ...updates,
      updatedAt: new Date()
    };

    this.leads.set(leadId, updatedLead);
    return updatedLead;
  }

  /**
   * Get leads with filtering options
   */
  getLeads(filters?: {
    status?: string;
    developmentType?: string;
    experience?: string;
    city?: string;
    dateRange?: { start: Date; end: Date };
  }): LeadCaptureData[] {
    let leads = Array.from(this.leads.values());

    if (filters) {
      if (filters.status) {
        leads = leads.filter(lead => lead.leadStatus === filters.status);
      }
      if (filters.developmentType) {
        leads = leads.filter(lead => lead.developmentType === filters.developmentType);
      }
      if (filters.experience) {
        leads = leads.filter(lead => lead.experience === filters.experience);
      }
      if (filters.city) {
        leads = leads.filter(lead => lead.city === filters.city);
      }
      if (filters.dateRange) {
        leads = leads.filter(lead => 
          lead.createdAt >= filters.dateRange!.start && 
          lead.createdAt <= filters.dateRange!.end
        );
      }
    }

    return leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Submit contractor proposal for a lead
   */
  submitContractorProposal(proposalData: Omit<ContractorProposal, 'id' | 'submittedAt'>): ContractorProposal {
    const proposal: ContractorProposal = {
      ...proposalData,
      id: this.generateProposalId(),
      submittedAt: new Date()
    };

    this.proposals.set(proposal.id!, proposal);
    
    // Update lead status
    const lead = this.leads.get(proposal.leadId);
    if (lead && lead.leadStatus === 'qualified') {
      this.updateLead(proposal.leadId, { leadStatus: 'proposal-sent' });
    }

    console.log(`🔨 New contractor proposal: ${proposal.contractorName} for lead ${proposal.leadId}`);
    
    // Notify lead about new proposal
    this.notifyLeadOfProposal(proposal);
    
    return proposal;
  }

  /**
   * Get proposals for a specific lead
   */
  getProposalsForLead(leadId: string): ContractorProposal[] {
    return Array.from(this.proposals.values())
      .filter(proposal => proposal.leadId === leadId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  /**
   * Get all proposals with filtering
   */
  getAllProposals(filters?: {
    status?: string;
    contractorName?: string;
    budgetRange?: { min: number; max: number };
  }): ContractorProposal[] {
    let proposals = Array.from(this.proposals.values());

    if (filters) {
      if (filters.status) {
        proposals = proposals.filter(proposal => proposal.proposalStatus === filters.status);
      }
      if (filters.contractorName) {
        proposals = proposals.filter(proposal => 
          proposal.contractorName.toLowerCase().includes(filters.contractorName!.toLowerCase())
        );
      }
      if (filters.budgetRange) {
        proposals = proposals.filter(proposal => 
          proposal.estimatedCost >= filters.budgetRange!.min && 
          proposal.estimatedCost <= filters.budgetRange!.max
        );
      }
    }

    return proposals.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  /**
   * Generate demo project timeline with contractor milestones
   */
  generateProjectTimeline(leadId: string): {
    projectPhases: {
      phase: string;
      description: string;
      duration: string;
      keyTasks: string[];
      contractors: {
        trade: string;
        estimatedCost: number;
        timeline: string;
      }[];
    }[];
    totalTimeline: string;
    totalEstimatedCost: number;
  } {
    const lead = this.leads.get(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const baseTimeline = this.getBaseTimeline(lead.developmentType);
    const proposals = this.getProposalsForLead(leadId);
    
    // Integrate contractor proposals into timeline
    const enhancedTimeline = baseTimeline.map(phase => {
      const relevantProposals = proposals.filter(p => 
        this.getTradesForPhase(phase.phase).some(trade => 
          p.specialties.some(specialty => specialty.toLowerCase().includes(trade.toLowerCase()))
        )
      );

      const contractors = relevantProposals.map(proposal => ({
        trade: proposal.specialties[0],
        estimatedCost: proposal.estimatedCost,
        timeline: proposal.timeline
      }));

      return {
        ...phase,
        contractors
      };
    });

    const totalCost = proposals.reduce((sum, proposal) => sum + proposal.estimatedCost, 0);
    
    return {
      projectPhases: enhancedTimeline,
      totalTimeline: this.calculateTotalTimeline(lead.developmentType),
      totalEstimatedCost: totalCost || this.getEstimatedCost(lead.developmentType)
    };
  }

  private generateLeadId(): string {
    return 'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateProposalId(): string {
    return 'prop_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async triggerWelcomeEmail(lead: LeadCaptureData): Promise<void> {
    // Email automation would integrate with services like SendGrid, Mailchimp
    console.log(`📧 Sending welcome email to ${lead.email}`);
    console.log(`📧 Email includes: Property analysis demo, next steps, contact information`);
  }

  private async notifyLeadOfProposal(proposal: ContractorProposal): Promise<void> {
    const lead = this.leads.get(proposal.leadId);
    if (lead) {
      console.log(`📧 Notifying ${lead.email} of new proposal from ${proposal.contractorName}`);
    }
  }

  private getBaseTimeline(developmentType: string): {
    phase: string;
    description: string;
    duration: string;
    keyTasks: string[];
  }[] {
    const timelines = {
      'single-family': [
        {
          phase: 'Planning & Permits',
          description: 'Design, engineering, and permit approval',
          duration: '2-3 months',
          keyTasks: ['Architectural plans', 'Engineering reports', 'Permit submissions', 'Approvals']
        },
        {
          phase: 'Site Preparation',
          description: 'Demolition and site work',
          duration: '2-4 weeks',
          keyTasks: ['Demolition', 'Excavation', 'Utilities installation', 'Foundation prep']
        },
        {
          phase: 'Construction',
          description: 'Building construction and finishing',
          duration: '6-8 months',
          keyTasks: ['Foundation', 'Framing', 'Roofing', 'Systems', 'Interior', 'Exterior']
        },
        {
          phase: 'Final Inspections',
          description: 'Inspections and occupancy permit',
          duration: '2-3 weeks',
          keyTasks: ['Final inspections', 'Occupancy permit', 'Landscaping', 'Final walkthrough']
        }
      ],
      'multiplex': [
        {
          phase: 'Planning & Development Permit',
          description: 'Complex planning and regulatory approval',
          duration: '4-6 months',
          keyTasks: ['Development application', 'Community consultation', 'Engineering', 'Approvals']
        },
        {
          phase: 'Site Development',
          description: 'Site preparation and infrastructure',
          duration: '1-2 months',
          keyTasks: ['Demolition', 'Excavation', 'Utilities', 'Infrastructure']
        },
        {
          phase: 'Construction',
          description: 'Multi-unit building construction',
          duration: '8-12 months',
          keyTasks: ['Foundation', 'Structure', 'Building envelope', 'Systems', 'Unit finishing']
        },
        {
          phase: 'Completion & Occupancy',
          description: 'Final approvals and move-in ready',
          duration: '1 month',
          keyTasks: ['Final inspections', 'Strata registration', 'Occupancy permits', 'Handover']
        }
      ]
    };

    return timelines[developmentType as keyof typeof timelines] || timelines['single-family'];
  }

  private getTradesForPhase(phase: string): string[] {
    const tradesByPhase: { [key: string]: string[] } = {
      'Planning & Permits': ['architect', 'engineer', 'consultant'],
      'Site Preparation': ['excavation', 'demolition', 'utilities'],
      'Construction': ['framing', 'roofing', 'electrical', 'plumbing', 'drywall', 'flooring'],
      'Final Inspections': ['landscaping', 'cleaning', 'inspector']
    };

    return tradesByPhase[phase] || [];
  }

  private calculateTotalTimeline(developmentType: string): string {
    const timelines = {
      'single-family': '8-12 months',
      'duplex': '9-14 months',
      'multiplex': '12-18 months',
      'apartment': '18-24 months'
    };

    return timelines[developmentType as keyof typeof timelines] || '8-12 months';
  }

  private getEstimatedCost(developmentType: string): number {
    const costs = {
      'single-family': 800000,
      'duplex': 1200000,
      'multiplex': 2000000,
      'apartment': 3500000
    };

    return costs[developmentType as keyof typeof costs] || 800000;
  }
}

export const leadCaptureService = new LeadCaptureService();