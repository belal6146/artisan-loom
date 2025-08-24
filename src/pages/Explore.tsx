import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter } from "lucide-react";

// Mock data for demonstration
const mockArtworks = [
  {
    id: "1",
    title: "Ocean Dreams",
    artist: "Elena Rodriguez",
    category: "painting",
    price: { amount: 850, currency: "USD" as const },
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    forSale: true,
  },
  {
    id: "2", 
    title: "Urban Rhythm",
    artist: "Marcus Chen",
    category: "sculpture",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    forSale: false,
  },
  {
    id: "3",
    title: "Digital Harmony",
    artist: "Zara Kim",
    category: "handicraft",
    price: { amount: 450, currency: "USD" as const },
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
    forSale: true,
  },
  {
    id: "4",
    title: "Nature's Voice",
    artist: "James Wilson",
    category: "painting",
    price: { amount: 1200, currency: "USD" as const },
    imageUrl: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop",
    forSale: true,
  },
];

const categories = ["all", "painting", "sculpture", "handicraft", "other"];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredArtworks = mockArtworks.filter((artwork) => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || artwork.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-display">Explore Artworks</h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl">
              Discover unique pieces from emerging artists around the world. 
              Find your next favorite artwork or artist to follow.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artworks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArtworks.map((artwork) => (
                  <Card 
                    key={artwork.id} 
                    className="group cursor-pointer hover:shadow-medium transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold truncate">{artwork.title}</h3>
                        <p className="text-caption">by {artwork.artist}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize">
                          {artwork.category}
                        </Badge>
                        {artwork.forSale && artwork.price && (
                          <span className="font-semibold text-accent-warm">
                            ${artwork.price.amount}
                          </span>
                        )}
                      </div>
                      
                      {artwork.forSale && (
                        <Button className="w-full" size="sm">
                          View Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredArtworks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No artworks found matching your criteria.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}