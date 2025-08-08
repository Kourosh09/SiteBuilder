import { type User, type InsertUser, type Lead, type InsertLead, type PropertyLead, type InsertPropertyLead, type Calculation, type InsertCalculation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  createPropertyLead(lead: InsertPropertyLead): Promise<PropertyLead>;
  getPropertyLeads(): Promise<PropertyLead[]>;
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculations(): Promise<Calculation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leads: Map<string, Lead>;
  private propertyLeads: Map<string, PropertyLead>;
  private calculations: Map<string, Calculation>;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.propertyLeads = new Map();
    this.calculations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead, 
      id, 
      createdAt: new Date() 
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async createPropertyLead(insertPropertyLead: InsertPropertyLead): Promise<PropertyLead> {
    const id = randomUUID();
    const propertyLead: PropertyLead = { 
      ...insertPropertyLead, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.propertyLeads.set(id, propertyLead);
    return propertyLead;
  }

  async getPropertyLeads(): Promise<PropertyLead[]> {
    return Array.from(this.propertyLeads.values());
  }

  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const id = randomUUID();
    const calculation: Calculation = { 
      ...insertCalculation, 
      id, 
      createdAt: new Date() 
    };
    this.calculations.set(id, calculation);
    return calculation;
  }

  async getCalculations(): Promise<Calculation[]> {
    return Array.from(this.calculations.values());
  }
}

export const storage = new MemStorage();
