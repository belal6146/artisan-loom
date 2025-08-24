// Marketplace-specific types for Experience page
export type MediaCategory = 
  | "painting" | "drawing" | "printmaking" | "sculpture" | "ceramics"
  | "textiles" | "photography" | "electronic" | "installation" | "glass" | "literature" | "sound" | "other";

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface ToolVendor {
  id: string;
  name: string;
  domain: string;
  country?: string;
  logo?: string;
  categories: MediaCategory[];
  verified: true;
  ratingAvg: number;
  ratingCount: number;
}

export interface ToolProduct {
  id: string;
  vendorId: string;
  name: string;
  imageUrl?: string;
  url: string;
  category: MediaCategory;
  subcategory?: string;
  price: {
    amount: number;
    currency: string;
  };
  availability: "in-stock" | "out-of-stock" | "preorder";
  ratingAvg: number;
  ratingCount: number;
  specs?: Record<string, string>;
}

export interface MarketplaceFilters {
  category?: MediaCategory;
  vendorId?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface EventFilters {
  type?: "gallery" | "competition" | "meetup" | "class" | "seminar" | "volunteer";
  city?: string;
  radiusKm?: number;
  verifiedOnly?: boolean;
  startDate?: string;
  endDate?: string;
}