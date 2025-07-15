import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaxProfileSchema, insertContactMessageSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

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

  // Payment routes
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, paymentType } = req.body;
      const userId = req.user.claims.sub;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId,
          paymentType,
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taxProfile = await storage.getTaxProfile(userId);
      
      if (!taxProfile) {
        return res.status(404).json({ message: "Tax profile not found" });
      }
      
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        userId,
        taxProfileId: taxProfile.id,
      });
      
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Admin routes
  app.get('/api/admin/tax-profiles', isAuthenticated, async (req: any, res) => {
    try {
      // In a real app, you'd check if user has admin role
      const profiles = await storage.getAllTaxProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching all tax profiles:", error);
      res.status(500).json({ message: "Failed to fetch tax profiles" });
    }
  });

  app.get('/api/admin/payments', isAuthenticated, async (req: any, res) => {
    try {
      // In a real app, you'd check if user has admin role
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching all payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Analytics endpoint
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taxProfile = await storage.getTaxProfile(userId);
      const payments = await storage.getPayments(userId);
      
      if (!taxProfile) {
        return res.status(404).json({ message: "Tax profile not found" });
      }
      
      const analytics = {
        totalTaxOwed: taxProfile.incomeTaxDue + taxProfile.propertyTax,
        totalPaid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        paymentHistory: payments.map(p => ({
          date: p.createdAt,
          amount: p.amount,
          type: p.paymentType,
          status: p.status
        })),
        monthlyUtilities: taxProfile.electricBill + taxProfile.gasBill,
        taxBreakdown: {
          incomeTax: taxProfile.incomeTaxDue,
          propertyTax: taxProfile.propertyTax,
          utilities: (taxProfile.electricBill + taxProfile.gasBill) * 12
        }
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
