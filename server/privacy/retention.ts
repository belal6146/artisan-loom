// Data Retention and Minimization Policies
export interface RetentionPolicy {
  entityType: string;
  purpose: string;
  retentionPeriod: string;
  retentionDays: number;
  deletionCriteria: string;
  lawfulBasis: string;
  exceptions?: string[];
}

export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    entityType: "user_sessions",
    purpose: "Authentication and security",
    retentionPeriod: "30 days",
    retentionDays: 30,
    deletionCriteria: "Session expiry + 30 days",
    lawfulBasis: "Legitimate interests (security)"
  },
  {
    entityType: "audit_logs", 
    purpose: "Security monitoring and compliance",
    retentionPeriod: "7 years",
    retentionDays: 2555, // 7 * 365
    deletionCriteria: "Creation date + 7 years",
    lawfulBasis: "Legal obligation"
  },
  {
    entityType: "analytics_data",
    purpose: "Service improvement (essential)",
    retentionPeriod: "13 months",
    retentionDays: 395, // 13 * 30 + 5
    deletionCriteria: "Collection date + 13 months", 
    lawfulBasis: "Legitimate interests"
  },
  {
    entityType: "marketing_analytics",
    purpose: "Marketing optimization",
    retentionPeriod: "2 years from consent",
    retentionDays: 730,
    deletionCriteria: "Consent withdrawal or 2 years from last consent",
    lawfulBasis: "Consent"
  },
  {
    entityType: "user_content",
    purpose: "Service provision",
    retentionPeriod: "Account lifetime + 90 days",
    retentionDays: 90,
    deletionCriteria: "Account deletion + 90 days grace period",
    lawfulBasis: "Contract",
    exceptions: ["Sold artworks retained for legal/tax purposes (7 years)"]
  },
  {
    entityType: "financial_records",
    purpose: "Legal compliance",
    retentionPeriod: "7 years",
    retentionDays: 2555,
    deletionCriteria: "Transaction date + 7 years",
    lawfulBasis: "Legal obligation"
  },
  {
    entityType: "support_tickets",
    purpose: "Customer service",
    retentionPeriod: "3 years",
    retentionDays: 1095,
    deletionCriteria: "Ticket closure + 3 years",
    lawfulBasis: "Legitimate interests"
  },
  {
    entityType: "consent_records",
    purpose: "Consent proof",
    retentionPeriod: "3 years after withdrawal",
    retentionDays: 1095,
    deletionCriteria: "Consent withdrawal + 3 years",
    lawfulBasis: "Legal obligation"
  },
  {
    entityType: "breach_incidents", 
    purpose: "Incident management",
    retentionPeriod: "10 years",
    retentionDays: 3650,
    deletionCriteria: "Incident date + 10 years",
    lawfulBasis: "Legal obligation"
  }
];

export function getRetentionPolicies(): RetentionPolicy[] {
  return RETENTION_POLICIES;
}

export function getRetentionPolicy(entityType: string): RetentionPolicy | undefined {
  return RETENTION_POLICIES.find(policy => policy.entityType === entityType);
}

export function getExpiredData(entityType: string, referenceDate: Date = new Date()): Date {
  const policy = getRetentionPolicy(entityType);
  if (!policy) {
    throw new Error(`No retention policy found for entity type: ${entityType}`);
  }
  
  const expiryDate = new Date(referenceDate);
  expiryDate.setDate(expiryDate.getDate() - policy.retentionDays);
  return expiryDate;
}

export function shouldPurge(createdAt: Date, entityType: string): boolean {
  const policy = getRetentionPolicy(entityType);
  if (!policy) return false;
  
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceCreation > policy.retentionDays;
}