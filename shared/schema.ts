import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
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
