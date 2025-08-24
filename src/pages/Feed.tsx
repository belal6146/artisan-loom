import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { HeroComposer } from "@/components/feed/HeroComposer";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyFeedState } from "@/components/feed/EmptyFeedState";
import { RecommendationsStrip } from "@/components/feed/RecommendationsStrip";
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
      <div className="container py-6 md:py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-heading-lg">Your Feed</h1>
              <p className="text-caption text-muted-foreground mt-1">
                Discover and share inspiring artwork
              </p>
            </div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Composer */}
          <HeroComposer onPostCreated={handlePostCreated} />

          {/* Posts Feed or Empty State */}
          <div className="space-y-8">
            {posts.length === 0 ? (
              <>
                <EmptyFeedState 
                  onRefresh={handleRefresh} 
                  isRefreshing={isRefreshing}
                />
                <RecommendationsStrip />
              </>
            ) : (
              <>
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <PostCard 
                        post={post} 
                        onPostUpdate={loadPosts}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Load More */}
                <motion.div 
                  className="text-center pt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="px-8"
                    >
                      Load more posts
                    </Button>
                  </motion.div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}