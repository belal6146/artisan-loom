import { z } from "zod";

// Consent Management
export const ConsentStateSchema = z.object({
  essential: z.boolean().default(true),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
  aiFeatures: z.boolean().default(false),
  gpcDetected: z.boolean().default(false),
  timestamp: z.string().datetime(),
  userAgent: z.string().optional(),
  ipHash: z.string().optional(),
});

export const UpdateConsentSchema = z.object({
  essential: z.boolean().optional(),
  analytics: z.boolean().optional(), 
  marketing: z.boolean().optional(),
  aiFeatures: z.boolean().optional(),
});

// DSAR Requests
export const DSARTypeSchema = z.enum(["access", "export", "rectify", "delete", "restrict"]);

export const DSARRequestSchema = z.object({
  type: DSARTypeSchema,
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const RectifyDataSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

// Audit Logging
export const AuditEventSchema = z.object({
  userId: z.string(),
  action: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  requestId: z.string(),
  metadata: z.record(z.any()).optional(),
});

// Breach Incident
export const BreachIncidentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  severity: z.enum(["low", "medium", "high", "critical"]),
  affectedUsers: z.number().min(0),
  dataTypes: z.array(z.string()),
  containmentActions: z.string().optional(),
});

export type ConsentState = z.infer<typeof ConsentStateSchema>;
export type UpdateConsent = z.infer<typeof UpdateConsentSchema>;
export type DSARType = z.infer<typeof DSARTypeSchema>;
export type DSARRequest = z.infer<typeof DSARRequestSchema>;
export type RectifyData = z.infer<typeof RectifyDataSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type BreachIncident = z.infer<typeof BreachIncidentSchema>;