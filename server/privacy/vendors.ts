// Subprocessors and Data Transfer Registry
export interface Vendor {
  id: string;
  name: string;
  role: "hosting" | "analytics" | "email" | "ai" | "cdn" | "payment" | "storage";
  purpose: string;
  dataTypes: string[];
  region: string;
  country: string;
  transferMechanism?: "adequacy" | "dpf" | "sccs" | "derogation";
  dpaUrl?: string;
  privacyPolicyUrl: string;
  lastReviewed: string;
  certifications: string[];
}

export const VENDORS: Vendor[] = [
  {
    id: "vercel",
    name: "Vercel Inc.",
    role: "hosting",
    purpose: "Application hosting and CDN",
    dataTypes: ["Usage logs", "Performance data", "Request metadata"],
    region: "EU/US", 
    country: "US",
    transferMechanism: "dpf",
    privacyPolicyUrl: "https://vercel.com/legal/privacy-policy",
    lastReviewed: new Date().toISOString(),
    certifications: ["SOC 2 Type II", "ISO 27001"]
  },
  {
    id: "supabase",
    name: "Supabase Inc.",
    role: "storage",
    purpose: "Database and file storage",
    dataTypes: ["User data", "Artwork metadata", "Application data"],
    region: "EU",
    country: "DE",
    transferMechanism: "adequacy",
    dpaUrl: "https://supabase.com/dpa",
    privacyPolicyUrl: "https://supabase.com/privacy",
    lastReviewed: new Date().toISOString(),
    certifications: ["SOC 2 Type II"]
  },
  {
    id: "google-analytics",
    name: "Google LLC",
    role: "analytics", 
    purpose: "Website analytics and performance monitoring",
    dataTypes: ["Usage patterns", "Device info", "Anonymized user behavior"],
    region: "US",
    country: "US",
    transferMechanism: "dpf",
    dpaUrl: "https://privacy.google.com/businesses/processorterms/",
    privacyPolicyUrl: "https://policies.google.com/privacy",
    lastReviewed: new Date().toISOString(),
    certifications: ["ISO 27001", "SOC 2"]
  },
  {
    id: "openai",
    name: "OpenAI, L.L.C.",
    role: "ai",
    purpose: "AI content generation and analysis",
    dataTypes: ["Text prompts", "Generated content", "API usage data"],
    region: "US",
    country: "US", 
    transferMechanism: "sccs",
    dpaUrl: "https://openai.com/policies/data-processing-addendum",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy",
    lastReviewed: new Date().toISOString(),
    certifications: ["SOC 2 Type II"]
  },
  {
    id: "stability-ai",
    name: "Stability AI Ltd.",
    role: "ai",
    purpose: "Image generation and processing",
    dataTypes: ["Image data", "Generation prompts", "API requests"],
    region: "UK",
    country: "GB",
    transferMechanism: "adequacy",
    privacyPolicyUrl: "https://stability.ai/privacy-policy",
    lastReviewed: new Date().toISOString(),
    certifications: ["ISO 27001"]
  },
  {
    id: "resend",
    name: "Resend Inc.",
    role: "email",
    purpose: "Transactional and marketing emails",
    dataTypes: ["Email addresses", "Message content", "Delivery metrics"],
    region: "US",
    country: "US",
    transferMechanism: "dpf", 
    privacyPolicyUrl: "https://resend.com/legal/privacy-policy",
    lastReviewed: new Date().toISOString(),
    certifications: ["SOC 2 Type II"]
  }
];

export function getVendors(): Vendor[] {
  return VENDORS;
}

export function getVendor(id: string): Vendor | undefined {
  return VENDORS.find(vendor => vendor.id === id);
}

export function getVendorsByRole(role: Vendor["role"]): Vendor[] {
  return VENDORS.filter(vendor => vendor.role === role);
}

export function getVendorsWithTransfers(): Vendor[] {
  return VENDORS.filter(vendor => vendor.transferMechanism && vendor.country !== "EU");
}