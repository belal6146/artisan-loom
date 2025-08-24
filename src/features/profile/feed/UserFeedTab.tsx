import { useState, useEffect } from "react";
import { PostCard } from "@/components/feed/PostCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dataService } from "@/lib/data-service";
import type { Post } from "@/types";
import { MessageSquare, Heart } from "lucide-react";

interface UserFeedTabProps {
  userId: string;
  isOwnProfile: boolean;
  className?: string;
}

export const UserFeedTab = ({ userId, isOwnProfile, className }: UserFeedTabProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const userPosts = await dataService.getUserPosts(userId);
        setPosts(userPosts);
        setHasMore(userPosts.length >= 20); // Assuming page size of 20
      } catch (error) {
        console.error("Failed to load user posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [userId]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    try {
      // In a real app, this would load the next page
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasMore(false);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const getTotalLikes = () => posts.reduce((sum, post) => sum + post.likes, 0);
  const getTotalComments = () => posts.reduce((sum, post) => sum + post.commentIds.length, 0);

  if (isLoading) {
    return (
      <div className={`py-8 flex items-center justify-center ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Summary */}
      {posts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {isOwnProfile ? "Your Posts" : "Posts"}
              </h3>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{getTotalLikes()} total likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{getTotalComments()} total comments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-semibold mb-2">No posts yet</h4>
            <p className="text-sm text-muted-foreground">
              {isOwnProfile 
                ? "Share your first post to get started" 
                : "This user hasn't shared any posts yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {hasMore && (
            <div className="text-center pt-4">
              <Button 
                onClick={handleLoadMore} 
                variant="outline"
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More Posts"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};