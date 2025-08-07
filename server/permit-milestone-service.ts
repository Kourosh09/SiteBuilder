// Permit Tracking and Milestone Management Service for BuildwiseAI
import { db } from "./db";
import { permits, milestones, inspections, type Permit, type Milestone, type Inspection, type InsertPermit, type InsertMilestone, type InsertInspection } from "@shared/schema";
import { eq, and, desc, asc, sql, ilike, between } from "drizzle-orm";

export interface PermitSearchFilters {
  municipality?: string;
  permitType?: string;
  status?: string;
  dateRange?: { start: Date; end: Date };
  searchTerm?: string;
}

export interface MilestoneSearchFilters {
  projectId?: string;
  permitId?: string;
  category?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  overdue?: boolean;
}

export interface ProjectTimeline {
  permitId: string;
  permitNumber: string;
  status: string;
  milestones: (Milestone & { 
    upcomingInspections?: Inspection[];
    completedInspections?: Inspection[];
  })[];
  nextCriticalDate?: Date;
  overallProgress: number;
  criticalPath: string[];
}

export class PermitMilestoneService {
  
  // === PERMIT MANAGEMENT ===
  
  async createPermit(permitData: InsertPermit): Promise<Permit> {
    const [permit] = await db.insert(permits).values(permitData).returning();
    
    // Auto-create standard milestones for the permit type
    await this.createStandardMilestones(permit.id, permit.permitType);
    
    return permit;
  }
  
  async getPermits(filters: PermitSearchFilters = {}): Promise<Permit[]> {
    let query = db.select().from(permits);
    
    const conditions = [];
    
    if (filters.municipality) {
      conditions.push(ilike(permits.municipality, `%${filters.municipality}%`));
    }
    
    if (filters.permitType) {
      conditions.push(eq(permits.permitType, filters.permitType));
    }
    
    if (filters.status) {
      conditions.push(eq(permits.status, filters.status));
    }
    
    if (filters.searchTerm) {
      conditions.push(
        sql`(${permits.address} ILIKE ${`%${filters.searchTerm}%`} OR 
            ${permits.description} ILIKE ${`%${filters.searchTerm}%`} OR 
            ${permits.permitNumber} ILIKE ${`%${filters.searchTerm}%`})`
      );
    }
    
    if (filters.dateRange) {
      conditions.push(
        between(permits.applicationDate, filters.dateRange.start, filters.dateRange.end)
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(permits.applicationDate)).execute();
  }
  
  async getPermitById(id: string): Promise<Permit | null> {
    const [permit] = await db.select().from(permits).where(eq(permits.id, id));
    return permit || null;
  }
  
  async updatePermitStatus(id: string, status: string, notes?: string): Promise<void> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (status === 'Approved' || status === 'Issued') {
      updateData.approvalDate = new Date();
      // Set expiry date to 2 years from approval
      updateData.expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
    }
    
    await db.update(permits).set(updateData).where(eq(permits.id, id));
    
    // Auto-update related milestones based on permit status
    if (status === 'Approved') {
      await this.activateApprovedMilestones(id);
    }
  }
  
  // === MILESTONE MANAGEMENT ===
  
  async createMilestone(milestoneData: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db.insert(milestones).values(milestoneData).returning();
    return milestone;
  }
  
  async getMilestones(filters: MilestoneSearchFilters = {}): Promise<Milestone[]> {
    let query = db.select().from(milestones);
    
    const conditions = [];
    
    if (filters.projectId) {
      conditions.push(eq(milestones.projectId, filters.projectId));
    }
    
    if (filters.permitId) {
      conditions.push(eq(milestones.permitId, filters.permitId));
    }
    
    if (filters.category) {
      conditions.push(eq(milestones.category, filters.category));
    }
    
    if (filters.status) {
      conditions.push(eq(milestones.status, filters.status));
    }
    
    if (filters.priority) {
      conditions.push(eq(milestones.priority, filters.priority));
    }
    
    if (filters.assignedTo) {
      conditions.push(eq(milestones.assignedTo, filters.assignedTo));
    }
    
    if (filters.overdue) {
      conditions.push(
        sql`${milestones.dueDate} < NOW() AND ${milestones.status} != 'Completed'`
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(
      asc(milestones.dueDate),
      desc(sql`CASE ${milestones.priority} WHEN 'Critical' THEN 4 WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 ELSE 1 END`)
    ).execute();
  }
  
  async updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    if (updates.status === 'Completed' && !updates.completedDate) {
      updateData.completedDate = new Date();
    }
    
    await db.update(milestones).set(updateData).where(eq(milestones.id, id));
  }
  
  async getOverdueMilestones(): Promise<Milestone[]> {
    return await this.getMilestones({ overdue: true });
  }
  
  async getUpcomingMilestones(days: number = 7): Promise<Milestone[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return await db.select().from(milestones)
      .where(
        and(
          sql`${milestones.dueDate} BETWEEN NOW() AND ${endDate}`,
          sql`${milestones.status} != 'Completed'`
        )
      )
      .orderBy(asc(milestones.dueDate));
  }
  
  // === INSPECTION MANAGEMENT ===
  
  async scheduleInspection(inspectionData: InsertInspection): Promise<Inspection> {
    const [inspection] = await db.insert(inspections).values(inspectionData).returning();
    return inspection;
  }
  
  async getInspections(permitId?: string, milestoneId?: string): Promise<Inspection[]> {
    let query = db.select().from(inspections);
    
    const conditions = [];
    
    if (permitId) {
      conditions.push(eq(inspections.permitId, permitId));
    }
    
    if (milestoneId) {
      conditions.push(eq(inspections.milestoneId, milestoneId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(inspections.scheduledDate)).execute();
  }
  
  async updateInspectionResult(id: string, status: string, notes?: string, deficiencies: string[] = []): Promise<void> {
    const updateData: any = {
      status,
      notes,
      deficiencies,
      updatedAt: new Date()
    };
    
    if (status === 'Passed' || status === 'Failed') {
      updateData.completedDate = new Date();
    }
    
    await db.update(inspections).set(updateData).where(eq(inspections.id, id));
    
    // Auto-update related milestone if inspection passed
    if (status === 'Passed') {
      const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
      if (inspection?.milestoneId) {
        await this.updateMilestone(inspection.milestoneId, { status: 'Completed' });
      }
    }
  }
  
  // === PROJECT TIMELINE & ANALYTICS ===
  
  async getProjectTimeline(projectId: string): Promise<ProjectTimeline[]> {
    // Get all permits for the project
    const projectPermits = await db.select().from(permits)
      .where(eq(permits.projectId, projectId))
      .orderBy(asc(permits.applicationDate));
    
    const timelines: ProjectTimeline[] = [];
    
    for (const permit of projectPermits) {
      // Get milestones for this permit
      const permitMilestones = await db.select().from(milestones)
        .where(eq(milestones.permitId, permit.id))
        .orderBy(asc(milestones.dueDate));
      
      // Get inspections for each milestone
      const milestonesWithInspections = await Promise.all(
        permitMilestones.map(async (milestone) => {
          const inspectionList = await this.getInspections(permit.id, milestone.id);
          return {
            ...milestone,
            upcomingInspections: inspectionList.filter(i => i.status === 'Scheduled'),
            completedInspections: inspectionList.filter(i => ['Passed', 'Failed'].includes(i.status!))
          };
        })
      );
      
      // Calculate progress and critical path
      const completedMilestones = milestonesWithInspections.filter(m => m.status === 'Completed').length;
      const totalMilestones = milestonesWithInspections.length;
      const overallProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
      
      const criticalPath = milestonesWithInspections
        .filter(m => m.priority === 'Critical' && m.status !== 'Completed')
        .map(m => m.title);
      
      const nextCriticalDate = milestonesWithInspections
        .filter(m => m.status !== 'Completed' && m.dueDate)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0]?.dueDate;
      
      timelines.push({
        permitId: permit.id,
        permitNumber: permit.permitNumber,
        status: permit.status!,
        milestones: milestonesWithInspections,
        nextCriticalDate: nextCriticalDate ? new Date(nextCriticalDate) : undefined,
        overallProgress,
        criticalPath
      });
    }
    
    return timelines;
  }
  
  async getDashboardStats() {
    const stats = await Promise.all([
      // Total active permits
      db.select({ count: sql<number>`count(*)` }).from(permits)
        .where(sql`${permits.status} IN ('Under Review', 'Approved', 'Issued')`),
      
      // Overdue milestones
      db.select({ count: sql<number>`count(*)` }).from(milestones)
        .where(sql`${milestones.dueDate} < NOW() AND ${milestones.status} != 'Completed'`),
      
      // Upcoming inspections (next 7 days)
      db.select({ count: sql<number>`count(*)` }).from(inspections)
        .where(sql`${inspections.scheduledDate} BETWEEN NOW() AND NOW() + INTERVAL '7 days' AND ${inspections.status} = 'Scheduled'`),
      
      // Critical milestones pending
      db.select({ count: sql<number>`count(*)` }).from(milestones)
        .where(and(
          eq(milestones.priority, 'Critical'),
          sql`${milestones.status} != 'Completed'`
        ))
    ]);
    
    return {
      activePermits: stats[0][0]?.count || 0,
      overdueMilestones: stats[1][0]?.count || 0,
      upcomingInspections: stats[2][0]?.count || 0,
      criticalMilestones: stats[3][0]?.count || 0
    };
  }
  
  // === HELPER METHODS ===
  
  private async createStandardMilestones(permitId: string, permitType: string): Promise<void> {
    const standardMilestones = this.getStandardMilestoneTemplates(permitType);
    
    for (const template of standardMilestones) {
      await this.createMilestone({
        permitId,
        ...template
      });
    }
  }
  
  private getStandardMilestoneTemplates(permitType: string): Omit<InsertMilestone, 'permitId'>[] {
    const baseDate = new Date();
    
    const templates: Record<string, Omit<InsertMilestone, 'permitId'>[]> = {
      'Building': [
        {
          title: 'Development Permit Approval',
          description: 'Obtain development permit approval from municipality',
          category: 'Permit',
          priority: 'Critical',
          dueDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        {
          title: 'Building Permit Issuance',
          description: 'Building permit issued and ready for construction',
          category: 'Permit',
          priority: 'Critical',
          dueDate: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days
        },
        {
          title: 'Foundation Inspection',
          description: 'Foundation and structural elements inspection',
          category: 'Inspection',
          priority: 'High',
          dueDate: new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
        {
          title: 'Framing Inspection',
          description: 'Structural framing inspection',
          category: 'Inspection',
          priority: 'High',
          dueDate: new Date(baseDate.getTime() + 120 * 24 * 60 * 60 * 1000), // 120 days
        },
        {
          title: 'Electrical Rough-In',
          description: 'Electrical rough-in inspection',
          category: 'Inspection',
          priority: 'Medium',
          dueDate: new Date(baseDate.getTime() + 150 * 24 * 60 * 60 * 1000), // 150 days
        },
        {
          title: 'Plumbing Rough-In',
          description: 'Plumbing rough-in inspection',
          category: 'Inspection',
          priority: 'Medium',
          dueDate: new Date(baseDate.getTime() + 150 * 24 * 60 * 60 * 1000), // 150 days
        },
        {
          title: 'Insulation Inspection',
          description: 'Insulation and vapor barrier inspection',
          category: 'Inspection',
          priority: 'Medium',
          dueDate: new Date(baseDate.getTime() + 180 * 24 * 60 * 60 * 1000), // 180 days
        },
        {
          title: 'Final Inspection',
          description: 'Final building inspection and occupancy permit',
          category: 'Completion',
          priority: 'Critical',
          dueDate: new Date(baseDate.getTime() + 240 * 24 * 60 * 60 * 1000), // 240 days
        }
      ],
      'Development': [
        {
          title: 'Preliminary Approval',
          description: 'Preliminary development application approval',
          category: 'Permit',
          priority: 'Critical',
          dueDate: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Detailed Design Approval',
          description: 'Detailed engineering and architectural plans approval',
          category: 'Permit',
          priority: 'High',
          dueDate: new Date(baseDate.getTime() + 120 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Infrastructure Review',
          description: 'Municipal infrastructure capacity review',
          category: 'Permit',
          priority: 'High',
          dueDate: new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Final Development Permit',
          description: 'Final development permit issuance',
          category: 'Permit',
          priority: 'Critical',
          dueDate: new Date(baseDate.getTime() + 180 * 24 * 60 * 60 * 1000),
        }
      ],
      'Demolition': [
        {
          title: 'Demolition Permit Approval',
          description: 'Demolition permit approved by municipality',
          category: 'Permit',
          priority: 'Critical',
          dueDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Utility Disconnection',
          description: 'All utilities safely disconnected',
          category: 'Construction',
          priority: 'Critical',
          dueDate: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Asbestos Survey',
          description: 'Asbestos survey and abatement if required',
          category: 'Inspection',
          priority: 'Critical',
          dueDate: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Demolition Completion',
          description: 'Demolition completed and site cleared',
          category: 'Completion',
          priority: 'High',
          dueDate: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        }
      ]
    };
    
    return templates[permitType] || templates['Building'];
  }
  
  private async activateApprovedMilestones(permitId: string): Promise<void> {
    // Update permit-related milestones to "In Progress" when permit is approved
    await db.update(milestones)
      .set({ 
        status: 'In Progress',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(milestones.permitId, permitId),
          eq(milestones.category, 'Permit'),
          eq(milestones.status, 'Pending')
        )
      );
  }
}

export const permitMilestoneService = new PermitMilestoneService();