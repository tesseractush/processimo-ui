import { 
  users, User, InsertUser, 
  agents, Agent, InsertAgent, 
  agentTeams, AgentTeam, InsertAgentTeam,
  teamSubscriptions, TeamSubscription, InsertTeamSubscription,
  subscriptions, Subscription, InsertSubscription, 
  workflowRequests, WorkflowRequest, InsertWorkflowRequest 
} from "@shared/schema";
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
  getTeamAgents(teamId: number): Promise<Agent[]>;

  // Agent Team methods
  getAllAgentTeams(): Promise<AgentTeam[]>;
  getFeaturedAgentTeams(): Promise<AgentTeam[]>;
  getAgentTeamById(id: number): Promise<AgentTeam | undefined>;
  createAgentTeam(team: InsertAgentTeam): Promise<AgentTeam>;
  updateAgentTeam(id: number, team: Partial<AgentTeam>): Promise<AgentTeam | undefined>;
  deleteAgentTeam(id: number): Promise<boolean>;
  getUserAgentTeams(userId: number): Promise<AgentTeam[]>;

  // Subscription methods
  getSubscription(userId: number, agentId: number): Promise<Subscription | undefined>;
  getSubscriptionById(id: number): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  cancelSubscription(id: number): Promise<Subscription | undefined>;
  updateSubscriptionStatus(id: number, status: string): Promise<Subscription | undefined>;
  updateSubscriptionStripeInfo(id: number, stripeInfo: { stripeSubscriptionId?: string, stripePaymentIntentId?: string, stripePriceId?: string }): Promise<Subscription | undefined>;

  // Team Subscription methods
  getTeamSubscription(userId: number, teamId: number): Promise<TeamSubscription | undefined>;
  getTeamSubscriptionById(id: number): Promise<TeamSubscription | undefined>;
  getUserTeamSubscriptions(userId: number): Promise<TeamSubscription[]>;
  createTeamSubscription(subscription: InsertTeamSubscription): Promise<TeamSubscription>;
  cancelTeamSubscription(id: number): Promise<TeamSubscription | undefined>;
  updateTeamSubscriptionStatus(id: number, status: string): Promise<TeamSubscription | undefined>;
  updateTeamSubscriptionStripeInfo(id: number, stripeInfo: { stripeSubscriptionId?: string, stripePaymentIntentId?: string, stripePriceId?: string }): Promise<TeamSubscription | undefined>;

  // Workflow request methods
  createWorkflowRequest(request: InsertWorkflowRequest): Promise<WorkflowRequest>;
  getUserWorkflowRequests(userId: number): Promise<WorkflowRequest[]>;
  getAllWorkflowRequests(): Promise<WorkflowRequest[]>;
  updateWorkflowRequestStatus(id: number, status: string): Promise<WorkflowRequest | undefined>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private agents: Map<number, Agent> = new Map();
  private agentTeams: Map<number, AgentTeam> = new Map();
  private subscriptions: Map<number, Subscription> = new Map();
  private teamSubscriptions: Map<number, TeamSubscription> = new Map();
  private workflowRequests: Map<number, WorkflowRequest> = new Map();
  sessionStore: session.Store;
  private userId: number = 1;
  private agentId: number = 1;
  private teamId: number = 1;
  private subscriptionId: number = 1;
  private teamSubscriptionId: number = 1;
  private workflowRequestId: number = 1;

  constructor() {
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
      },
      // Additional agents from the request
      {
        name: "LexiDraft AI",
        description: "AI-powered contract generation & compliance review for lawyers and law firms.",
        price: 2999, // $29.99
        category: "Legal",
        features: "Contract generation, compliance review, legal document automation",
        iconClass: "bx-file-blank",
        iconBgClass: "bg-amber-100",
        gradientClass: "from-amber-500 to-orange-500",
        isNew: true
      },
      {
        name: "HiredEdge",
        description: "Auto-generates ATS-optimized resumes & applies to jobs with one click.",
        price: 1499, // $14.99
        category: "Career",
        features: "Resume optimization, job application automation, ATS keyword matching",
        iconClass: "bx-file-find",
        iconBgClass: "bg-cyan-100",
        gradientClass: "from-cyan-500 to-blue-500",
        isPopular: true
      },
      {
        name: "PropMatch AI",
        description: "AI-driven lead scoring, automated follow-ups, & real-time property matching.",
        price: 3499, // $34.99
        category: "Real Estate",
        features: "Lead generation, property matching, automated follow-ups",
        iconClass: "bx-building-house",
        iconBgClass: "bg-green-100",
        gradientClass: "from-green-500 to-emerald-500",
        isEnterprise: true
      },
      {
        name: "ShopGenie",
        description: "Auto-optimizes product titles, descriptions & pricing based on market trends.",
        price: 1999, // $19.99
        category: "E-commerce",
        features: "Product listing optimization, pricing strategy, description enhancement",
        iconClass: "bx-store",
        iconBgClass: "bg-violet-100",
        gradientClass: "from-violet-500 to-purple-500",
        isPopular: true
      }
    ];

    for (const agent of agentTypes) {
      this.createAgent({
        ...agent,
        createdBy: 1 // Admin user
      });
    }
    
    // Create sample Agent Teams
    const lexiSuiteWorkflow = {
      steps: [
        { 
          step: 1, 
          description: "User uploads or requests a contract",
          agent: "ContractBot"
        },
        { 
          step: 2, 
          description: "ReviewBot checks for missing clauses & compliance",
          agent: "ReviewBot" 
        },
        { 
          step: 3, 
          description: "CaseLawBot pulls case references for relevant sections",
          agent: "CaseLawBot"
        },
        { 
          step: 4, 
          description: "DueDiligenceBot flags risks involving any parties",
          agent: "DueDiligenceBot"
        }
      ]
    };
    
    // Create LexiSuite team - using a different approach to avoid Promise issues
    const lexiSuiteTeamId = this.teamId++;
    const now = new Date();
    const lexiSuiteTeam: AgentTeam = {
      id: lexiSuiteTeamId,
      name: "LexiSuite",
      description: "AI-powered legal document generation, compliance review, and due diligence",
      category: "Legal",
      price: 9999, // $99.99
      target: "Law Firms, Compliance Teams, Enterprises with Contract Management Needs",
      impact: "Saves 80% of time in contract drafting & legal research",
      workflow: lexiSuiteWorkflow,
      iconClass: "bx-gavel",
      gradientClass: "from-amber-500 to-red-500",
      isPopular: true,
      isFeatured: true,
      createdBy: 1,
      createdAt: now
    };
    this.agentTeams.set(lexiSuiteTeamId, lexiSuiteTeam);
    
    // Create team agents
    const lexiSuiteAgents = [
      {
        name: "ContractBot",
        description: "AI-powered legal document generation (NDA, Lease, Partnership, etc.).",
        price: 2999,
        category: "Legal",
        features: "Document templates, clause generation, customization options",
        iconClass: "bx-file-blank",
        iconBgClass: "bg-amber-100",
        gradientClass: "from-amber-500 to-red-500",
        teamId: lexiSuiteTeamId,
        teamRole: "Document Generation",
        createdBy: 1
      },
      {
        name: "ReviewBot",
        description: "Compliance & risk analysis of uploaded contracts.",
        price: 2499,
        category: "Legal",
        features: "Clause checking, compliance verification, risk detection",
        iconClass: "bx-search",
        iconBgClass: "bg-amber-100",
        gradientClass: "from-amber-600 to-red-600",
        teamId: lexiSuiteTeamId,
        teamRole: "Compliance Analysis",
        createdBy: 1
      },
      {
        name: "CaseLawBot",
        description: "RAG-powered case law research assistant (fetches relevant legal precedents).",
        price: 2999,
        category: "Legal",
        features: "Case law search, precedent analysis, legal research",
        iconClass: "bx-book",
        iconBgClass: "bg-amber-100",
        gradientClass: "from-amber-700 to-red-700",
        teamId: lexiSuiteTeamId,
        teamRole: "Legal Research",
        createdBy: 1
      },
      {
        name: "DueDiligenceBot",
        description: "Background verification & risk assessment for business deals.",
        price: 3499,
        category: "Legal",
        features: "Background checks, risk assessment, deal verification",
        iconClass: "bx-shield",
        iconBgClass: "bg-amber-100",
        gradientClass: "from-amber-800 to-red-800",
        teamId: lexiSuiteTeamId,
        teamRole: "Risk Assessment",
        createdBy: 1
      }
    ];
    
    for (const agent of lexiSuiteAgents) {
      this.createAgent(agent);
    }
    
    // Add other teams as needed - for simplicity I'm just adding one for now
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
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || "user",
      stripeCustomerId: null,
      stripeSubscriptionId: null
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
    const agent: Agent = { 
      ...insertAgent, 
      id, 
      createdAt: now,
      isPopular: insertAgent.isPopular || null,
      isNew: insertAgent.isNew || null,
      isEnterprise: insertAgent.isEnterprise || null,
      createdBy: insertAgent.createdBy || null,
      teamId: insertAgent.teamId || null,
      teamRole: insertAgent.teamRole || null
    };
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
  
  async getTeamAgents(teamId: number): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.teamId === teamId);
  }
  
  // Agent Team methods
  async getAllAgentTeams(): Promise<AgentTeam[]> {
    return Array.from(this.agentTeams.values());
  }

  async getFeaturedAgentTeams(): Promise<AgentTeam[]> {
    return Array.from(this.agentTeams.values()).filter(
      (team) => team.isPopular || team.isFeatured
    );
  }

  async getAgentTeamById(id: number): Promise<AgentTeam | undefined> {
    return this.agentTeams.get(id);
  }

  async createAgentTeam(insertTeam: InsertAgentTeam): Promise<AgentTeam> {
    const id = this.teamId++;
    const now = new Date();
    const team: AgentTeam = { 
      ...insertTeam, 
      id, 
      createdAt: now,
      isPopular: insertTeam.isPopular || false,
      isFeatured: insertTeam.isFeatured || false,
      createdBy: insertTeam.createdBy || null
    };
    this.agentTeams.set(id, team);
    return team;
  }

  async updateAgentTeam(id: number, teamUpdate: Partial<AgentTeam>): Promise<AgentTeam | undefined> {
    const team = await this.getAgentTeamById(id);
    if (!team) {
      return undefined;
    }
    
    const updatedTeam = { ...team, ...teamUpdate };
    this.agentTeams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteAgentTeam(id: number): Promise<boolean> {
    return this.agentTeams.delete(id);
  }

  async getUserAgentTeams(userId: number): Promise<AgentTeam[]> {
    // Get all team subscriptions for the user
    const userTeamSubscriptions = await this.getUserTeamSubscriptions(userId);
    
    // Get all teams that the user is subscribed to
    const userTeamIds = userTeamSubscriptions.map(sub => sub.teamId);
    return Array.from(this.agentTeams.values()).filter(team => userTeamIds.includes(team.id));
  }

  // Subscription methods
  async getSubscription(userId: number, agentId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.userId === userId && sub.agentId === agentId && sub.status === "active"
    );
  }
  
  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.userId === userId
    );
  }
  
  async updateSubscriptionStatus(id: number, status: string): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = { 
      ...subscription, 
      status
    };
    
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const now = new Date();
    const subscription: Subscription = { 
      ...insertSubscription, 
      id, 
      createdAt: now,
      stripeSubscriptionId: insertSubscription.stripeSubscriptionId || null,
      stripePaymentIntentId: insertSubscription.stripePaymentIntentId || null,
      stripePriceId: insertSubscription.stripePriceId || null,
      startDate: insertSubscription.startDate || now,
      endDate: insertSubscription.endDate || null
    };
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
  
  async updateSubscriptionStripeInfo(id: number, stripeInfo: { stripeSubscriptionId?: string, stripePaymentIntentId?: string, stripePriceId?: string }): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = {
      ...subscription,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId || subscription.stripeSubscriptionId,
      stripePaymentIntentId: stripeInfo.stripePaymentIntentId || subscription.stripePaymentIntentId,
      stripePriceId: stripeInfo.stripePriceId || subscription.stripePriceId
    };
    
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  // Team Subscription methods
  async getTeamSubscription(userId: number, teamId: number): Promise<TeamSubscription | undefined> {
    return Array.from(this.teamSubscriptions.values()).find(
      (sub) => sub.userId === userId && sub.teamId === teamId && sub.status === "active"
    );
  }
  
  async getTeamSubscriptionById(id: number): Promise<TeamSubscription | undefined> {
    return this.teamSubscriptions.get(id);
  }

  async getUserTeamSubscriptions(userId: number): Promise<TeamSubscription[]> {
    return Array.from(this.teamSubscriptions.values()).filter(
      (sub) => sub.userId === userId
    );
  }
  
  async updateTeamSubscriptionStatus(id: number, status: string): Promise<TeamSubscription | undefined> {
    const subscription = this.teamSubscriptions.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = { 
      ...subscription, 
      status
    };
    
    this.teamSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async createTeamSubscription(insertSubscription: InsertTeamSubscription): Promise<TeamSubscription> {
    const id = this.teamSubscriptionId++;
    const now = new Date();
    const subscription: TeamSubscription = { 
      ...insertSubscription, 
      id, 
      createdAt: now,
      stripeSubscriptionId: insertSubscription.stripeSubscriptionId || null,
      stripePaymentIntentId: insertSubscription.stripePaymentIntentId || null,
      stripePriceId: insertSubscription.stripePriceId || null,
      startDate: insertSubscription.startDate || now,
      endDate: insertSubscription.endDate || null
    };
    this.teamSubscriptions.set(id, subscription);
    return subscription;
  }

  async cancelTeamSubscription(id: number): Promise<TeamSubscription | undefined> {
    const subscription = this.teamSubscriptions.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = { 
      ...subscription, 
      status: "canceled",
      endDate: new Date()
    };
    
    this.teamSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async updateTeamSubscriptionStripeInfo(id: number, stripeInfo: { stripeSubscriptionId?: string, stripePaymentIntentId?: string, stripePriceId?: string }): Promise<TeamSubscription | undefined> {
    const subscription = this.teamSubscriptions.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = {
      ...subscription,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId || subscription.stripeSubscriptionId,
      stripePaymentIntentId: stripeInfo.stripePaymentIntentId || subscription.stripePaymentIntentId,
      stripePriceId: stripeInfo.stripePriceId || subscription.stripePriceId
    };
    
    this.teamSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Workflow request methods
  async createWorkflowRequest(insertRequest: InsertWorkflowRequest): Promise<WorkflowRequest> {
    const id = this.workflowRequestId++;
    const now = new Date();
    const request: WorkflowRequest = { 
      ...insertRequest, 
      id, 
      createdAt: now,
      integrations: insertRequest.integrations || null,
      teamId: insertRequest.teamId || null
    };
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
