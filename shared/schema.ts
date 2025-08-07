import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  role: text("role").notNull(),
  source: text("source"),
  message: text("message"),
  newsletter: text("newsletter").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calculationResults = pgTable("calculation_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  landPrice: text("land_price").notNull(),
  lotSize: text("lot_size").notNull(),
  fsr: text("fsr").notNull(),
  constructionCost: text("construction_cost").notNull(),
  salePrice: text("sale_price").notNull(),
  softCosts: text("soft_costs").notNull(),
  buildableArea: text("buildable_area").notNull(),
  totalRevenue: text("total_revenue").notNull(),
  totalCosts: text("total_costs").notNull(),
  netProfit: text("net_profit").notNull(),
  roi: text("roi").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertCalculationSchema = createInsertSchema(calculationResults).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculationResults.$inferSelect;

// AI Analysis schemas
export interface PropertyAnalysisInput {
  address: string;
  city: string;
  currentValue?: number;
  lotSize: number;
  currentUse?: string;
  proposedUse?: string;
}

export interface PropertyAnalysisResult {
  propertyId: string;
  analysisDate: Date;
  financialSummary: {
    estimatedCosts: number;
    projectedRevenue: number;
    netProfit: number;
    roi: number;
    paybackPeriod: number;
  };
  marketAnalysis: {
    marketDemand: string;
    comparableSales: string;
    priceRecommendation: number;
    riskFactors: string[];
  };
  developmentFeasibility: {
    complexity: string;
    timelineMonths: number;
    majorObstacles: string[];
    regulatoryRequirements: string[];
  };
  recommendations: {
    goNoGo: string;
    optimizations: string[];
    alternatives: string[];
  };
  confidence: number;
}

// Permit Tracking and Milestone Management Tables
export const permits = pgTable("permits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  permitNumber: varchar("permit_number").notNull(),
  projectId: varchar("project_id"),
  permitType: varchar("permit_type").notNull(), // Building, Development, Demolition, etc.
  status: varchar("status").notNull().default("Applied"), // Applied, Under Review, Approved, Issued, Rejected
  applicationDate: timestamp("application_date").defaultNow(),
  approvalDate: timestamp("approval_date"),
  expiryDate: timestamp("expiry_date"),
  municipality: varchar("municipality").notNull(),
  address: varchar("address").notNull(),
  description: text("description"),
  applicantName: varchar("applicant_name"),
  estimatedValue: varchar("estimated_value"),
  fees: varchar("fees"),
  conditions: text("conditions").array(),
  documents: text("documents").array(),
  contactInfo: jsonb("contact_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  permitId: varchar("permit_id").references(() => permits.id, { onDelete: "cascade" }),
  projectId: varchar("project_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // Permit, Construction, Inspection, Completion
  status: varchar("status").notNull().default("Pending"), // Pending, In Progress, Completed, Delayed
  priority: varchar("priority").notNull().default("Medium"), // Low, Medium, High, Critical
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  assignedTo: varchar("assigned_to"),
  dependencies: text("dependencies").array(),
  notes: text("notes"),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inspections = pgTable("inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  permitId: varchar("permit_id").references(() => permits.id, { onDelete: "cascade" }),
  milestoneId: varchar("milestone_id").references(() => milestones.id),
  inspectionType: varchar("inspection_type").notNull(), // Foundation, Framing, Electrical, etc.
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  status: varchar("status").notNull().default("Scheduled"), // Scheduled, Passed, Failed, Rescheduled
  inspector: varchar("inspector"),
  notes: text("notes"),
  deficiencies: text("deficiencies").array(),
  nextInspection: varchar("next_inspection"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const permitsRelations = relations(permits, ({ many }) => ({
  milestones: many(milestones),
  inspections: many(inspections),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  permit: one(permits, {
    fields: [milestones.permitId],
    references: [permits.id],
  }),
  inspections: many(inspections),
}));

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  permit: one(permits, {
    fields: [inspections.permitId],
    references: [permits.id],
  }),
  milestone: one(milestones, {
    fields: [inspections.milestoneId],
    references: [milestones.id],
  }),
}));

// Insert schemas for permit tracking
export const insertPermitSchema = createInsertSchema(permits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for permit tracking
export type Permit = typeof permits.$inferSelect;
export type InsertPermit = z.infer<typeof insertPermitSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;

// Trade Contractor Marketplace Tables
export const contractors = pgTable("contractors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name").notNull(),
  contactName: varchar("contact_name").notNull(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone").notNull(),
  address: varchar("address"),
  city: varchar("city").notNull(),
  province: varchar("province").notNull().default("BC"),
  postalCode: varchar("postal_code"),
  website: varchar("website"),
  businessLicense: varchar("business_license"),
  worksafeNumber: varchar("worksafe_number"),
  insuranceProvider: varchar("insurance_provider"),
  trades: text("trades").array().notNull(), // ['framing', 'plumbing', 'electrical', etc.]
  serviceAreas: text("service_areas").array().notNull(), // Geographic areas they serve
  yearsExperience: varchar("years_experience").notNull(),
  specializations: text("specializations").array(), // Specific specializations within their trades
  certifications: text("certifications").array(), // Professional certifications
  portfolioImages: text("portfolio_images").array(), // URLs to portfolio images
  description: text("description"),
  rating: varchar("rating").default("0"), // Average rating out of 5
  totalJobs: varchar("total_jobs").default("0"), // Total completed jobs
  isActive: varchar("is_active").default("true"), // Account status
  isVerified: varchar("is_verified").default("false"), // Verification status
  preferredProjectSize: varchar("preferred_project_size"), // Small, Medium, Large, Enterprise
  availabilityStatus: varchar("availability_status").default("Available"), // Available, Busy, Booked
  hourlyRate: varchar("hourly_rate"), // Optional hourly rate
  projectRate: varchar("project_rate"), // Optional project-based rate
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  location: varchar("location").notNull(),
  city: varchar("city").notNull(),
  projectType: varchar("project_type").notNull(), // Residential, Commercial, Industrial, etc.
  tradeNeeded: varchar("trade_needed").notNull(), // Primary trade for this project
  additionalTrades: text("additional_trades").array(), // Other trades that might be needed
  projectSize: varchar("project_size").notNull(), // Small, Medium, Large
  estimatedBudget: varchar("estimated_budget"),
  timeline: varchar("timeline"), // Expected duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status").default("Open"), // Open, In Progress, Awarded, Completed, Cancelled
  requirements: text("requirements").array(), // Specific requirements
  attachments: text("attachments").array(), // Project documents/images
  clientName: varchar("client_name").notNull(),
  clientEmail: varchar("client_email").notNull(),
  clientPhone: varchar("client_phone"),
  isUrgent: varchar("is_urgent").default("false"),
  permitRequired: varchar("permit_required").default("false"),
  permitId: varchar("permit_id").references(() => permits.id), // Link to permit if applicable
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  contractorId: varchar("contractor_id").references(() => contractors.id, { onDelete: "cascade" }).notNull(),
  bidAmount: varchar("bid_amount").notNull(),
  timeline: varchar("timeline").notNull(), // How long they need for the project
  proposalText: text("proposal_text").notNull(),
  includedServices: text("included_services").array(), // What's included in the bid
  additionalNotes: text("additional_notes"),
  attachments: text("attachments").array(), // Bid documents
  status: varchar("status").default("Submitted"), // Submitted, Under Review, Accepted, Rejected, Withdrawn
  submittedAt: timestamp("submitted_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  validUntil: timestamp("valid_until"), // Bid expiration date
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractorReviews = pgTable("contractor_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractorId: varchar("contractor_id").references(() => contractors.id, { onDelete: "cascade" }).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  reviewerName: varchar("reviewer_name").notNull(),
  reviewerEmail: varchar("reviewer_email"),
  rating: varchar("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),
  qualityRating: varchar("quality_rating"), // 1-5 for work quality
  timelinessRating: varchar("timeliness_rating"), // 1-5 for meeting deadlines
  communicationRating: varchar("communication_rating"), // 1-5 for communication
  wouldRecommend: varchar("would_recommend").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for contractor marketplace
export const contractorsRelations = relations(contractors, ({ many }) => ({
  bids: many(bids),
  reviews: many(contractorReviews),
}));

export const projectsRelations = relations(projects, ({ many, one }) => ({
  bids: many(bids),
  reviews: many(contractorReviews),
  permit: one(permits, {
    fields: [projects.permitId],
    references: [permits.id],
  }),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  project: one(projects, {
    fields: [bids.projectId],
    references: [projects.id],
  }),
  contractor: one(contractors, {
    fields: [bids.contractorId],
    references: [contractors.id],
  }),
}));

export const contractorReviewsRelations = relations(contractorReviews, ({ one }) => ({
  contractor: one(contractors, {
    fields: [contractorReviews.contractorId],
    references: [contractors.id],
  }),
  project: one(projects, {
    fields: [contractorReviews.projectId],
    references: [projects.id],
  }),
}));

// Insert schemas for contractor marketplace
export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
});

export const insertContractorReviewSchema = createInsertSchema(contractorReviews).omit({
  id: true,
  createdAt: true,
});

// Types for contractor marketplace
export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type ContractorReview = typeof contractorReviews.$inferSelect;
export type InsertContractorReview = z.infer<typeof insertContractorReviewSchema>;
