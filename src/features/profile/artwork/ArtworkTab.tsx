import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArtworkGrid } from "@/components/profile/ArtworkGrid";
import type { Artwork } from "@/types";
import { Filter, SortAsc, SortDesc } from "lucide-react";

interface ArtworkTabProps {
  artworks: Artwork[];
  isOwnProfile: boolean;
  onArtworkUpdate: () => void;
  className?: string;
}

export const ArtworkTab = ({ 
  artworks, 
  isOwnProfile, 
  onArtworkUpdate,
  className 
}: ArtworkTabProps) => {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-high" | "price-low">("newest");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showForSaleOnly, setShowForSaleOnly] = useState(false);

  const categories = Array.from(new Set(artworks.map(a => a.category)));
  
  const filteredAndSortedArtworks = artworks
    .filter(artwork => {
      if (!isOwnProfile && artwork.privacy === "private") return false;
      if (filterCategory !== "all" && artwork.category !== filterCategory) return false;
      if (showForSaleOnly && !artwork.forSale) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-high":
          if (!a.price || !b.price) return 0;
          return b.price.amount - a.price.amount;
        case "price-low":
          if (!a.price || !b.price) return 0;
          return a.price.amount - b.price.amount;
        default:
          return 0;
      }
    });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showForSaleOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowForSaleOnly(!showForSaleOnly)}
          >
            <Filter className="h-4 w-4 mr-2" />
            For Sale Only
          </Button>
        </div>

        <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center gap-2">
                <SortDesc className="h-4 w-4" />
                Newest First
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                Oldest First
              </div>
            </SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedArtworks.length} of {artworks.length} artworks
      </div>

      {/* Artwork Grid */}
      <ArtworkGrid
        artworks={filteredAndSortedArtworks}
        isOwnProfile={isOwnProfile}
        onArtworkUpdate={onArtworkUpdate}
      />
    </div>
  );
};