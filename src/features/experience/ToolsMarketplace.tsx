import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DomainBadge } from "@/components/common/DomainBadge";
import { StarRating } from "@/components/common/StarRating";
import { InlineSkeleton } from "@/components/common/InlineSkeleton";
import { track } from "@/lib/track";
import { useTools } from "./useTools";
import { formatMoney } from "@/lib/date";
import { ShoppingCart, ExternalLink } from "lucide-react";

const categories = [
  'All',
  'Paint',
  'Brushes',
  'Canvas',
  'Clay',
  'Paper',
  'Digital',
  'Tools'
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'price', label: 'Price' }
];

export const ToolsMarketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [minRating, setMinRating] = useState<number | undefined>();

  const { data: tools, isLoading, error } = useTools({
    filters: {
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      sort: selectedSort as any,
      minRating
    }
  });

  const handleToolVisit = (toolId: string, url: string, vendorName: string) => {
    track("tool_visit", { id: toolId, vendor: vendorName, domain: new URL(url).hostname });
  };

  if (isLoading) {
    return <InlineSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Failed to load art tools</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const filteredTools = tools || [];

  return (
    <div className="space-y-6" data-testid="tools-list">
      {/* Filters */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Art Tools & Supplies</h2>
          <p className="text-sm text-muted-foreground">
            Curated art supplies from verified vendors only
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={minRating?.toString() || "any"} 
              onValueChange={(value) => setMinRating(value === "any" ? undefined : parseFloat(value))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Min rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any rating</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-smooth">
              <CardContent className="p-4">
                {tool.imageUrl && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                    <img
                      src={tool.imageUrl}
                      alt={tool.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={200}
                      height={200}
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  {/* Vendor */}
                  {tool.vendor && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tool.vendor.name}</span>
                        {tool.vendor.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <StarRating 
                        rating={tool.vendor.rating}
                        size="sm"
                        showCount={true}
                        reviewsCount={tool.vendor.reviewsCount}
                      />
                    </div>
                  )}

                  {/* Product */}
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-2">{tool.title}</h3>
                    
                    {tool.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <StarRating 
                        rating={tool.rating}
                        size="sm"
                        showCount={true}
                        reviewsCount={tool.reviewsCount}
                      />
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="space-y-1">
                      {tool.price && (
                        <div className="font-semibold text-lg">
                          {formatMoney(tool.price.amount, tool.price.currency)}
                        </div>
                      )}
                      <DomainBadge url={tool.url} verified={tool.vendor?.verified} />
                    </div>
                    
                        <Button size="sm" asChild>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                            onClick={() => handleToolVisit(tool.id, tool.url, tool.vendor?.name || 'Unknown')}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Shop
                          </a>
                        </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};