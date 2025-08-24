import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';

export default fp(async (fastify) => {
  await fastify.register(helmet, {
    // Bank-grade CSP policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for React hydration
          "'unsafe-eval'",   // Required for Vite dev mode
          "https://js.stripe.com",
          "https://checkout.stripe.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for Tailwind CSS
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "blob:",
          "https://*.pravatar.cc",
          "https://picsum.photos",
          "https://images.unsplash.com"
        ],
        connectSrc: [
          "'self'",
          "https://api.openai.com",
          "https://generativelanguage.googleapis.com",
          "https://*.supabase.co",
          "https://api.stripe.com",
          "https://checkout.stripe.com",
          "wss://*.supabase.co"
        ],
        frameSrc: [
          "https://js.stripe.com",
          "https://hooks.stripe.com",
          "https://checkout.stripe.com"
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:", "blob:"],
        workerSrc: ["'self'", "blob:"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    
    // Additional security headers
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    // Prevent clickjacking
    frameguard: {
      action: 'deny'
    },
    
    // Prevent MIME type sniffing
    noSniff: true,
    
    // Prevent XSS
    xssFilter: true,
    
    // Referrer policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    
    // Permissions policy
    permissionsPolicy: {
      features: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: ['self'],
        usb: [],
        magnetometer: [],
        gyroscope: [],
        accelerometer: []
      }
    }
  });
}, {
  name: 'helmet'
});
