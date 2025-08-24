import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async (fastify) => {
  // Global rate limiting
  await fastify.register(rateLimit, {
    global: true,
    max: 200, // requests per window
    timeWindow: '1 minute',
    allowList: ['127.0.0.1', '::1'], // localhost
    keyGenerator: (request) => {
      // Rate limit by IP + user ID if authenticated
      const userId = request.user?.id || 'anonymous';
      return `${request.ip}-${userId}`;
    },
    errorResponseBuilder: (request, context) => ({
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${Math.ceil(context.after / 1000)}s`,
      retryAfter: Math.ceil(context.after / 1000)
    })
  });

  // Stricter limits for write operations
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.method === 'POST' || routeOptions.method === 'PUT' || routeOptions.method === 'DELETE') {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: {
          max: 60, // 60 requests per minute for write operations
          timeWindow: '1 minute',
          keyGenerator: (request) => `${request.ip}-${request.user?.id || 'anonymous'}-write`,
          errorResponseBuilder: (request, context) => ({
            code: 429,
            error: 'Write Rate Limit Exceeded',
            message: `Too many write operations, retry in ${Math.ceil(context.after / 1000)}s`,
            retryAfter: Math.ceil(context.after / 1000)
          })
        }
      };
    }
  });

  // Special limits for sensitive endpoints
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url?.includes('/auth') || routeOptions.url?.includes('/payment')) {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: {
          max: 10, // 10 requests per minute for auth/payment
          timeWindow: '1 minute',
          keyGenerator: (request) => `${request.ip}-${request.user?.id || 'anonymous'}-sensitive`,
          errorResponseBuilder: (request, context) => ({
            code: 429,
            error: 'Authentication/Payment Rate Limit Exceeded',
            message: `Too many attempts, retry in ${Math.ceil(context.after / 1000)}s`,
            retryAfter: Math.ceil(context.after / 1000)
          })
        }
      };
    }
  });

  // AI generation rate limiting
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url?.includes('/ai') || routeOptions.url?.includes('/generate')) {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: {
          max: 20, // 20 AI generations per hour
          timeWindow: '1 hour',
          keyGenerator: (request) => `${request.ip}-${request.user?.id || 'anonymous'}-ai`,
          errorResponseBuilder: (request, context) => ({
            code: 429,
            error: 'AI Generation Rate Limit Exceeded',
            message: `Too many AI generations, retry in ${Math.ceil(context.after / 3600000)}h`,
            retryAfter: Math.ceil(context.after / 1000)
          })
        }
      };
    }
  });

  // Log rate limit violations for security monitoring
  fastify.addHook('onRequest', (request, reply, done) => {
    const routeConfig = request.routeConfig;
    if (routeConfig?.rateLimit) {
      const key = routeConfig.rateLimit.keyGenerator(request);
      fastify.log.debug('Rate limit check', { 
        route: request.url, 
        method: request.method, 
        key,
        limit: routeConfig.rateLimit.max,
        window: routeConfig.rateLimit.timeWindow
      });
    }
    done();
  });
}, {
  name: 'rate-limit'
});
