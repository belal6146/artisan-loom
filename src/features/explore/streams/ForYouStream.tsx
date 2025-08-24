import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnifiedCard } from "@/features/explore/cards/UnifiedCard";
import { InlineSkeleton } from "@/components/common/InlineSkeleton";
import { exploreClient } from "@/lib/exploreClient";
import type { ExploreItem } from "@/lib/exploreClient";
import type { Sort, Pager } from "@/lib/filters";

interface ForYouStreamProps {
  sort: Sort;
  pager: Pager;
  onItemAction?: (action: string, itemId: string) => void;
  className?: string;
}

export const ForYouStream = ({ sort, pager, onItemAction, className }: ForYouStreamProps) => {
  const [items, setItems] = useState<ExploreItem[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['explore', 'for-you', sort, pager.cursor],
    queryFn: () => exploreClient.getForYou({ sort, ...pager }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (data?.items) {
      if (pager.cursor) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
    }
  }, [data, pager.cursor]);

  const handleItemAction = (action: string, itemId: string) => {
    onItemAction?.(action, itemId);
  };

  if (isLoading && items.length === 0) {
    return <InlineSkeleton count={5} className={className} />;
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground mb-4">Failed to load content</p>
        <button
          onClick={() => refetch()}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`text-center py-8 space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Welcome to Explore!</h3>
        <p className="text-muted-foreground">
          Start by following some artists or sharing your first post to see personalized content here.
        </p>
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
      
      {isLoading && <InlineSkeleton count={3} />}
    </div>
  );
};