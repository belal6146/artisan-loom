import { FastifyPluginAsync } from 'fastify';
import { getDatabase } from '../db/connection';

// Health check state
let isShuttingDown = false;
let isReady = true;

// Graceful shutdown handler
process.on('SIGTERM', () => {
  isShuttingDown = true;
  isReady = false;
  // Allow 30s for graceful shutdown
  setTimeout(() => process.exit(0), 30000);
});

process.on('SIGINT', () => {
  isShuttingDown = true;
  isReady = false;
  setTimeout(() => process.exit(0), 30000);
});

const plugin: FastifyPluginAsync = async (fastify) => {
  // Liveness probe - is the process alive?
  fastify.get('/healthz', async (request, reply) => {
    const start = performance.now();
    
    try {
      // Basic process health
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
        version: process.env.npm_package_version || 'unknown'
      };
      
      const duration = Math.round(performance.now() - start);
      reply.header('x-response-time', `${duration}ms`);
      
      return reply.code(200).send(health);
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      reply.header('x-response-time', `${duration}ms`);
      
      return reply.code(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Readiness probe - can the service handle requests?
  fastify.get('/readyz', async (request, reply) => {
    const start = performance.now();
    
    if (isShuttingDown) {
      const duration = Math.round(performance.now() - start);
      reply.header('x-response-time', `${duration}ms`);
      
      return reply.code(503).send({
        status: 'not_ready',
        reason: 'shutting_down',
        timestamp: new Date().toISOString()
      });
    }
    
    try {
      // Check database connectivity
      const dbHealthy = await getDatabase().then(() => true).catch(() => false);
      
      if (!dbHealthy) {
        const duration = Math.round(performance.now() - start);
        reply.header('x-response-time', `${duration}ms`);
        
        return reply.code(503).send({
          status: 'not_ready',
          reason: 'database_unavailable',
          timestamp: new Date().toISOString()
        });
      }
      
      const readiness = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'healthy',
          process: 'healthy',
          shutdown: false
        }
      };
      
      const duration = Math.round(performance.now() - start);
      reply.header('x-response-time', `${duration}ms`);
      
      return reply.code(200).send(readiness);
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      reply.header('x-response-time', `${duration}ms`);
      
      return reply.code(503).send({
        status: 'not_ready',
        reason: 'health_check_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Metrics endpoint for SLO monitoring
  fastify.get('/metrics', async (request, reply) => {
    const start = performance.now();
    
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        process: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        },
        health: {
          isReady,
          isShuttingDown
        }
      };
      
      const duration = Math.round(performance.now() - start);
      reply.header('x-response-time', `${duration}ms`);
      
      return reply.code(200).send(metrics);
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      reply.header('x-response-time', `${duration}ms`);
      
      return reply.code(500).send({
        error: 'Failed to collect metrics',
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default plugin;
