import {
  users,
  taxProfiles,
  contactMessages,
  payments,
  type User,
  type UpsertUser,
  type TaxProfile,
  type InsertTaxProfile,
  type ContactMessage,
  type InsertContactMessage,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tax profile operations
  getTaxProfile(userId: string): Promise<TaxProfile | undefined>;
  createTaxProfile(profile: InsertTaxProfile): Promise<TaxProfile>;
  updateTaxProfile(userId: string, profile: Partial<InsertTaxProfile>): Promise<TaxProfile>;
  
  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(userId: string): Promise<ContactMessage[]>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(userId: string): Promise<Payment[]>;
  updatePaymentStatus(paymentId: string, status: string): Promise<Payment>;
  
  // Admin operations
  getAllTaxProfiles(): Promise<any[]>;
  getAllPayments(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tax profile operations
  async getTaxProfile(userId: string): Promise<TaxProfile | undefined> {
    const [profile] = await db
      .select()
      .from(taxProfiles)
      .where(eq(taxProfiles.userId, userId));
    return profile;
  }

  async createTaxProfile(profile: InsertTaxProfile): Promise<TaxProfile> {
    const [newProfile] = await db
      .insert(taxProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateTaxProfile(userId: string, profile: Partial<InsertTaxProfile>): Promise<TaxProfile> {
    const [updatedProfile] = await db
      .update(taxProfiles)
      .set(profile)
      .where(eq(taxProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Contact message operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getContactMessages(userId: string): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.userId, userId))
      .orderBy(contactMessages.createdAt);
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(payments.createdAt);
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, paymentId))
      .returning();
    return updatedPayment;
  }

  // Admin operations
  async getAllTaxProfiles(): Promise<any[]> {
    const results = await db
      .select()
      .from(taxProfiles)
      .leftJoin(users, eq(taxProfiles.userId, users.id));
    
    return results.map(result => ({
      ...result.tax_profiles,
      user: result.users
    }));
  }

  async getAllPayments(): Promise<any[]> {
    const results = await db
      .select()
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(taxProfiles, eq(payments.taxProfileId, taxProfiles.id));
    
    return results.map(result => ({
      ...result.payments,
      user: result.users,
      taxProfile: result.tax_profiles
    }));
  }
}

export const storage = new DatabaseStorage();
