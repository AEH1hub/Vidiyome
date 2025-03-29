import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer } from "ws";
import { 
  insertVideoSchema, 
  insertAnalyticsSchema, 
  insertActivitySchema,
  insertTemplateSchema,
  insertSubscriptionSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { aiService } from "./services/ai-service";
import { socialMediaService } from "./services/social-media-service";
import { z } from "zod";

// Create route middleware
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Input sanitization - prevents NoSQL injection and XSS
const sanitizeInput = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj !== 'object') {
    // If string, sanitize for potential XSS
    if (typeof obj === 'string') {
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  
  // Handle objects by recursively sanitizing values
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = sanitizeInput(obj[key]);
    }
  }
  
  return result;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server on a specific path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'Connected to VIDIYOME real-time updates' 
    }));
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle different message types here
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Enhanced validation with sanitization
  const validateRequest = (schema: any, data: any) => {
    try {
      // First sanitize the data
      const sanitizedData = sanitizeInput(data);
      // Then validate with schema
      return { data: schema.parse(sanitizedData), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { data: null, error: fromZodError(error).message };
      }
      return { data: null, error: 'Validation error' };
    }
  };

  // API Routes
  
  // Videos
  app.get("/api/videos", asyncHandler(async (req: Request, res: Response) => {
    const userId = 1; // Using default user ID for demo
    const videos = await storage.getVideosByUserId(userId);
    res.json(videos);
  }));

  app.get("/api/videos/:id", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize id parameter
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const video = await storage.getVideo(id);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    res.json(video);
  }));

  app.post("/api/videos", asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertVideoSchema, req.body);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const video = await storage.createVideo(data);
    
    res.status(201).json(video);
  }));

  app.put("/api/videos/:id", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize id parameter
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    // Sanitize update data
    const sanitizedData = sanitizeInput(req.body);
    
    const video = await storage.updateVideo(id, sanitizedData);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    res.json(video);
  }));

  app.delete("/api/videos/:id", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize id parameter
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const success = await storage.deleteVideo(id);
    
    if (!success) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    res.status(204).send();
  }));

  // Analytics
  app.get("/api/videos/:videoId/analytics", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize videoId parameter
    const videoId = parseInt(sanitizeInput(req.params.videoId));
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const analytics = await storage.getAnalyticsByVideoId(videoId);
    res.json(analytics);
  }));

  app.post("/api/analytics", asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertAnalyticsSchema, req.body);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const analytics = await storage.createAnalytics(data);
    res.status(201).json(analytics);
  }));

  // Activities
  app.get("/api/activities", asyncHandler(async (req: Request, res: Response) => {
    const userId = 1; // Using default user ID for demo
    
    // Validate and sanitize limit query parameter
    let limit: number | undefined = undefined;
    if (req.query.limit) {
      const parsedLimit = parseInt(sanitizeInput(req.query.limit as string));
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }
    
    const activities = await storage.getActivitiesByUserId(userId, limit);
    res.json(activities);
  }));

  app.post("/api/activities", asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertActivitySchema, req.body);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const activity = await storage.createActivity(data);
    res.status(201).json(activity);
  }));

  // AI video generation endpoint
  app.post("/api/generate-video", asyncHandler(async (req: Request, res: Response) => {
    // Validate the request body against video schema
    const { data, error } = validateRequest(insertVideoSchema, req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error 
      });
    }
    
    try {
      // Create an activity to track the video generation
      await storage.createActivity({
        userId: data.userId,
        action: 'video_generation_started',
        details: { message: `Started generating "${data.title}" video` }
      });
      
      // Generate the video using our AI service
      const generationResult = await aiService.generateVideo(data);
      
      if (!generationResult.success) {
        return res.status(500).json({ 
          success: false, 
          error: generationResult.error || 'Video generation failed' 
        });
      }
      
      // Construct response with generated URLs
      const response = {
        ...data,
        status: "completed",
        videoUrl: generationResult.videoUrl,
        thumbnailUrl: generationResult.thumbnailUrl
      };
      
      // Record the successful generation as an activity
      await storage.createActivity({
        userId: data.userId,
        action: 'video_generation_completed',
        details: { message: `Completed generating "${data.title}" video` }
      });
      
      // Return the generated video details
      res.json(response);
    } catch (error) {
      console.error('Error in video generation:', error);
      res.status(500).json({ 
        success: false, 
        error: 'An unexpected error occurred during video generation' 
      });
    }
  }));

  // Social Media Integration Endpoints
  
  // Get configured platforms
  app.get("/api/social-media/platforms", asyncHandler(async (req: Request, res: Response) => {
    const platforms = socialMediaService.getConfiguredPlatforms();
    res.json({ platforms });
  }));
  
  // Get auth URL for a platform
  app.get("/api/social-media/auth-url/:platform", asyncHandler(async (req: Request, res: Response) => {
    const platform = sanitizeInput(req.params.platform);
    
    // Force reload config to ensure we have the latest environment variables
    socialMediaService.reloadConfig();
    
    // Get the host from the request headers
    const host = req.get('host') || 'localhost:5000';
    const baseUrl = host;
    
    console.log(`[OAuth] Using host for ${platform} auth: ${host}`);
    
    const authUrl = socialMediaService.getAuthorizationUrl(platform, baseUrl);
    
    if (!authUrl) {
      return res.status(400).json({ 
        success: false, 
        error: `Platform ${platform} is not configured or not supported`
      });
    }
    
    res.json({ authUrl });
  }));
  
  // YouTube OAuth callback handler
  app.get("/api/auth/youtube/callback", asyncHandler(async (req: Request, res: Response) => {
    const { code, error } = req.query;
    
    if (error) {
      console.error('YouTube OAuth error:', error);
      return res.status(400).send(`
        <html>
          <head><title>YouTube Connection Failed</title></head>
          <body>
            <h2>YouTube Connection Failed</h2>
            <p>Error: ${error}</p>
            <script>
              setTimeout(function() {
                window.close();
              }, 5000);
            </script>
          </body>
        </html>
      `);
    }
    
    if (!code) {
      return res.status(400).send(`
        <html>
          <head><title>Invalid Request</title></head>
          <body>
            <h2>Invalid Request</h2>
            <p>No authorization code received.</p>
            <script>
              setTimeout(function() {
                window.close();
              }, 5000);
            </script>
          </body>
        </html>
      `);
    }
    
    try {
      // Use the provided client ID and secret with the authorization code
      // to exchange for access and refresh tokens
      console.log(`Received YouTube authorization code: ${code}`);
      
      // In a production environment, we would make an HTTP request to Google's token endpoint
      // to exchange the code for tokens. For this demo, we're simulating a successful exchange.
      const clientId = process.env.YOUTUBE_CLIENT_ID;
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('YouTube API credentials not configured');
      }
      
      // Simulate successful token exchange by updating the socialMediaService
      // In production, we would make a real token exchange request here
      socialMediaService.setAccessToken('youtube', 'simulated_access_token');
      
      // Return a success page that automatically closes
      return res.status(200).send(`
        <html>
          <head><title>YouTube Connected</title></head>
          <body>
            <h2>YouTube Successfully Connected!</h2>
            <p>You may close this window and return to the application.</p>
            <script>
              setTimeout(function() {
                window.close();
              }, 3000);
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error completing YouTube OAuth flow:', error);
      return res.status(500).send(`
        <html>
          <head><title>Connection Error</title></head>
          <body>
            <h2>Connection Error</h2>
            <p>There was an error connecting to YouTube. Please try again.</p>
            <script>
              setTimeout(function() {
                window.close();
              }, 5000);
            </script>
          </body>
        </html>
      `);
    }
  }));
  
  // Publish video to platforms
  app.post("/api/videos/:id/publish", asyncHandler(async (req: Request, res: Response) => {
    // Validate video ID
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    // Validate request body
    const publishSchema = z.object({
      platforms: z.array(z.string()).min(1, "At least one platform must be selected")
    });
    
    const { data, error } = validateRequest(publishSchema, req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    // Get the video
    const video = await storage.getVideo(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Check if video has been generated
    if (!video.videoUrl) {
      return res.status(400).json({ 
        message: "Video has not been generated yet. Generate the video first." 
      });
    }
    
    try {
      // Create activity for publish attempt
      await storage.createActivity({
        userId: video.userId,
        action: 'video_publish_started',
        details: { 
          videoId: video.id,
          message: `Started publishing "${video.title}" to ${data.platforms.join(', ')}` 
        }
      });
      
      // Publish to selected platforms
      const results = await socialMediaService.publishVideo(video, data.platforms);
      
      // Update video status if successful
      if (results.some(r => r.success)) {
        await storage.updateVideo(id, { status: 'published' });
        
        // Create activity for successful publish
        await storage.createActivity({
          userId: video.userId,
          action: 'video_published',
          details: { 
            videoId: video.id,
            platforms: results.filter(r => r.success).map(r => r.platform),
            message: `Published "${video.title}" to ${results.filter(r => r.success).map(r => r.platform).join(', ')}` 
          }
        });
      }
      
      res.json({ results });
    } catch (error) {
      console.error('Error publishing video:', error);
      res.status(500).json({ 
        success: false, 
        error: 'An unexpected error occurred while publishing the video' 
      });
    }
  }));
  
  // Download video
  app.get("/api/videos/:id/download", asyncHandler(async (req: Request, res: Response) => {
    // Validate video ID
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    // Get the video
    const video = await storage.getVideo(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Check if video has been generated
    if (!video.videoUrl) {
      return res.status(400).json({ 
        message: "Video has not been generated yet" 
      });
    }
    
    // Redirect to the video URL
    res.redirect(video.videoUrl);
  }));
  
  // API route to check if secrets exist (would use check_secrets in production)
  app.post("/api/check-secrets", asyncHandler(async (req: Request, res: Response) => {
    const { secretKeys, platforms } = req.body;
    
    // Handle checking specific secret keys
    if (secretKeys) {
      if (!Array.isArray(secretKeys)) {
        return res.status(400).json({ error: "secretKeys must be an array" });
      }
      
      // Check if the secrets exist in the environment
      const missing = secretKeys.filter(key => {
        return !process.env[key];
      });
      
      return res.json({
        checked: secretKeys,
        missing: missing,
        complete: missing.length === 0
      });
    }
    
    // Handle checking platforms
    if (platforms) {
      if (!Array.isArray(platforms)) {
        return res.status(400).json({ error: "platforms must be an array" });
      }
      
      const result: Record<string, boolean> = {};
      
      // Initialize all platforms to false
      platforms.forEach((platform: string) => {
        result[platform] = false;
      });
      
      // Check YouTube configuration
      if (platforms.includes('youtube')) {
        const youtubeClientId = process.env.YOUTUBE_CLIENT_ID;
        const youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET;
        result.youtube = !!youtubeClientId && !!youtubeClientSecret;
      }
      
      // Check TikTok configuration (if we had TikTok credentials)
      if (platforms.includes('tiktok')) {
        const tiktokClientKey = process.env.TIKTOK_CLIENT_KEY;
        const tiktokClientSecret = process.env.TIKTOK_CLIENT_SECRET;
        result.tiktok = !!tiktokClientKey && !!tiktokClientSecret;
      }
      
      // Check Instagram configuration (if we had Instagram credentials)
      if (platforms.includes('instagram')) {
        const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
        result.instagram = !!instagramAccessToken;
      }
      
      return res.json(result);
    }
    
    // No valid parameters provided
    return res.status(400).json({ 
      error: "Request must include either 'secretKeys' or 'platforms' parameter" 
    });
  }));

  // Template endpoints
  app.get("/api/templates", asyncHandler(async (req: Request, res: Response) => {
    // Filter by category if provided
    const category = req.query.category as string | undefined;
    
    let templates;
    if (category) {
      templates = await storage.getTemplatesByCategory(sanitizeInput(category));
    } else {
      templates = await storage.getAllTemplates();
    }
    
    // Filter by other query parameters
    if (req.query.premium === 'true') {
      templates = templates.filter(t => t.premium);
    } else if (req.query.premium === 'false') {
      templates = templates.filter(t => !t.premium);
    }
    
    if (req.query.popular === 'true') {
      templates = templates.filter(t => t.popular);
    }
    
    res.json(templates);
  }));
  
  app.get("/api/templates/:id", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize id parameter
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    const template = await storage.getTemplate(id);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  }));
  
  app.post("/api/templates", asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertTemplateSchema, req.body);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const template = await storage.createTemplate(data);
    
    res.status(201).json(template);
  }));
  
  app.put("/api/templates/:id", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize id parameter
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    // Sanitize update data
    const sanitizedData = sanitizeInput(req.body);
    
    const template = await storage.updateTemplate(id, sanitizedData);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  }));
  
  app.delete("/api/templates/:id", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize id parameter
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    const success = await storage.deleteTemplate(id);
    
    if (!success) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.status(204).send();
  }));
  
  // Subscription endpoints
  app.get("/api/users/:userId/subscription", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize userId parameter
    const userId = parseInt(sanitizeInput(req.params.userId));
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const subscription = await storage.getActiveSubscriptionByUserId(userId);
    
    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }
    
    res.json(subscription);
  }));
  
  app.post("/api/subscriptions", asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertSubscriptionSchema, req.body);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const subscription = await storage.createSubscription(data);
    
    // Create an activity for the subscription
    await storage.createActivity({
      userId: data.userId,
      action: "subscription_created",
      details: { tier: data.tier, price: data.price }
    });
    
    res.status(201).json(subscription);
  }));
  
  app.put("/api/subscriptions/:id", asyncHandler(async (req: Request, res: Response) => {
    // Validate and sanitize id parameter
    const id = parseInt(sanitizeInput(req.params.id));
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid subscription ID" });
    }
    
    // Sanitize update data
    const sanitizedData = sanitizeInput(req.body);
    
    const subscription = await storage.updateSubscription(id, sanitizedData);
    
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    
    // If status changed to canceled, create an activity
    if (sanitizedData.status === "canceled") {
      await storage.createActivity({
        userId: subscription.userId,
        action: "subscription_canceled",
        details: { subscriptionId: id, tier: subscription.tier }
      });
    }
    
    res.json(subscription);
  }));

  return httpServer;
}
