import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  provider: text("provider"), // 'local', 'youtube', 'google', etc.
  providerId: text("provider_id"), // ID from the provider
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  subscriptionTier: text("subscription_tier").default("free"), // 'free', 'basic', 'premium'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  bio: true,
  profilePicture: true,
  provider: true,
  providerId: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiry: true,
  subscriptionTier: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  style: text("style").notNull(),
  duration: text("duration").notNull(),
  aspectRatio: text("aspect_ratio").notNull(),
  platforms: text("platforms").array(),
  status: text("status").notNull().default("draft"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertVideoSchema = createInsertSchema(videos)
  .omit({ id: true, createdAt: true })
  .extend({
    prompt: z.string().min(10, "Prompt must be at least 10 characters long"),
    platforms: z.array(z.enum(["youtube", "instagram", "tiktok"])).min(1, "Select at least one platform"),
  });

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull(),
  platform: text("platform").notNull(),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  updatedAt: true,
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id"),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Templates table
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  style: text("style").notNull(),
  duration: text("duration").notNull(),
  thumbUrl: text("thumb_url"),
  previewUrl: text("preview_url"),
  popular: boolean("popular").default(false),
  premium: boolean("premium").default(false),
  settings: json("settings"), // JSON settings for template configuration
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tier: text("tier").notNull(), // 'free', 'basic', 'premium'
  price: integer("price").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'canceled', 'expired'
  paymentMethod: text("payment_method"),
  paymentId: text("payment_id"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
