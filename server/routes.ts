import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAgentSchema, insertWorkflowRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // API Endpoints
  
  // Get all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // Get featured agents
  app.get("/api/agents/featured", async (req, res) => {
    try {
      const featuredAgents = await storage.getFeaturedAgents();
      res.json(featuredAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured agents" });
    }
  });

  // Get user's subscribed agents
  app.get("/api/user/agents", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userAgents = await storage.getUserAgents(req.user.id);
      res.json(userAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user agents" });
    }
  });

  // Subscribe to an agent
  app.post("/api/agents/:id/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const agentId = parseInt(req.params.id);
    if (isNaN(agentId)) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }
    
    try {
      // Check if agent exists
      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Check if user is already subscribed
      const existingSubscription = await storage.getSubscription(req.user.id, agentId);
      if (existingSubscription) {
        return res.status(400).json({ message: "Already subscribed to this agent" });
      }
      
      // Create subscription
      const subscription = await storage.createSubscription({
        userId: req.user.id,
        agentId: agentId,
        status: "active",
        startDate: new Date(),
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to subscribe to agent" });
    }
  });

  // Create workflow request
  app.post("/api/workflow-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validatedData = insertWorkflowRequestSchema.parse({
        ...req.body,
        userId: req.user.id,
        status: "pending"
      });
      
      const workflowRequest = await storage.createWorkflowRequest(validatedData);
      res.status(201).json(workflowRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workflow request" });
    }
  });

  // Get user workflow requests
  app.get("/api/user/workflow-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const workflowRequests = await storage.getUserWorkflowRequests(req.user.id);
      res.json(workflowRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow requests" });
    }
  });

  // Admin routes
  
  // Admin: Create agent
  app.post("/api/admin/agents", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const validatedData = insertAgentSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  // Admin: Get all workflow requests
  app.get("/api/admin/workflow-requests", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const workflowRequests = await storage.getAllWorkflowRequests();
      res.json(workflowRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow requests" });
    }
  });

  // Admin: Update workflow request status
  app.patch("/api/admin/workflow-requests/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }
    
    const { status } = req.body;
    if (!status || !["pending", "approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    try {
      const updatedRequest = await storage.updateWorkflowRequestStatus(requestId, status);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Workflow request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workflow request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
