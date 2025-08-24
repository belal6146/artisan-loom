import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NewPost } from "@/components/feed/NewPost";
import { PostCard } from "@/components/feed/PostCard";
import { useAuthStore } from "@/store/auth";
import { dataService } from "@/lib/data-service";
import { log } from "@/lib/log";
import type { Post } from "@/types";
import { RefreshCw } from "lucide-react";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuthStore();

  const loadPosts = async () => {
    if (!user) return;

    try {
      const feedPosts = await dataService.getFeedPosts(user.id);
      setPosts(feedPosts);
      log.info("Feed posts loaded", { count: feedPosts.length, userId: user.id });
    } catch (error) {
      log.error("Failed to load feed posts", { error: error.message, userId: user.id });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [user]);

  const handlePostCreated = () => {
    loadPosts();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPosts();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-heading-lg">Your Feed</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Create Post */}
          <NewPost onPostCreated={handlePostCreated} />

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-heading mb-2">No posts yet</h3>
                <p className="text-caption text-muted-foreground mb-6">
                  Follow some artists to see their posts in your feed, or create your first post above.
                </p>
                <Button variant="outline" onClick={handleRefresh}>
                  Check for new posts
                </Button>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onPostUpdate={loadPosts}
                  />
                ))}
                
                {/* Load More */}
                <div className="text-center pt-6">
                  <Button variant="outline" size="lg">
                    Load more posts
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}