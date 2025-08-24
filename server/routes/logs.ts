import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const LogSchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  event: z.string().min(1).max(100),
  meta: z.record(z.any()).optional()
});

const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/logs', {
    schema: {
      body: LogSchema,
      response: {
        204: { type: 'null' }
      }
    }
  }, async (request, reply) => {
    const { level, event, meta } = request.body as z.infer<typeof LogSchema>;
    
    const logData = {
      event,
      requestId: request.id,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      ...meta
    };

    // Log with appropriate level
    fastify.log[level](logData);
    
    reply.code(204).send();
  });
};

export default plugin;