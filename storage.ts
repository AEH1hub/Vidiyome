import { 
  users, type User, type InsertUser, 
  videos, type Video, type InsertVideo,
  analytics, type Analytics, type InsertAnalytics,
  activities, type Activity, type InsertActivity,
  templates, type Template, type InsertTemplate,
  subscriptions, type Subscription, type InsertSubscription
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByProviderId(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Video operations
  getVideo(id: number): Promise<Video | undefined>;
  getVideosByUserId(userId: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Analytics operations
  getAnalyticsByVideoId(videoId: number): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  updateAnalytics(id: number, analytics: Partial<InsertAnalytics>): Promise<Analytics | undefined>;
  
  // Activity operations
  getActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;
  
  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionsByUserId(userId: number): Promise<Subscription[]>;
  getActiveSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private analytics: Map<number, Analytics>;
  private activities: Map<number, Activity>;
  private templates: Map<number, Template>;
  private subscriptions: Map<number, Subscription>;
  
  private userIdCounter: number;
  private videoIdCounter: number;
  private analyticsIdCounter: number;
  private activityIdCounter: number;
  private templateIdCounter: number;
  private subscriptionIdCounter: number;
  
  public sessionStore: session.Store;

  constructor() {
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired sessions every day
    });
    this.users = new Map();
    this.videos = new Map();
    this.analytics = new Map();
    this.activities = new Map();
    this.templates = new Map();
    this.subscriptions = new Map();
    
    this.userIdCounter = 1;
    this.videoIdCounter = 1;
    this.analyticsIdCounter = 1;
    this.activityIdCounter = 1;
    this.templateIdCounter = 1;
    this.subscriptionIdCounter = 1;
    
    // Create a default user
    this.createUser({
      username: "demo",
      password: "password"
    }).then(user => {
      // Add some sample templates
      this.seedTemplates();
      
      // Create a free subscription for the user
      this.createSubscription({
        userId: user.id,
        tier: "free",
        price: 0,
        status: "active",
        startDate: new Date()
      });
    });
  }
  
  /**
   * Seed the database with some sample templates
   */
  private async seedTemplates() {
    // Free templates
    await this.createTemplate({
      title: "Product Demo",
      description: "Showcase your product features with a professional demo video",
      category: "Marketing",
      style: "professional",
      duration: "60s",
      thumbUrl: "/assets/templates/thumbnails/template-image.avif",
      previewUrl: "/assets/templates/previews/product-demo.mp4",
      popular: true,
      premium: false,
      settings: {
        sections: ["intro", "features", "benefits", "call-to-action"],
        transitions: ["fade", "slide"]
      }
    });
    
    await this.createTemplate({
      title: "Social Media Promo",
      description: "Short and engaging video for social media promotion",
      category: "Social Media",
      style: "vibrant",
      duration: "30s",
      thumbUrl: "/assets/templates/thumbnails/template-image.avif",
      previewUrl: "/assets/templates/previews/social-promo.mp4",
      popular: true,
      premium: false,
      settings: {
        sections: ["hook", "value-prop", "call-to-action"],
        transitions: ["fast-cut", "zoom"]
      }
    });
    
    await this.createTemplate({
      title: "Tutorial Guide",
      description: "Educational step-by-step guide with clear instructions",
      category: "Education",
      style: "minimal",
      duration: "120s",
      thumbUrl: "/assets/templates/thumbnails/template-image.avif",
      previewUrl: "/assets/templates/previews/tutorial.mp4",
      popular: false,
      premium: false,
      settings: {
        sections: ["intro", "steps", "summary"],
        transitions: ["simple-cut", "fade"]
      }
    });
    
    // Premium templates
    await this.createTemplate({
      title: "Cinematic Brand Story",
      description: "Premium cinematic template for powerful brand storytelling",
      category: "Marketing",
      style: "cinematic",
      duration: "90s",
      thumbUrl: "/assets/templates/thumbnails/template-image.avif",
      previewUrl: "/assets/templates/previews/cinematic-brand.mp4",
      popular: true,
      premium: true,
      settings: {
        sections: ["dramatic-intro", "story-arc", "emotional-climax", "brand-reveal"],
        transitions: ["film-dissolve", "parallax", "motion-blur"]
      }
    });
    
    await this.createTemplate({
      title: "E-commerce Product Showcase",
      description: "Premium template for showcasing products with advanced 3D animations",
      category: "E-commerce",
      style: "elegant",
      duration: "45s",
      thumbUrl: "/assets/templates/thumbnails/template-image.avif",
      previewUrl: "/assets/templates/previews/ecommerce-showcase.mp4",
      popular: true,
      premium: true,
      settings: {
        sections: ["product-reveal", "feature-highlights", "testimonial", "offer"],
        transitions: ["3d-rotate", "smooth-pan", "elegant-fade"]
      }
    });
    
    await this.createTemplate({
      title: "AR Experience Demo",
      description: "Showcase your AR app or experience with this premium template",
      category: "Technology",
      style: "futuristic",
      duration: "60s",
      thumbUrl: "/assets/templates/thumbnails/template-image.avif",
      previewUrl: "/assets/templates/previews/ar-demo.mp4",
      popular: false,
      premium: true,
      settings: {
        sections: ["tech-intro", "experience-showcase", "user-benefits", "download-prompt"],
        transitions: ["glitch", "digital-warp", "holographic"]
      }
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByProviderId(provider: string, providerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.provider === provider && user.providerId === providerId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      // Default values for nullable fields
      email: insertUser.email || null,
      displayName: insertUser.displayName || null,
      bio: insertUser.bio || null,
      profilePicture: insertUser.profilePicture || null,
      provider: insertUser.provider || null,
      providerId: insertUser.providerId || null,
      accessToken: insertUser.accessToken || null,
      refreshToken: insertUser.refreshToken || null,
      tokenExpiry: insertUser.tokenExpiry || null,
      subscriptionTier: insertUser.subscriptionTier || "free"
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Video operations
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideosByUserId(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const now = new Date();
    const video: Video = { 
      ...insertVideo, 
      id, 
      createdAt: now,
      // Ensure required fields are set with defaults if not provided
      status: insertVideo.status || "draft",
      thumbnailUrl: insertVideo.thumbnailUrl || null,
      videoUrl: insertVideo.videoUrl || null,
      platforms: insertVideo.platforms || []
    };
    this.videos.set(id, video);
    
    // Create an activity for this video creation
    await this.createActivity({
      videoId: id,
      userId: insertVideo.userId,
      action: "create_video",
      details: { title: insertVideo.title }
    });
    
    return video;
  }

  async updateVideo(id: number, updateData: Partial<InsertVideo>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo: Video = { ...video, ...updateData };
    this.videos.set(id, updatedVideo);
    
    // Create an activity for this video update
    await this.createActivity({
      videoId: id,
      userId: video.userId,
      action: "update_video",
      details: { title: video.title }
    });
    
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const video = this.videos.get(id);
    if (!video) return false;
    
    const deleted = this.videos.delete(id);
    
    if (deleted) {
      // Create an activity for this video deletion
      await this.createActivity({
        videoId: id,
        userId: video.userId,
        action: "delete_video",
        details: { title: video.title }
      });
    }
    
    return deleted;
  }

  // Analytics operations
  async getAnalyticsByVideoId(videoId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (analytics) => analytics.videoId === videoId
    );
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsIdCounter++;
    const now = new Date();
    const analytics: Analytics = { 
      ...insertAnalytics, 
      id, 
      updatedAt: now,
      // Ensure required fields are set with defaults
      views: insertAnalytics.views ?? 0,
      likes: insertAnalytics.likes ?? 0,
      comments: insertAnalytics.comments ?? 0,
      shares: insertAnalytics.shares ?? 0
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async updateAnalytics(id: number, updateData: Partial<InsertAnalytics>): Promise<Analytics | undefined> {
    const analytics = this.analytics.get(id);
    if (!analytics) return undefined;
    
    const now = new Date();
    const updatedAnalytics: Analytics = { 
      ...analytics, 
      ...updateData, 
      updatedAt: now 
    };
    this.analytics.set(id, updatedAnalytics);
    return updatedAnalytics;
  }

  // Activity operations
  async getActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: now,
      // Ensure required fields are set with defaults
      videoId: insertActivity.videoId || null,
      details: insertActivity.details || null
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Template operations
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }
  
  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }
  
  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.category === category
    );
  }
  
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.templateIdCounter++;
    const now = new Date();
    const template: Template = {
      ...insertTemplate,
      id,
      createdAt: now,
      thumbUrl: insertTemplate.thumbUrl || null,
      previewUrl: insertTemplate.previewUrl || null,
      popular: insertTemplate.popular || false,
      premium: insertTemplate.premium || false,
      settings: insertTemplate.settings || null
    };
    this.templates.set(id, template);
    return template;
  }
  
  async updateTemplate(id: number, updateData: Partial<InsertTemplate>): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate: Template = { ...template, ...updateData };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }
  
  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async getSubscriptionsByUserId(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (subscription) => subscription.userId === userId
    );
  }
  
  async getActiveSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const now = new Date();
    return Array.from(this.subscriptions.values()).find(
      (subscription) => 
        subscription.userId === userId && 
        subscription.status === "active" &&
        (!subscription.endDate || subscription.endDate > now)
    );
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const now = new Date();
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      createdAt: now,
      updatedAt: now,
      status: insertSubscription.status || 'active',
      startDate: insertSubscription.startDate || now,
      paymentMethod: insertSubscription.paymentMethod || null,
      paymentId: insertSubscription.paymentId || null,
      endDate: insertSubscription.endDate || null
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, updateData: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const now = new Date();
    const updatedSubscription: Subscription = { 
      ...subscription, 
      ...updateData,
      updatedAt: now
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
}

export const storage = new MemStorage();
