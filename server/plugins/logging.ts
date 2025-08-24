import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  // Add request ID to all requests
  await fastify.register(import('@fastify/request-id'));

  // Log request start
  fastify.addHook('onRequest', async (request) => {
    request.log.info({
      msg: 'req:start',
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      requestId: request.id
    });
  });

  // Log request completion
  fastify.addHook('onResponse', async (request, reply) => {
    const duration = Number(reply.getResponseTime().toFixed(0));
    
    // Echo request ID back to client
    reply.header('x-request-id', request.id);
    
    request.log.info({
      msg: 'req:end',
      method: request.method,
      url: request.url,
      status: reply.statusCode,
      durationMs: duration,
      requestId: request.id
    });
  });

  // Log errors
  fastify.addHook('onError', async (request, reply, error) => {
    request.log.error({
      msg: 'req:error',
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
      requestId: request.id
    });
  });

  // Set log level based on environment
  fastify.log.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}, {
  name: 'logging'
});