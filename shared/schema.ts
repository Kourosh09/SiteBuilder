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
