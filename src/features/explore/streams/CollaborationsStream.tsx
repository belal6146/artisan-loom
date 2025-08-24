import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnifiedCard } from "@/features/explore/cards/UnifiedCard";
import { InlineSkeleton } from "@/components/common/InlineSkeleton";
import { useCollaborationsStream } from "./useCollaborationsStream";
import type { Sort, Pager } from "@/lib/filters";
import { Users } from "lucide-react";

interface CollaborationsStreamProps {
  sort: Sort;
  pager: Pager;
  onItemAction?: (action: string, itemId: string) => void;
  className?: string;
}

export const CollaborationsStream = ({ sort, pager, onItemAction, className }: CollaborationsStreamProps) => {
  const [filters, setFilters] = useState<{
    compensationType?: string;
    skills?: string[];
    location?: string;
  }>({});

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useCollaborationsStream({ 
    sort, 
    pager, 
    filters 
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
        <p className="text-muted-foreground mb-4">Failed to load collaborations</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <Select
          value={filters.compensationType || ""}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            compensationType: value === "all" ? undefined : value 
          }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Compensation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="revenue-share">Revenue Share</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-6">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No collaborations found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to post a collaboration opportunity or adjust your filters.
            </p>
          </div>
          <Button>
            Post Collaboration
          </Button>
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