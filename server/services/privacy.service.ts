import { eq, and, gte, lte } from "drizzle-orm";
import { getDatabase, schema } from "../db/connection";
import type { ConsentState, DSARType, RectifyData, AuditEvent, BreachIncident } from "../privacy/schemas";
import { log } from "../../src/lib/log";
import { createHash } from "crypto";

export class PrivacyService {
  private db = getDatabase();

  // Consent Management
  async recordConsent(userId: string, consent: ConsentState, metadata: {
    userAgent?: string;
    ipAddress?: string;
    requestId: string;
  }): Promise<void> {
    const ipHash = metadata.ipAddress 
      ? createHash("sha256").update(metadata.ipAddress).digest("hex")
      : undefined;
    
    const consentHash = createHash("sha256")
      .update(JSON.stringify({
        essential: consent.essential,
        analytics: consent.analytics,
        marketing: consent.marketing,
        aiFeatures: consent.aiFeatures,
        timestamp: consent.timestamp,
      }))
      .digest("hex");

    await this.db.insert(schema.consentRecords).values({
      userId,
      essential: consent.essential,
      analytics: consent.analytics,
      marketing: consent.marketing,
      aiFeatures: consent.aiFeatures,
      gpcDetected: consent.gpcDetected,
      userAgent: metadata.userAgent,
      ipHash,
      consentHash,
    });

    await this.auditLog({
      userId,
      action: "consent_updated",
      entityType: "consent",
      requestId: metadata.requestId,
      metadata: {
        analytics: consent.analytics,
        marketing: consent.marketing,
        gpcDetected: consent.gpcDetected,
      },
    });

    log.info("Consent recorded", { 
      userId, 
      requestId: metadata.requestId,
      gpcDetected: consent.gpcDetected 
    });
  }

  async getLatestConsent(userId: string): Promise<ConsentState | null> {
    const [latest] = await this.db
      .select()
      .from(schema.consentRecords)
      .where(eq(schema.consentRecords.userId, userId))
      .orderBy(schema.consentRecords.createdAt)
      .limit(1);

    if (!latest) return null;

    return {
      essential: latest.essential,
      analytics: latest.analytics,
      marketing: latest.marketing,
      aiFeatures: latest.aiFeatures,
      gpcDetected: latest.gpcDetected,
      timestamp: latest.createdAt.toISOString(),
    };
  }

  // DSAR Operations
  async createDSARRequest(userId: string, type: DSARType, metadata: {
    reason?: string;
    requestId: string;
  }): Promise<string> {
    const [request] = await this.db
      .insert(schema.dsarRequests)
      .values({
        userId,
        type,
        reason: metadata.reason,
        status: "pending",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .returning({ id: schema.dsarRequests.id });

    await this.auditLog({
      userId,
      action: `dsar_${type}_requested`,
      entityType: "dsar_request",
      entityId: request.id,
      requestId: metadata.requestId,
      metadata: { type, reason: metadata.reason },
    });

    log.info("DSAR request created", { 
      userId, 
      type, 
      requestId: metadata.requestId,
      dsarId: request.id 
    });

    return request.id;
  }

  async exportUserData(userId: string): Promise<Record<string, any>> {
    // Get all user data for GDPR export
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      throw new Error("User not found");
    }

    const artworks = await this.db
      .select()
      .from(schema.artworks)
      .where(eq(schema.artworks.userId, userId));

    const posts = await this.db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.authorId, userId));

    const comments = await this.db
      .select()
      .from(schema.comments)
      .where(eq(schema.comments.authorId, userId));

    const purchases = await this.db
      .select()
      .from(schema.purchases)
      .where(eq(schema.purchases.buyerId, userId));

    const consents = await this.db
      .select()
      .from(schema.consentRecords)
      .where(eq(schema.consentRecords.userId, userId));

    return {
      user: {
        ...user,
        // Remove sensitive fields
        password: "[REDACTED]",
        email: user.email, // Include for data subject
      },
      artworks,
      posts,
      comments,
      purchases,
      consents,
      exportedAt: new Date().toISOString(),
      dataSubjectRights: {
        access: "You have the right to access your personal data",
        rectification: "You have the right to correct inaccurate data",
        erasure: "You have the right to request deletion of your data",
        restriction: "You have the right to restrict processing",
        portability: "You have the right to data portability",
        objection: "You have the right to object to processing",
      },
    };
  }

  async softDeleteUser(userId: string, metadata: {
    reason?: string;
    requestId: string;
  }): Promise<void> {
    await this.db
      .update(schema.users)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        // Anonymize immediately visible data
        name: "[Deleted User]",
        bio: null,
        avatar: null,
      })
      .where(eq(schema.users.id, userId));

    await this.auditLog({
      userId,
      action: "user_soft_deleted",
      entityType: "user",
      requestId: metadata.requestId,
      metadata: { reason: metadata.reason },
    });

    log.warn("User soft deleted", { 
      userId, 
      requestId: metadata.requestId,
      reason: metadata.reason 
    });
  }

  async rectifyUserData(userId: string, data: RectifyData, metadata: {
    requestId: string;
  }): Promise<void> {
    const updates: any = {};
    
    if (data.name) updates.name = data.name;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.location !== undefined) updates.location = data.location;

    if (Object.keys(updates).length === 0) {
      return; // No changes
    }

    await this.db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, userId));

    await this.auditLog({
      userId,
      action: "user_data_rectified",
      entityType: "user",
      requestId: metadata.requestId,
      metadata: { fields: Object.keys(updates) },
    });

    log.info("User data rectified", { 
      userId, 
      requestId: metadata.requestId,
      fields: Object.keys(updates) 
    });
  }

  async restrictProcessing(userId: string, metadata: {
    requestId: string;
  }): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ restrictProcessing: true })
      .where(eq(schema.users.id, userId));

    await this.auditLog({
      userId,
      action: "processing_restricted",
      entityType: "user",
      requestId: metadata.requestId,
    });

    log.info("Processing restricted", { 
      userId, 
      requestId: metadata.requestId 
    });
  }

  // Audit Logging
  async auditLog(event: AuditEvent & { ipHash?: string; userAgent?: string }): Promise<void> {
    await this.db.insert(schema.auditLogs).values({
      userId: event.userId,
      requestId: event.requestId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      metadata: event.metadata,
      ipHash: event.ipHash,
      userAgent: event.userAgent,
    });
  }

  // Retention & Cleanup
  async purgeExpiredData(entityType: string, cutoffDate: Date, dryRun: boolean = false): Promise<number> {
    let count = 0;

    switch (entityType) {
      case "audit_logs":
        if (dryRun) {
          const result = await this.db
            .select({ count: "COUNT(*)" })
            .from(schema.auditLogs)
            .where(lte(schema.auditLogs.timestamp, cutoffDate));
          count = parseInt(result[0].count as string);
        } else {
          const result = await this.db
            .delete(schema.auditLogs)
            .where(lte(schema.auditLogs.timestamp, cutoffDate));
          count = result.rowCount || 0;
        }
        break;

      case "consent_records":
        if (dryRun) {
          const result = await this.db
            .select({ count: "COUNT(*)" })
            .from(schema.consentRecords)
            .where(lte(schema.consentRecords.createdAt, cutoffDate));
          count = parseInt(result[0].count as string);
        } else {
          const result = await this.db
            .delete(schema.consentRecords)
            .where(lte(schema.consentRecords.createdAt, cutoffDate));
          count = result.rowCount || 0;
        }
        break;
    }

    if (!dryRun && count > 0) {
      log.info("Expired data purged", { entityType, count, cutoffDate });
    }

    return count;
  }

  // Breach Management
  async recordBreachIncident(incident: BreachIncident, metadata: {
    requestId: string;
  }): Promise<string> {
    const [breach] = await this.db
      .insert(schema.breachIncidents)
      .values({
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        affectedUsers: incident.affectedUsers,
        dataTypes: incident.dataTypes,
        containmentActions: incident.containmentActions,
      })
      .returning({ id: schema.breachIncidents.id });

    await this.auditLog({
      userId: "system",
      action: "breach_incident_recorded",
      entityType: "breach_incident",
      entityId: breach.id,
      requestId: metadata.requestId,
      metadata: { 
        severity: incident.severity, 
        affectedUsers: incident.affectedUsers 
      },
    });

    log.error("Breach incident recorded", { 
      breachId: breach.id,
      severity: incident.severity,
      affectedUsers: incident.affectedUsers,
      requestId: metadata.requestId 
    });

    return breach.id;
  }
}