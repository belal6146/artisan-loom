import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthStore } from "@/store/auth";
import { dataService, userAdapter, artworkAdapter } from "@/lib/data-service";
import { log } from "@/lib/log";
import type { Purchase, User, Artwork } from "@/types";
import { ShoppingBag, TrendingUp, Heart, DollarSign } from "lucide-react";

interface PurchaseWithDetails extends Purchase {
  artwork: Artwork;
  seller: User;
}

export default function Insights() {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState({
    totalSpent: 0,
    totalPurchases: 0,
    favoriteCategory: "",
    averagePrice: 0,
    topArtists: [] as { artist: User; count: number }[],
  });
  const { user } = useAuthStore();

  useEffect(() => {
    const loadPurchases = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const userPurchases = await dataService.getUserPurchases(user.id);
        
        // Enrich purchases with artwork and seller details
        const enrichedPurchases: PurchaseWithDetails[] = [];
        
        for (const purchase of userPurchases) {
          const [artwork, seller] = await Promise.all([
            artworkAdapter.getById(purchase.artworkId),
            artworkAdapter.getById(purchase.artworkId).then(async (artwork) => {
              if (artwork) {
                return userAdapter.getById(artwork.userId);
              }
              return null;
            })
          ]);

          if (artwork && seller) {
            enrichedPurchases.push({
              ...purchase,
              artwork,
              seller,
            });
          }
        }

        setPurchases(enrichedPurchases);
        
        // Calculate insights
        const totalSpent = enrichedPurchases.reduce((sum, p) => sum + p.price.amount, 0);
        const totalPurchases = enrichedPurchases.length;
        const averagePrice = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
        
        // Find favorite category
        const categoryCount = enrichedPurchases.reduce((acc, p) => {
          acc[p.artwork.category] = (acc[p.artwork.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const favoriteCategory = Object.entries(categoryCount).reduce(
          (max, [category, count]) => count > max.count ? { category, count } : max,
          { category: "", count: 0 }
        ).category;

        // Find top artists
        const artistCount = enrichedPurchases.reduce((acc, p) => {
          const artistId = p.seller.id;
          acc[artistId] = (acc[artistId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topArtists = Object.entries(artistCount)
          .map(([artistId, count]) => ({
            artist: enrichedPurchases.find(p => p.seller.id === artistId)!.seller,
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setInsights({
          totalSpent,
          totalPurchases,
          favoriteCategory: favoriteCategory || "None",
          averagePrice,
          topArtists,
        });

        log.info("Purchase insights loaded", { 
          userId: user.id, 
          totalPurchases,
          totalSpent
        });
      } catch (error) {
        log.error("Failed to load purchase insights", { 
          userId: user.id, 
          error: error.message 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, [user]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-display">Your Art Journey</h1>
            <p className="text-body-lg text-muted-foreground">
              Discover insights about your art collecting habits and taste evolution.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insights.totalPurchases}</p>
                    <p className="text-caption text-muted-foreground">Artworks Owned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-accent-warm/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-accent-warm" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${insights.totalSpent.toFixed(0)}</p>
                    <p className="text-caption text-muted-foreground">Total Invested</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${insights.averagePrice.toFixed(0)}</p>
                    <p className="text-caption text-muted-foreground">Avg. Price</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Heart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-bold capitalize">{insights.favoriteCategory}</p>
                    <p className="text-caption text-muted-foreground">Favorite Style</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Timeline */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Your Collection Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-heading mb-2">No purchases yet</h3>
                  <p className="text-caption text-muted-foreground">
                    Start building your art collection by exploring artworks for sale.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={purchase.artwork.imageUrl}
                          alt={purchase.artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{purchase.artwork.title}</h4>
                            <p className="text-caption text-muted-foreground">
                              by {purchase.seller.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-accent-warm">
                              ${purchase.price.amount}
                            </p>
                            <p className="text-caption text-muted-foreground">
                              {new Date(purchase.purchasedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="capitalize">
                            {purchase.artwork.category}
                          </Badge>
                          {purchase.artwork.location && (
                            <Badge variant="outline">
                              {purchase.artwork.location}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Artists */}
          {insights.topArtists.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Your Favorite Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.topArtists.map((item, index) => (
                    <div key={item.artist.id} className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-muted-foreground w-6">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={item.artist.avatar || "/placeholder-avatar.png"}
                            alt={item.artist.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{item.artist.name}</p>
                          <p className="text-caption text-muted-foreground">
                            {item.count} artwork{item.count > 1 ? "s" : ""} purchased
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}