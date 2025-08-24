import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DomainBadge } from "@/components/common/DomainBadge";
import { StarRating } from "@/components/common/StarRating";
import { exploreClient } from "@/lib/exploreClient";
import { formatMoney } from "@/lib/date";
import { ShoppingCart, ExternalLink } from "lucide-react";

interface ToolsModuleProps {
  category?: string;
  className?: string;
}

export const ToolsModule = ({ category, className }: ToolsModuleProps) => {
  const { data: tools, isLoading } = useQuery({
    queryKey: ['tools-module', category],
    queryFn: () => exploreClient.getToolsModule({ category }),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  if (isLoading || !tools || tools.length === 0) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Art tools & supplies
          </h3>
          <Button variant="ghost" size="sm" asChild>
            <a href="/experience?tab=tools">
              View all
            </a>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.slice(0, 3).map((tool: any) => (
            <div key={tool.id} className="p-3 bg-background rounded-lg border">
              <div className="space-y-2">
                {tool.imageUrl && (
                  <div className="aspect-square rounded overflow-hidden bg-muted">
                    <img
                      src={tool.imageUrl}
                      alt={tool.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={120}
                      height={120}
                    />
                  </div>
                )}
                
                <div className="space-y-1">
                  <h4 className="font-medium text-sm line-clamp-2">{tool.title}</h4>
                  
                  <div className="flex items-center justify-between">
                    <StarRating 
                      rating={tool.rating}
                      showCount={true}
                      reviewsCount={tool.reviewsCount}
                      size="sm"
                    />
                    {tool.price && (
                      <Badge variant="secondary" className="text-xs">
                        {formatMoney(tool.price.amount, tool.price.currency)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <DomainBadge 
                    url={tool.url} 
                    verified={tool.vendor?.verified}
                    showIcon={false}
                    className="text-xs"
                  />
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Shop
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};