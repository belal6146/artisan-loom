import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/common/StarRating';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { ToolProduct, ToolVendor } from '@/lib/marketplace-types';

interface ToolCardProps {
  product: ToolProduct;
  vendor: ToolVendor;
  onVisitSeller: (url: string) => void;
}

export const ToolCard = ({ product, vendor, onVisitSeller }: ToolCardProps) => {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'preorder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'In Stock';
      case 'out-of-stock': return 'Out of Stock';
      case 'preorder': return 'Pre-order';
      default: return availability;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      {/* Product Image */}
      {product.imageUrl && (
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.imageUrl}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Product Name & Category */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          <Badge variant="secondary" className="mt-1 capitalize">
            {product.category}
          </Badge>
        </div>

        {/* Vendor Badge with Verification */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {vendor.verified && <ShieldCheck className="h-3 w-3 text-green-600" />}
            {vendor.name}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {vendor.domain}
          </Badge>
        </div>

        {/* Ratings */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <StarRating rating={product.ratingAvg} size="sm" />
            <span className="text-xs text-muted-foreground">
              {product.ratingCount} reviews
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Vendor:</span>
            <StarRating rating={vendor.ratingAvg} size="sm" />
            <span>({vendor.ratingCount})</span>
          </div>
        </div>

        {/* Price & Availability */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            {formatPrice(product.price.amount, product.price.currency)}
          </div>
          <Badge className={getAvailabilityColor(product.availability)}>
            {getAvailabilityText(product.availability)}
          </Badge>
        </div>

        {/* Specifications */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">Specifications:</h4>
            <div className="text-xs space-y-0.5">
              {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <Button 
            className="w-full"
            onClick={() => onVisitSeller(product.url)}
            disabled={product.availability === 'out-of-stock'}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Seller
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Read Reviews ({product.ratingCount})
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Write Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};