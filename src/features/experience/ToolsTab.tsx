import { useState } from 'react';
import { FilterBar } from './FilterBar';
import { ToolCard } from './ToolCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/lib/log';
import type { ToolProduct, ToolVendor, MarketplaceFilters } from '@/lib/marketplace-types';

// Mock marketplace data
const mockVendors: ToolVendor[] = [
  {
    id: "blick",
    name: "Blick Art Materials",
    domain: "dickblick.com",
    country: "US",
    categories: ["painting", "drawing", "printmaking", "sculpture", "ceramics", "textiles", "photography"],
    verified: true,
    ratingAvg: 4.6,
    ratingCount: 2847
  },
  {
    id: "jacksons",
    name: "Jackson's Art",
    domain: "jacksonsart.com", 
    country: "UK",
    categories: ["painting", "drawing", "printmaking", "ceramics"],
    verified: true,
    ratingAvg: 4.8,
    ratingCount: 1523
  },
  {
    id: "cassart",
    name: "Cass Art",
    domain: "cassart.co.uk",
    country: "UK", 
    categories: ["painting", "drawing", "printmaking", "ceramics", "textiles"],
    verified: true,
    ratingAvg: 4.4,
    ratingCount: 892
  }
];

const mockProducts: ToolProduct[] = [
  {
    id: "prd-001",
    vendorId: "jacksons",
    name: "Jackson's Professional Watercolours Set",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
    url: "https://www.jacksonsart.com/watercolours-set",
    category: "painting",
    subcategory: "watercolor",
    price: {amount: 4999, currency: "GBP"},
    availability: "in-stock",
    ratingAvg: 4.7,
    ratingCount: 182,
    specs: {
      colors: "24",
      tube_size: "14ml",
      lightfastness: "excellent"
    }
  },
  {
    id: "prd-002", 
    vendorId: "cassart",
    name: "Cass Art Canvas 3-Pack",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    url: "https://www.cassart.co.uk/canvas-3-pack",
    category: "painting",
    subcategory: "canvas",
    price: {amount: 1999, currency: "GBP"},
    availability: "in-stock",
    ratingAvg: 4.3,
    ratingCount: 86,
    specs: {
      size: "16x20 inches",
      material: "100% cotton",
      primed: "yes"
    }
  },
  {
    id: "prd-003",
    vendorId: "blick",
    name: "Blick Studio Brushes Professional Set",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    url: "https://www.dickblick.com/brushes-professional-set",
    category: "painting",
    subcategory: "brushes",
    price: {amount: 8999, currency: "USD"},
    availability: "in-stock",
    ratingAvg: 4.8,
    ratingCount: 347,
    specs: {
      brushes: "12",
      hair_type: "natural bristle",
      sizes: "2-24"
    }
  }
];

export const ToolsTab = () => {
  const [products, setProducts] = useState<ToolProduct[]>(mockProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const { toast } = useToast();

  const handleFiltersChange = (newFilters: MarketplaceFilters) => {
    setFilters(newFilters);
    
    // Apply filters to products
    let filteredProducts = mockProducts;
    
    if (newFilters.category) {
      filteredProducts = filteredProducts.filter(product => product.category === newFilters.category);
    }
    
    if (newFilters.vendorId) {
      filteredProducts = filteredProducts.filter(product => product.vendorId === newFilters.vendorId);
    }
    
    if (newFilters.q) {
      const query = newFilters.q.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(query))
      );
    }
    
    if (newFilters.minPrice !== undefined || newFilters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.price.amount / 100; // Convert from cents
        return (!newFilters.minPrice || price >= newFilters.minPrice) &&
               (!newFilters.maxPrice || price <= newFilters.maxPrice);
      });
    }
    
    setProducts(filteredProducts);
    log.info('Products filtered', { filters: newFilters, count: filteredProducts.length });
  };

  const handleVisitSeller = (url: string) => {
    const domain = new URL(url).hostname;
    const vendor = mockVendors.find(v => v.domain === domain);
    
    if (!vendor) {
      toast({
        title: 'Security Warning',
        description: 'This link is not from a verified vendor.',
        variant: 'destructive',
      });
      return;
    }
    
    log.info('Visiting verified seller', { domain, vendorName: vendor.name });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getVendorForProduct = (vendorId: string): ToolVendor => {
    return mockVendors.find(v => v.id === vendorId) || mockVendors[0];
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar
        mode="marketplace"
        onFiltersChange={handleFiltersChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Results Count & Vendor Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} products from {mockVendors.length} verified vendors
        </p>
      </div>

      {/* Products Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {products.map((product) => (
          <ToolCard
            key={product.id}
            product={product}
            vendor={getVendorForProduct(product.vendorId)}
            onVisitSeller={handleVisitSeller}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No products found matching your criteria.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => handleFiltersChange({})}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {products.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load more products
          </Button>
        </div>
      )}
    </div>
  );
};