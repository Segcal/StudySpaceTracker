import {
  users,
  taxProfiles,
  contactMessages,
  type User,
  type UpsertUser,
  type TaxProfile,
  type InsertTaxProfile,
  type ContactMessage,
  type InsertContactMessage,
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
}

export const storage = new DatabaseStorage();
