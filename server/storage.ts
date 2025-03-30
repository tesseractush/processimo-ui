import { users, User, InsertUser, agents, Agent, InsertAgent, subscriptions, Subscription, InsertSubscription, workflowRequests, WorkflowRequest, InsertWorkflowRequest } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId?: string, stripeSubscriptionId?: string }): Promise<User>;

  // Agent methods
  getAllAgents(): Promise<Agent[]>;
  getFeaturedAgents(): Promise<Agent[]>;
  getAgentById(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;
  getUserAgents(userId: number): Promise<Agent[]>;

  // Subscription methods
  getSubscription(userId: number, agentId: number): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  cancelSubscription(id: number): Promise<Subscription | undefined>;

  // Workflow request methods
  createWorkflowRequest(request: InsertWorkflowRequest): Promise<WorkflowRequest>;
  getUserWorkflowRequests(userId: number): Promise<WorkflowRequest[]>;
  getAllWorkflowRequests(): Promise<WorkflowRequest[]>;
  updateWorkflowRequestStatus(id: number, status: string): Promise<WorkflowRequest | undefined>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agents: Map<number, Agent>;
  private subscriptions: Map<number, Subscription>;
  private workflowRequests: Map<number, WorkflowRequest>;
  sessionStore: session.Store;
  private userId: number = 1;
  private agentId: number = 1;
  private subscriptionId: number = 1;
  private workflowRequestId: number = 1;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.subscriptions = new Map();
    this.workflowRequests = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Initialize with seed data
    this.initSeedData();
  }

  private initSeedData() {
    // Create an admin user
    this.createUser({
      username: "admin",
      email: "admin@processimo.com",
      password: "admin_password_hash.salt", // This would be hashed in a real implementation
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });

    // Create sample AI agents
    const agentTypes = [
      {
        name: "Email Assistant",
        description: "Automate email management and responses.",
        price: 999, // $9.99
        category: "Communication",
        features: "Email classification, auto-replies, follow-up reminders",
        iconClass: "bx-envelope",
        iconBgClass: "bg-blue-100",
        gradientClass: "from-blue-500 to-blue-600",
        isPopular: true
      },
      {
        name: "Social Media Manager",
        description: "Automate content creation and scheduling across all your social media platforms.",
        price: 1299, // $12.99
        category: "Marketing",
        features: "Content creation, scheduling, analytics",
        iconClass: "bx-bot",
        iconBgClass: "bg-blue-100",
        gradientClass: "from-blue-500 to-purple-500",
        isPopular: true
      },
      {
        name: "Data Analyzer",
        description: "Process and analyze large datasets to extract valuable insights automatically.",
        price: 1999, // $19.99
        category: "Data",
        features: "Data processing, analysis, visualization",
        iconClass: "bx-data",
        iconBgClass: "bg-green-100",
        gradientClass: "from-green-500 to-teal-500",
        isNew: true
      },
      {
        name: "Customer Support",
        description: "AI-powered customer support that handles inquiries 24/7 with natural language.",
        price: 2499, // $24.99
        category: "Support",
        features: "Query handling, knowledge base integration, escalation",
        iconClass: "bx-message-square-dots",
        iconBgClass: "bg-purple-100",
        gradientClass: "from-purple-500 to-pink-500",
        isEnterprise: true
      }
    ];

    for (const agent of agentTypes) {
      this.createAgent({
        ...agent,
        createdBy: 1 // Admin user
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      stripeCustomerId: undefined,
      stripeSubscriptionId: undefined
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId?: string, stripeSubscriptionId?: string }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...user,
      stripeCustomerId: stripeInfo.stripeCustomerId || user.stripeCustomerId,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId || user.stripeSubscriptionId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Agent methods
  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getFeaturedAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.isPopular || agent.isNew || agent.isEnterprise
    );
  }

  async getAgentById(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.agentId++;
    const now = new Date();
    const agent: Agent = { ...insertAgent, id, createdAt: now };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: number, agentUpdate: Partial<Agent>): Promise<Agent | undefined> {
    const agent = await this.getAgentById(id);
    if (!agent) {
      return undefined;
    }
    
    const updatedAgent = { ...agent, ...agentUpdate };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: number): Promise<boolean> {
    return this.agents.delete(id);
  }

  async getUserAgents(userId: number): Promise<Agent[]> {
    // Get all subscriptions for the user
    const userSubscriptions = await this.getUserSubscriptions(userId);
    
    // Get all agents that the user is subscribed to
    const userAgentIds = userSubscriptions.map(sub => sub.agentId);
    return Array.from(this.agents.values()).filter(agent => userAgentIds.includes(agent.id));
  }

  // Subscription methods
  async getSubscription(userId: number, agentId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.userId === userId && sub.agentId === agentId && sub.status === "active"
    );
  }

  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.userId === userId
    );
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const now = new Date();
    const subscription: Subscription = { ...insertSubscription, id, createdAt: now };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async cancelSubscription(id: number): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = { 
      ...subscription, 
      status: "canceled",
      endDate: new Date()
    };
    
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Workflow request methods
  async createWorkflowRequest(insertRequest: InsertWorkflowRequest): Promise<WorkflowRequest> {
    const id = this.workflowRequestId++;
    const now = new Date();
    const request: WorkflowRequest = { ...insertRequest, id, createdAt: now };
    this.workflowRequests.set(id, request);
    return request;
  }

  async getUserWorkflowRequests(userId: number): Promise<WorkflowRequest[]> {
    return Array.from(this.workflowRequests.values()).filter(
      (req) => req.userId === userId
    );
  }

  async getAllWorkflowRequests(): Promise<WorkflowRequest[]> {
    return Array.from(this.workflowRequests.values());
  }

  async updateWorkflowRequestStatus(id: number, status: string): Promise<WorkflowRequest | undefined> {
    const request = this.workflowRequests.get(id);
    if (!request) {
      return undefined;
    }
    
    const updatedRequest = { ...request, status };
    this.workflowRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
