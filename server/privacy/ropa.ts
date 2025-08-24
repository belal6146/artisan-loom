// Records of Processing Activities (GDPR Art. 30)
export interface ProcessingActivity {
  id: string;
  name: string;
  controller: {
    name: string;
    contact: string;
    dpo?: string;
  };
  purposes: string[];
  lawfulBasis: "consent" | "contract" | "legal_obligation" | "vital_interests" | "public_task" | "legitimate_interests";
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  transfers?: {
    countries: string[];
    mechanism: "adequacy" | "sccs" | "dpf" | "derogation";
    details: string;
  };
  lastReviewed: string;
}

export const PROCESSING_ACTIVITIES: ProcessingActivity[] = [
  {
    id: "user-accounts",
    name: "User Account Management",
    controller: {
      name: "Artisan Platform Ltd",
      contact: "privacy@artisan.app",
      dpo: "dpo@artisan.app"
    },
    purposes: ["Account creation", "Authentication", "Service provision"],
    lawfulBasis: "contract",
    dataCategories: ["Identity data", "Contact data", "Profile data"],
    dataSubjects: ["Platform users", "Artists", "Collectors"],
    recipients: ["Internal teams", "Hosting provider"],
    retentionPeriod: "Account lifetime + 90 days after deletion",
    securityMeasures: ["Encryption at rest", "Access controls", "Audit logging"],
    lastReviewed: new Date().toISOString()
  },
  {
    id: "artwork-management",
    name: "Artwork and Content Management",
    controller: {
      name: "Artisan Platform Ltd",
      contact: "privacy@artisan.app"
    },
    purposes: ["Content hosting", "Discovery", "Sales facilitation"],
    lawfulBasis: "contract",
    dataCategories: ["Artwork metadata", "Images", "Creator information"],
    dataSubjects: ["Artists", "Content creators"],
    recipients: ["CDN provider", "Search engines (public content)"],
    retentionPeriod: "Account lifetime + 7 years for sold items",
    securityMeasures: ["CDN encryption", "Access controls", "Backup procedures"],
    lastReviewed: new Date().toISOString()
  },
  {
    id: "analytics-essential",
    name: "Essential Analytics (CNIL-exempt)",
    controller: {
      name: "Artisan Platform Ltd",
      contact: "privacy@artisan.app"
    },
    purposes: ["Service improvement", "Security monitoring", "Performance analysis"],
    lawfulBasis: "legitimate_interests",
    dataCategories: ["Usage data (anonymized)", "Technical data", "Performance metrics"],
    dataSubjects: ["All users"],
    recipients: ["Internal analytics team"],
    retentionPeriod: "13 months",
    securityMeasures: ["IP truncation", "No cross-site tracking", "Data minimization"],
    lastReviewed: new Date().toISOString()
  },
  {
    id: "marketing-analytics",
    name: "Marketing and Advanced Analytics",
    controller: {
      name: "Artisan Platform Ltd",
      contact: "privacy@artisan.app"
    },
    purposes: ["Marketing optimization", "Personalization", "A/B testing"],
    lawfulBasis: "consent",
    dataCategories: ["Behavioral data", "Preferences", "Campaign interactions"],
    dataSubjects: ["Consenting users"],
    recipients: ["Analytics providers", "Ad platforms"],
    retentionPeriod: "2 years from last consent or until withdrawn",
    securityMeasures: ["Consent validation", "Data anonymization", "Access controls"],
    transfers: {
      countries: ["US"],
      mechanism: "dpf",
      details: "Google Analytics via EU-US Data Privacy Framework"
    },
    lastReviewed: new Date().toISOString()
  },
  {
    id: "ai-processing",
    name: "AI Features and Content Analysis",
    controller: {
      name: "Artisan Platform Ltd",
      contact: "privacy@artisan.app"
    },
    purposes: ["Auto-tagging", "Content generation", "Similarity matching"],
    lawfulBasis: "legitimate_interests",
    dataCategories: ["Artwork images", "Generated content", "Analysis metadata"],
    dataSubjects: ["Users with AI features enabled"],
    recipients: ["AI service providers"],
    retentionPeriod: "Account lifetime + 30 days",
    securityMeasures: ["API encryption", "Provider audits", "Data minimization"],
    transfers: {
      countries: ["US"],
      mechanism: "sccs",
      details: "Standard Contractual Clauses with OpenAI/Stability AI"
    },
    lastReviewed: new Date().toISOString()
  },
  {
    id: "communications",
    name: "User Communications",
    controller: {
      name: "Artisan Platform Ltd",
      contact: "privacy@artisan.app"
    },
    purposes: ["Service notifications", "Marketing communications", "Support"],
    lawfulBasis: "consent",
    dataCategories: ["Email addresses", "Communication preferences", "Message content"],
    dataSubjects: ["Subscribed users"],
    recipients: ["Email service provider"],
    retentionPeriod: "Until unsubscribed + 30 days",
    securityMeasures: ["Unsubscribe mechanisms", "Consent tracking", "Encryption"],
    lastReviewed: new Date().toISOString()
  }
];

export function getRoPA(): ProcessingActivity[] {
  return PROCESSING_ACTIVITIES;
}

export function getProcessingActivity(id: string): ProcessingActivity | undefined {
  return PROCESSING_ACTIVITIES.find(activity => activity.id === id);
}