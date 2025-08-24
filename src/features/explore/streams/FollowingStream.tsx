import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UnifiedCard } from "@/features/explore/cards/UnifiedCard";
import { InlineSkeleton } from "@/components/common/InlineSkeleton";
import { useFollowingStream } from "./useFollowingStream";
import type { Sort, Pager } from "@/lib/filters";
import { UserPlus } from "lucide-react";

interface FollowingStreamProps {
  sort: Sort;
  pager: Pager;
  onItemAction?: (action: string, itemId: string) => void;
  className?: string;
}

export const FollowingStream = ({ sort, pager, onItemAction, className }: FollowingStreamProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useFollowingStream({ sort, pager });

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
        <p className="text-muted-foreground mb-4">Failed to load following feed</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`text-center py-12 space-y-6 ${className}`}>
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <UserPlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Follow some artists!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Follow artists to see their latest posts, artworks, and collaborations in your feed.
          </p>
        </div>
        <Button>
          Discover Artists
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
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
    </div>
  );
};