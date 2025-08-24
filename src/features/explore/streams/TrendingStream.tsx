import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedCard } from "@/features/explore/cards/UnifiedCard";
import { InlineSkeleton } from "@/components/common/InlineSkeleton";
import { useTrendingStream } from "./useTrendingStream";
import type { Sort, Pager } from "@/lib/filters";
import { TrendingUp } from "lucide-react";

interface TrendingStreamProps {
  sort: Sort;
  pager: Pager;
  onItemAction?: (action: string, itemId: string) => void;
  className?: string;
}

export const TrendingStream = ({ sort, pager, onItemAction, className }: TrendingStreamProps) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d'>('24h');
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useTrendingStream({ 
    sort, 
    pager, 
    timeframe 
  });

  const items = data?.pages.flatMap(page => page.items) ?? [];

  const handleItemAction = (action: string, itemId: string) => {
    onItemAction?.(action, itemId);
  };

  if (isLoading) {
    return <InlineSkeleton count={5} className={className} />;
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground mb-4">Failed to load trending content</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Timeframe filter */}
      <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Trending:</span>
        <div className="flex gap-2">
          <Badge 
            variant={timeframe === '24h' ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => setTimeframe('24h')}
          >
            24h
          </Badge>
          <Badge 
            variant={timeframe === '7d' ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => setTimeframe('7d')}
          >
            7d
          </Badge>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No trending content found.</p>
        </div>
      ) : (
        <>
          {items.map((item, index) => (
            <UnifiedCard
              key={`${item.id}-${index}`}
              item={item}
              onLike={(id) => handleItemAction('like', id)}
              onSave={(id) => handleItemAction('save', id)}
              onFollow={(id) => handleItemAction('follow', id)}
            />
          ))}
          
          {hasNextPage && (
            <div className="text-center py-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
          
          {isFetchingNextPage && <InlineSkeleton count={3} />}
        </>
      )}
    </div>
  );
};