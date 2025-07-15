import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaxProfileSchema, insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tax profile routes
  app.get('/api/tax-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getTaxProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Tax profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching tax profile:", error);
      res.status(500).json({ message: "Failed to fetch tax profile" });
    }
  });

  app.post('/api/tax-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Calculate tax amounts
      const income = req.body.income;
      const propertyValue = req.body.propertyValue;
      const incomeTaxDue = Math.floor(income * 0.17); // 17% tax rate
      const propertyTax = Math.floor(propertyValue * 0.012); // 1.2% property tax rate
      
      const profileData = insertTaxProfileSchema.parse({
        ...req.body,
        userId,
        incomeTaxDue,
        propertyTax,
        dueDate: new Date('2024-04-15'), // April 15th tax deadline
      });
      
      const profile = await storage.createTaxProfile(profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating tax profile:", error);
      res.status(500).json({ message: "Failed to create tax profile" });
    }
  });

  app.put('/api/tax-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Recalculate taxes if income or property value changed
      const updates: any = { ...req.body };
      if (req.body.income) {
        updates.incomeTaxDue = Math.floor(req.body.income * 0.17);
      }
      if (req.body.propertyValue) {
        updates.propertyTax = Math.floor(req.body.propertyValue * 0.012);
      }
      
      const profile = await storage.updateTaxProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating tax profile:", error);
      res.status(500).json({ message: "Failed to update tax profile" });
    }
  });

  // Contact message routes
  app.post('/api/contact', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertContactMessageSchema.parse({
        ...req.body,
        userId,
      });
      
      const message = await storage.createContactMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/contact-messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getContactMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
