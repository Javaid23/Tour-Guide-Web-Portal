import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

// Check for essential environment variables
const requiredEnvVars = ['JWT_SECRET', 'SMTP_USER', 'SMTP_PASS', 'STRIPE_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please ensure you have a .env file in the /backend directory with all required values.');
  process.exit(1); // Exit the process with an error code
}

import compression from "compression"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import path from "path"
import { fileURLToPath } from "url"
import authRoutes from "./routes/auth.js"
import tourRoutes from "./routes/tours.js"
import destinationRoutes from "./routes/destinations.js"
import userRoutes from "./routes/users.js"
import reviewRoutes from "./routes/reviews.js"
import bookingRoutes from "./routes/bookings.js"
import adminRoutes from "./routes/admin.js"
import guideRoutes from "./routes/guides.js"
import paymentsRoutes from "./routes/payments.js"
import blogsRoutes from "./routes/blogs.js"

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)



const app = express()
const PORT = process.env.PORT || 5000

// Essential security middleware only
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Disable CSP for better performance in development
}))

// Optimized compression for better performance
app.use(compression({
  level: 1, // Faster compression
  threshold: 2048, // Only compress larger responses
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}))

// Simplified rate limiting for production only
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Increased for better user experience
    message: { error: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use('/api/', limiter)
}

// CORS configuration with environment-based origins
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow any origin in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      // Production origins
      const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "https://tour-guide-web-portal.vercel.app"
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  }),
)

// Body parsing middleware with optimized limits
app.use(express.json({ 
  limit: '5mb', // Reduced from 10mb for better performance
}))
app.use(express.urlencoded({ 
  extended: true, 
  limit: '5mb', // Reduced from 10mb
  parameterLimit: 50 // Reduced from 100
}))

// Serve static files efficiently with caching
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}))

// Serve guide uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}))

// Performance monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 500) { // Log requests over 500ms
        console.log(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
      }
    });
    next();
  });
}

// Routes with appropriate rate limiting
// Routes without redundant middleware
app.use("/api/auth", authRoutes)
app.use("/api/tours", tourRoutes)
app.use("/api/destinations", destinationRoutes)
app.use("/api/users", userRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/payments", paymentsRoutes)
app.use("/api/blogs", blogsRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/guide", guideRoutes)

// Enhanced health check route with system information
app.get("/api/health", (req, res) => {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };

  // Cache health check for 30 seconds
  res.set('Cache-Control', 'public, max-age=30');
  res.json(healthCheck);
})

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Tour Guide API",
    version: "1.0.0",
    description: "Backend API for Pakistan Tour Guide application",
    endpoints: {
      health: "/api/health",
      tours: "/api/tours",
      auth: "/api/auth",
      users: "/api/users", 
      reviews: "/api/reviews",
      bookings: "/api/bookings",
      admin: "/api/admin"
    },
    documentation: "Visit /api/docs for detailed API documentation"
  });
});

// Global error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: errors
    });
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID format'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field} already exists`
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Database connection and server startup
const connectDB = async () => {
  try {
  const mongoURI = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log("✅ Connected to MongoDB successfully!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection URI: ${mongoURI}`);
    
    // Set up database event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.warn("⚠️ Running without database - some features may be limited");
    return false;
  }
};

// Start server with proper error handling
const startServer = async () => {
  // Connect to database first
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.error("❌ Failed to connect to database. Exiting...");
    process.exit(1);
  }

  // Start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`🚀 Tour Guide Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.CLIENT_URL || process.env.FRONTEND_URL}`);
  console.log(`🔧 API Health: ${process.env.API_URL}/api/health`);
  console.log(`📋 API Tours: ${process.env.API_URL}/api/tours`);
  console.log(`📚 API Docs: ${process.env.API_URL}/api`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    server.close((err) => {
      if (err) {
        console.error('❌ Error during server shutdown:', err);
        process.exit(1);
      }
      
      console.log('✅ HTTP server closed');
      
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB connection closed');
        console.log('👋 Graceful shutdown completed');
        process.exit(0);
      });
    });
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle port conflicts
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use!`);
      console.log("\n🔧 To fix this issue:");
      console.log("1. Run: quick-port-fix.bat");
      console.log("2. Or run: cleanup-ports.bat");
      console.log("3. Then restart the server");
      process.exit(1);
    } else {
      console.error("❌ Server error:", error.message);
      process.exit(1);
    }
  });

  return server;
};

// Start the application
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

export default app
