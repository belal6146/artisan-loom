// SimilarCarousel - Show similar artworks
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { aiClient } from "@/lib/aiClient";
import { userAdapter } from "@/lib/data-service";
import { log } from "@/lib/log";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { SimilarSearchResult } from "@/types/ai";
import type { User } from "@/types";

interface SimilarCarouselProps {
  artworkId?: string;
  query?: string;
  imageUrl?: string;
  className?: string;
}

export const SimilarCarousel = ({ artworkId, query, imageUrl, className }: SimilarCarouselProps) => {
  const [results, setResults] = useState<SimilarSearchResult[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const searchSimilar = async () => {
      if (!artworkId && !query && !imageUrl) return;

      setIsLoading(true);
      try {
        const searchResults = await aiClient.similarSearch({
          artworkId,
          text: query,
          imageUrl,
          limit: 12,
        });

        setResults(searchResults);

        // Load authors for each artwork
        const authorIds = [...new Set(searchResults.map(r => r.artwork?.userId).filter(Boolean))];
        const authorsData: Record<string, User> = {};
        
        await Promise.all(
          authorIds.map(async (userId) => {
            try {
              const author = await userAdapter.getById(userId!);
              if (author) authorsData[userId!] = author;
            } catch (error) {
              log.error("Failed to load author", { userId, error: error.message });
            }
          })
        );

        setAuthors(authorsData);
      } catch (error) {
        log.error("Failed to search similar content", { error: error.message });
        toast({
          variant: "destructive",
          title: "Search failed",
          description: "Failed to find similar content.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    searchSimilar();
  }, [artworkId, query, imageUrl, toast]);

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < Math.max(0, results.length - 4);

  const scrollLeft = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const scrollRight = () => {
    setCurrentIndex(Math.min(results.length - 4, currentIndex + 1));
  };

  if (!artworkId && !query && !imageUrl) return null;

  if (isLoading) {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold mb-4">Similar Artworks</h3>
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48">
              <Skeleton className="w-full aspect-square rounded-lg mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold mb-4">Similar Artworks</h3>
        <p className="text-muted-foreground">No similar artworks found.</p>
      </div>
    );
  }

  const visibleResults = results.slice(currentIndex, currentIndex + 4);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Similar Artworks</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden">
        {visibleResults.map((result) => {
          const artwork = result.artwork;
          const author = artwork ? authors[artwork.userId] : null;

          if (!artwork) return null;

          return (
            <Card key={result.id} className="flex-shrink-0 w-48 hover:shadow-medium transition-all">
              <CardContent className="p-3">
                <div className="relative group">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full aspect-square object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <h4 className="font-medium text-sm truncate">{artwork.title}</h4>
                  {author && (
                    <p className="text-xs text-muted-foreground truncate">
                      by {author.name}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {Math.round(result.score * 100)}% similar
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};