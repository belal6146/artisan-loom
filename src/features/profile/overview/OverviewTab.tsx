import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArtworkGrid } from "@/components/profile/ArtworkGrid";
import { SimilarCarousel } from "@/features/similar/SimilarCarousel";
import { dataService } from "@/lib/data-service";
import { formatRelativeTime } from "@/lib/date";
import type { User, Artwork, Post } from "@/types";
import { Pin, Calendar, MapPin, ExternalLink } from "lucide-react";

interface OverviewTabProps {
  user: User;
  artworks: Artwork[];
  isOwnProfile: boolean;
  onArtworkUpdate: () => void;
  className?: string;
}

export const OverviewTab = ({ 
  user, 
  artworks, 
  isOwnProfile, 
  onArtworkUpdate,
  className 
}: OverviewTabProps) => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [pinnedArtworks, setPinnedArtworks] = useState<Artwork[]>([]);
  
  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        const posts = await dataService.getUserPosts(user.id);
        setRecentPosts(posts.slice(0, 3));
      } catch (error) {
        console.error("Failed to load recent posts:", error);
      }
    };

    loadRecentActivity();
  }, [user.id]);

  useEffect(() => {
    // Show up to 6 pinned artworks (for now, just take the first 6)
    setPinnedArtworks(artworks.slice(0, 6));
  }, [artworks]);

  const getDomain = (url?: string) => {
    if (!url) return null;
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Pinned Works */}
      {pinnedArtworks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Pin className="h-5 w-5" />
              {isOwnProfile ? "Pinned Works" : `Featured Works`}
            </h3>
            {isOwnProfile && (
              <Button variant="outline" size="sm">
                Manage Pins
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedArtworks.map((artwork) => (
              <Card key={artwork.id} className="group hover:shadow-md transition-smooth overflow-hidden">
                <div className="aspect-square bg-muted">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium truncate">{artwork.title}</h4>
                  <p className="text-sm text-muted-foreground">{artwork.category}</p>
                  {artwork.forSale && artwork.price && (
                    <p className="text-sm font-semibold text-primary">
                      {artwork.price.currency} {artwork.price.amount / 100}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* About Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>About {user.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.bio ? (
              <p className="text-body leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-muted-foreground italic">
                {isOwnProfile ? "Add a bio to tell others about yourself" : "No bio available"}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatRelativeTime(user.createdAt)}</span>
              </div>
              
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-smooth"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{getDomain(user.website)}</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      {recentPosts.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-sm transition-smooth">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">
                      {post.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{formatRelativeTime(post.createdAt)}</span>
                        <span>{post.likes} likes</span>
                        <span>{post.commentIds.length} comments</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Similar Artists */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Similar Artists</h3>
        <SimilarCarousel />
      </section>
    </div>
  );
};