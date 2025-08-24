import { z } from "zod";
import type { BreachIncident } from "./schemas";

// Breach Response Framework (GDPR Art. 33-34)
export interface BreachNotification {
  id: string;
  incidentId: string;
  type: "supervisory_authority" | "data_subject";
  status: "draft" | "sent" | "acknowledged";
  sentAt?: string;
  acknowledgedAt?: string;
  recipient: string;
  template: string;
  metadata: Record<string, any>;
}

export interface BreachAssessment {
  riskLevel: "low" | "medium" | "high" | "critical";
  likelyToResult: boolean; // "likely to result in a risk to rights and freedoms"
  highRisk: boolean; // "likely to result in a high risk to rights and freedoms"
  requiresSANotification: boolean; // Must notify SA within 72h
  requiresDataSubjectNotification: boolean; // Must notify individuals
  reasoning: string;
  mitigationActions: string[];
}

// EDPB Guidelines on Personal Data Breach Notification
export function assessBreachRisk(incident: BreachIncident): BreachAssessment {
  const { severity, affectedUsers, dataTypes } = incident;
  
  // Risk factors from EDPB Guidelines
  const hasSensitiveData = dataTypes.some(type => 
    ["financial", "health", "biometric", "authentication", "location"].includes(type.toLowerCase())
  );
  
  const hasIdentityData = dataTypes.some(type =>
    ["personal", "identity", "contact", "password"].includes(type.toLowerCase())
  );
  
  const largeScale = affectedUsers > 1000;
  const mediumScale = affectedUsers > 100;
  
  let riskLevel: "low" | "medium" | "high" | "critical";
  let likelyToResult = false;
  let highRisk = false;
  
  // Risk assessment logic
  if (severity === "critical" || (hasSensitiveData && largeScale)) {
    riskLevel = "critical";
    likelyToResult = true;
    highRisk = true;
  } else if (severity === "high" || hasSensitiveData || (hasIdentityData && mediumScale)) {
    riskLevel = "high"; 
    likelyToResult = true;
    highRisk = mediumScale || hasSensitiveData;
  } else if (severity === "medium" || hasIdentityData || largeScale) {
    riskLevel = "medium";
    likelyToResult = true;
    highRisk = false;
  } else {
    riskLevel = "low";
    likelyToResult = false;
    highRisk = false;
  }
  
  return {
    riskLevel,
    likelyToResult,
    highRisk,
    requiresSANotification: likelyToResult, // GDPR Art. 33
    requiresDataSubjectNotification: highRisk, // GDPR Art. 34
    reasoning: `Risk assessment based on: severity=${severity}, affected=${affectedUsers}, sensitive=${hasSensitiveData}, identity=${hasIdentityData}`,
    mitigationActions: generateMitigationActions(riskLevel, dataTypes)
  };
}

function generateMitigationActions(riskLevel: string, dataTypes: string[]): string[] {
  const actions = [
    "Contain the breach and stop unauthorized access",
    "Assess the scope and cause of the breach",
    "Document all breach details and timeline"
  ];
  
  if (riskLevel === "high" || riskLevel === "critical") {
    actions.push(
      "Reset affected user credentials immediately",
      "Enable additional monitoring and alerting",
      "Consider additional security measures"
    );
  }
  
  if (dataTypes.includes("financial") || dataTypes.includes("payment")) {
    actions.push("Notify payment processors and financial institutions");
  }
  
  if (dataTypes.includes("authentication")) {
    actions.push("Force password reset for all affected accounts");
  }
  
  return actions;
}

// Notification Templates (GDPR-compliant)
export const BREACH_TEMPLATES = {
  supervisory_authority: `
PERSONAL DATA BREACH NOTIFICATION
To: [Supervisory Authority]
From: [Data Controller]
Date: [Notification Date]

1. NATURE OF THE BREACH
Description: [Incident Description]
Categories of personal data: [Data Types]
Approximate number of data subjects: [Affected Count]

2. CONTACT DETAILS
Data Protection Officer: [DPO Contact]
Contact person: [Contact Details]

3. LIKELY CONSEQUENCES
Risk assessment: [Risk Level]
Potential harm: [Consequences Description]

4. MEASURES TAKEN
Immediate actions: [Containment Actions]
Mitigation measures: [Mitigation Steps]
`,
  
  data_subject: `
IMPORTANT SECURITY NOTICE
Subject: Security incident affecting your Artisan account

Dear [User Name],

We are writing to inform you of a security incident that may have affected your personal information on Artisan.

WHAT HAPPENED
[Incident Description]

INFORMATION INVOLVED
[Data Types Affected]

WHAT WE ARE DOING
[Mitigation Actions]

WHAT YOU CAN DO
[Recommended User Actions]

CONTACT US
If you have questions, contact us at privacy@artisan.app

Sincerely,
Artisan Privacy Team
`
};

export function generateNotificationId(): string {
  return `BN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isWithin72Hours(incidentTime: Date): boolean {
  const now = new Date();
  const diffHours = (now.getTime() - incidentTime.getTime()) / (1000 * 60 * 60);
  return diffHours <= 72;
}