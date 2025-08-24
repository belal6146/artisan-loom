import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UnifiedCard } from "@/features/explore/cards/UnifiedCard";
import { InlineSkeleton } from "@/components/common/InlineSkeleton";
import { useLearnStream } from "./useLearnStream";
import type { Sort, Pager } from "@/lib/filters";
import { GraduationCap, BookOpen } from "lucide-react";

interface LearnStreamProps {
  sort: Sort;
  pager: Pager;
  onItemAction?: (action: string, itemId: string) => void;
  className?: string;
}

export const LearnStream = ({ sort, pager, onItemAction, className }: LearnStreamProps) => {
  const [filters, setFilters] = useState<{
    type?: 'video' | 'image' | 'pdf';
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }>({});

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useLearnStream({ 
    sort, 
    pager, 
    filters 
  });

  const items = data?.pages.flatMap(page => page.items) ?? [];

  const handleItemAction = (action: string, itemId: string) => {
    onItemAction?.(action, itemId);
  };

  const popularTags = ['Drawing', 'Painting', 'Digital Art', 'Sculpture', 'Photography', 'Color Theory'];

  if (isLoading) {
    return <InlineSkeleton count={5} className={className} />;
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground mb-4">Failed to load learning resources</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={filters.type || ""}
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              type: value as any || undefined 
            }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.difficulty || ""}
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              difficulty: value as any || undefined 
            }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Popular tags */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Popular topics:</span>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <Badge 
                key={tag}
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  tags: prev.tags?.includes(tag) 
                    ? prev.tags.filter(t => t !== tag)
                    : [...(prev.tags || []), tag]
                }))}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-6">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No learning resources found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your filters or explore our curated learning paths.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Browse Learning Paths
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