// Trade Contractor Marketplace Service for BuildwiseAI
import { db } from "./db";
import { contractors, projects, bids, contractorReviews, type Contractor, type Project, type Bid, type ContractorReview, type InsertContractor, type InsertProject, type InsertBid, type InsertContractorReview } from "@shared/schema";
import { eq, and, desc, asc, sql, ilike, inArray, between } from "drizzle-orm";

export interface ContractorSearchFilters {
  trades?: string[];
  serviceAreas?: string[];
  city?: string;
  minRating?: number;
  availabilityStatus?: string;
  experienceLevel?: string;
  isVerified?: boolean;
  searchTerm?: string;
}

export interface ProjectSearchFilters {
  tradeNeeded?: string;
  city?: string;
  projectType?: string;
  projectSize?: string;
  status?: string;
  budgetRange?: { min: number; max: number };
  isUrgent?: boolean;
  searchTerm?: string;
}

export interface BidSearchFilters {
  projectId?: string;
  contractorId?: string;
  status?: string;
  dateRange?: { start: Date; end: Date };
}

export class ContractorMarketplaceService {
  
  // === CONTRACTOR MANAGEMENT ===
  
  async createContractor(contractorData: InsertContractor): Promise<Contractor> {
    const [contractor] = await db.insert(contractors).values(contractorData).returning();
    return contractor;
  }
  
  async getContractors(filters: ContractorSearchFilters = {}): Promise<Contractor[]> {
    let query = db.select().from(contractors);
    
    const conditions = [];
    
    if (filters.trades && filters.trades.length > 0) {
      // Use SQL to check if any of the requested trades overlap with contractor's trades
      conditions.push(
        sql`EXISTS (SELECT 1 FROM unnest(${contractors.trades}) AS trade WHERE trade = ANY(${filters.trades}))`
      );
    }
    
    if (filters.serviceAreas && filters.serviceAreas.length > 0) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM unnest(${contractors.serviceAreas}) AS area WHERE area = ANY(${filters.serviceAreas}))`
      );
    }
    
    if (filters.city) {
      conditions.push(ilike(contractors.city, `%${filters.city}%`));
    }
    
    if (filters.minRating) {
      conditions.push(sql`CAST(${contractors.rating} AS DECIMAL) >= ${filters.minRating}`);
    }
    
    if (filters.availabilityStatus) {
      conditions.push(eq(contractors.availabilityStatus, filters.availabilityStatus));
    }
    
    if (filters.isVerified !== undefined) {
      conditions.push(eq(contractors.isVerified, filters.isVerified ? "true" : "false"));
    }
    
    if (filters.searchTerm) {
      conditions.push(
        sql`(${contractors.companyName} ILIKE ${`%${filters.searchTerm}%`} OR 
            ${contractors.contactName} ILIKE ${`%${filters.searchTerm}%`} OR 
            ${contractors.description} ILIKE ${`%${filters.searchTerm}%`})`
      );
    }
    
    // Always filter for active contractors
    conditions.push(eq(contractors.isActive, "true"));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(contractors.rating), desc(contractors.totalJobs)).execute();
  }
  
  async getContractorById(id: string): Promise<Contractor | null> {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor || null;
  }
  
  async updateContractor(id: string, updates: Partial<InsertContractor>): Promise<void> {
    await db.update(contractors).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(contractors.id, id));
  }
  
  async updateContractorRating(contractorId: string): Promise<void> {
    // Calculate average rating from reviews
    const [result] = await db.select({
      avgRating: sql<number>`ROUND(AVG(CAST(${contractorReviews.rating} AS DECIMAL)), 1)`,
      totalReviews: sql<number>`COUNT(*)`
    })
    .from(contractorReviews)
    .where(eq(contractorReviews.contractorId, contractorId));
    
    if (result && result.totalReviews > 0) {
      await db.update(contractors).set({
        rating: result.avgRating.toString(),
        updatedAt: new Date()
      }).where(eq(contractors.id, contractorId));
    }
  }
  
  // === PROJECT MANAGEMENT ===
  
  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }
  
  async getProjects(filters: ProjectSearchFilters = {}): Promise<Project[]> {
    let query = db.select().from(projects);
    
    const conditions = [];
    
    if (filters.tradeNeeded) {
      conditions.push(eq(projects.tradeNeeded, filters.tradeNeeded));
    }
    
    if (filters.city) {
      conditions.push(ilike(projects.city, `%${filters.city}%`));
    }
    
    if (filters.projectType) {
      conditions.push(eq(projects.projectType, filters.projectType));
    }
    
    if (filters.projectSize) {
      conditions.push(eq(projects.projectSize, filters.projectSize));
    }
    
    if (filters.status) {
      conditions.push(eq(projects.status, filters.status));
    }
    
    if (filters.budgetRange) {
      conditions.push(
        sql`CAST(${projects.estimatedBudget} AS INTEGER) BETWEEN ${filters.budgetRange.min} AND ${filters.budgetRange.max}`
      );
    }
    
    if (filters.isUrgent) {
      conditions.push(eq(projects.isUrgent, "true"));
    }
    
    if (filters.searchTerm) {
      conditions.push(
        sql`(${projects.title} ILIKE ${`%${filters.searchTerm}%`} OR 
            ${projects.description} ILIKE ${`%${filters.searchTerm}%`} OR 
            ${projects.location} ILIKE ${`%${filters.searchTerm}%`})`
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(
      desc(sql`CASE WHEN ${projects.isUrgent} = 'true' THEN 1 ELSE 0 END`),
      desc(projects.createdAt)
    ).execute();
  }
  
  async getProjectById(id: string): Promise<Project | null> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || null;
  }
  
  async updateProject(id: string, updates: Partial<InsertProject>): Promise<void> {
    await db.update(projects).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(projects.id, id));
  }
  
  async getProjectsForContractor(contractorId: string): Promise<Project[]> {
    // Get projects that match contractor's trades and service areas
    const contractor = await this.getContractorById(contractorId);
    if (!contractor) return [];
    
    return await db.select().from(projects)
      .where(
        and(
          eq(projects.status, "Open"),
          sql`${projects.tradeNeeded} = ANY(${contractor.trades})`,
          sql`${projects.city} = ANY(${contractor.serviceAreas})`
        )
      )
      .orderBy(
        desc(sql`CASE WHEN ${projects.isUrgent} = 'true' THEN 1 ELSE 0 END`),
        desc(projects.createdAt)
      );
  }
  
  // === BID MANAGEMENT ===
  
  async createBid(bidData: InsertBid): Promise<Bid> {
    // Check if contractor already has a bid for this project
    const existingBid = await db.select().from(bids)
      .where(and(
        eq(bids.projectId, bidData.projectId),
        eq(bids.contractorId, bidData.contractorId)
      ));
    
    if (existingBid.length > 0) {
      throw new Error("You have already submitted a bid for this project");
    }
    
    const [bid] = await db.insert(bids).values({
      ...bidData,
      submittedAt: new Date()
    }).returning();
    
    return bid;
  }
  
  async getBids(filters: BidSearchFilters = {}): Promise<Bid[]> {
    let query = db.select({
      ...bids,
      contractorName: contractors.companyName,
      contractorRating: contractors.rating,
      projectTitle: projects.title,
    })
    .from(bids)
    .leftJoin(contractors, eq(bids.contractorId, contractors.id))
    .leftJoin(projects, eq(bids.projectId, projects.id));
    
    const conditions = [];
    
    if (filters.projectId) {
      conditions.push(eq(bids.projectId, filters.projectId));
    }
    
    if (filters.contractorId) {
      conditions.push(eq(bids.contractorId, filters.contractorId));
    }
    
    if (filters.status) {
      conditions.push(eq(bids.status, filters.status));
    }
    
    if (filters.dateRange) {
      conditions.push(
        between(bids.submittedAt, filters.dateRange.start, filters.dateRange.end)
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(bids.submittedAt)).execute();
  }
  
  async updateBidStatus(bidId: string, status: string, notes?: string): Promise<void> {
    const updateData: any = {
      status,
      respondedAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.update(bids).set(updateData).where(eq(bids.id, bidId));
    
    // If bid is accepted, update project status and reject other bids
    if (status === "Accepted") {
      const [bid] = await db.select().from(bids).where(eq(bids.id, bidId));
      if (bid) {
        // Update project status
        await this.updateProject(bid.projectId, { status: "Awarded" });
        
        // Reject other bids for the same project
        await db.update(bids).set({
          status: "Rejected",
          respondedAt: new Date(),
          updatedAt: new Date()
        }).where(and(
          eq(bids.projectId, bid.projectId),
          sql`${bids.id} != ${bidId}`,
          eq(bids.status, "Submitted")
        ));
      }
    }
  }
  
  // === REVIEW MANAGEMENT ===
  
  async createReview(reviewData: InsertContractorReview): Promise<ContractorReview> {
    const [review] = await db.insert(contractorReviews).values(reviewData).returning();
    
    // Update contractor's overall rating
    await this.updateContractorRating(reviewData.contractorId);
    
    return review;
  }
  
  async getReviewsForContractor(contractorId: string): Promise<ContractorReview[]> {
    return await db.select().from(contractorReviews)
      .where(eq(contractorReviews.contractorId, contractorId))
      .orderBy(desc(contractorReviews.createdAt));
  }
  
  // === DASHBOARD ANALYTICS ===
  
  async getMarketplaceStats() {
    const stats = await Promise.all([
      // Total active contractors
      db.select({ count: sql<number>`count(*)` }).from(contractors)
        .where(eq(contractors.isActive, "true")),
      
      // Open projects
      db.select({ count: sql<number>`count(*)` }).from(projects)
        .where(eq(projects.status, "Open")),
      
      // Total bids this month
      db.select({ count: sql<number>`count(*)` }).from(bids)
        .where(sql`${bids.submittedAt} >= date_trunc('month', current_date)`),
      
      // Projects awarded this month
      db.select({ count: sql<number>`count(*)` }).from(projects)
        .where(and(
          eq(projects.status, "Awarded"),
          sql`${projects.updatedAt} >= date_trunc('month', current_date)`
        ))
    ]);
    
    return {
      activeContractors: stats[0][0]?.count || 0,
      openProjects: stats[1][0]?.count || 0,
      totalBidsThisMonth: stats[2][0]?.count || 0,
      projectsAwardedThisMonth: stats[3][0]?.count || 0
    };
  }
  
  async getContractorDashboardStats(contractorId: string) {
    const stats = await Promise.all([
      // Contractor's submitted bids
      db.select({ count: sql<number>`count(*)` }).from(bids)
        .where(eq(bids.contractorId, contractorId)),
      
      // Contractor's accepted bids
      db.select({ count: sql<number>`count(*)` }).from(bids)
        .where(and(
          eq(bids.contractorId, contractorId),
          eq(bids.status, "Accepted")
        )),
      
      // Available projects matching contractor's trades
      this.getProjectsForContractor(contractorId),
      
      // Contractor's reviews
      this.getReviewsForContractor(contractorId)
    ]);
    
    return {
      totalBids: stats[0][0]?.count || 0,
      acceptedBids: stats[1][0]?.count || 0,
      availableProjects: stats[2].length || 0,
      totalReviews: stats[3].length || 0,
      averageRating: stats[3].length > 0 ? 
        stats[3].reduce((sum, review) => sum + parseInt(review.rating), 0) / stats[3].length : 0
    };
  }
  
  // === HELPER METHODS ===
  
  async getPopularTrades(): Promise<{ trade: string; count: number }[]> {
    const result = await db.select({
      trade: sql<string>`unnest(${contractors.trades})`,
      count: sql<number>`count(*)`
    })
    .from(contractors)
    .where(eq(contractors.isActive, "true"))
    .groupBy(sql`unnest(${contractors.trades})`)
    .orderBy(sql`count(*) DESC`)
    .limit(10);
    
    return result;
  }
  
  async getTopRatedContractors(limit: number = 10): Promise<Contractor[]> {
    return await db.select().from(contractors)
      .where(and(
        eq(contractors.isActive, "true"),
        sql`CAST(${contractors.rating} AS DECIMAL) >= 4.0`,
        sql`CAST(${contractors.totalJobs} AS INTEGER) >= 5`
      ))
      .orderBy(desc(contractors.rating), desc(contractors.totalJobs))
      .limit(limit);
  }
}

export const contractorMarketplaceService = new ContractorMarketplaceService();