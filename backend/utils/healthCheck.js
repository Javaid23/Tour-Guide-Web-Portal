import express from 'express';

// Health check utility for the backend server
const healthCheck = {
  // Basic server info
  getServerInfo: () => ({
    server: 'Tour Guide API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }),

  // Database connection check (if using MongoDB)
  checkDatabase: async () => {
    try {
      // If using Mongoose
      if (global.mongoose?.connection?.readyState === 1) {
        return { status: 'connected', type: 'MongoDB' };
      }
      return { status: 'not_configured', type: 'none' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  },

  // Environment variables check
  checkEnvironment: () => {
    const requiredVars = ['PORT', 'JWT_SECRET'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    return {
      status: missing.length === 0 ? 'ok' : 'incomplete',
      missing: missing,
      configured: requiredVars.filter(varName => process.env[varName])
    };
  },

  // Full health check
  getFullStatus: async () => {
    const serverInfo = healthCheck.getServerInfo();
    const database = await healthCheck.checkDatabase();
    const environment = healthCheck.checkEnvironment();
    
    const overallStatus = 
      database.status === 'error' || environment.status === 'incomplete' 
        ? 'warning' 
        : 'healthy';
    
    return {
      status: overallStatus,
      timestamp: serverInfo.timestamp,
      server: serverInfo,
      database,
      environment
    };
  }
};

export default healthCheck;
