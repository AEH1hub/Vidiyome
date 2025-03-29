import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import path from "path";

const app = express();

// Trust proxies in Replit environment
// This is needed for correct IP detection behind Replit's proxy
app.set('trust proxy', 1);

// Security middleware with development-friendly settings
const isDev = process.env.NODE_ENV !== 'production';

// Configure Helmet with Replit-friendly settings
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "wss://*.replit.dev", "https://*.replit.dev"],
        frameSrc: ["'self'", "https://*.replit.dev"],
        frameAncestors: ["'self'", "https://*.replit.dev", "https://replit.com"],
      }
    },
    // Allow embedding in Replit environment
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Disable strict transport security in development
    strictTransportSecurity: isDev ? false : undefined,
  })
); 

app.use(hpp()); // Protect against HTTP Parameter Pollution attacks

// Add CORS headers for development and Replit environments
app.use((req, res, next) => {
  // Check if we're in Replit environment or development
  const isReplitEnv = req.hostname.includes('.replit.dev') || 
                    req.hostname.includes('.replit.app') ||
                    req.hostname.includes('.repl.co');
  
  if (isDev || isReplitEnv) {
    // For development or Replit environments, use permissive CORS settings
    const origin = req.headers.origin;
    
    // Allow specific origins for Replit environment
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  }
  
  next();
});

// Rate limiting to prevent brute-force/DoS attacks - different settings for dev/prod
const apiLimiter = rateLimit({
  windowMs: isDev ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in prod
  max: isDev ? 1000 : 100, // Higher limit in development
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later",
  // Skip rate limiting for local development
  skip: (req, res) => isDev && (req.ip === '127.0.0.1' || req.ip === '::1')
});

// Apply rate limiting to API endpoints
app.use("/api", apiLimiter);

// Body parsers
app.use(express.json({ limit: "1mb" })); // Limit JSON body size
app.use(express.urlencoded({ extended: false, limit: "1mb" })); // Limit URL-encoded body size

// Serve static files from the public directory for generated assets
app.use('/generated', express.static(path.join(process.cwd(), 'public', 'generated')));

// Security headers for all responses
app.use((req, res, next) => {
  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Allow framing in Replit environment 
  // This is crucial for Replit's iframe-based preview to work properly
  const isReplitEnv = req.hostname.includes('.replit.dev') || 
                      req.hostname.includes('.replit.app') ||
                      req.hostname.includes('.repl.co');
  
  if (isReplitEnv || isDev) {
    // Allow embedding in Replit's domains
    res.removeHeader("X-Frame-Options"); // Remove potential headers from helmet
  } else {
    // In production, apply stricter security
    res.setHeader("X-Frame-Options", "DENY");
  }
  
  // Log requests
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Enhanced error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log the error for debugging
    console.error(`Error [${status}]: ${message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    
    // Only return safe error messages to client
    const clientMessage = status >= 500 
      ? "An unexpected error occurred. Please try again later." 
      : message;
    
    res.status(status).json({ 
      error: true,
      message: clientMessage,
      status
    });
    
    // Don't throw the error as it causes unhandled rejection
    // Only log it as we've already handled the response
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
