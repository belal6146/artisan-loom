import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { RefreshCw, Users, Sparkles } from "lucide-react";

interface EmptyFeedStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const FeedSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-6 rounded-2xl bg-card border border-border/50">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ArtisanIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    className="text-muted-foreground/30"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="artisan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    
    {/* Canvas */}
    <rect x="25" y="30" width="70" height="50" rx="4" fill="url(#artisan-gradient)" stroke="currentColor" strokeWidth="2" />
    
    {/* Easel legs */}
    <line x1="20" y1="30" x2="35" y2="90" stroke="currentColor" strokeWidth="2" />
    <line x1="100" y1="30" x2="85" y2="90" stroke="currentColor" strokeWidth="2" />
    <line x1="60" y1="35" x2="60" y2="95" stroke="currentColor" strokeWidth="2" />
    
    {/* Palette */}
    <ellipse cx="75" cy="100" rx="15" ry="8" fill="url(#artisan-gradient)" stroke="currentColor" strokeWidth="2" />
    
    {/* Paint dots */}
    <circle cx="70" cy="98" r="2" fill="currentColor" opacity="0.4" />
    <circle cx="78" cy="96" r="2" fill="currentColor" opacity="0.4" />
    <circle cx="76" cy="102" r="2" fill="currentColor" opacity="0.4" />
    
    {/* Brush */}
    <line x1="85" y1="85" x2="95" y2="75" stroke="currentColor" strokeWidth="2" />
    <circle cx="96" cy="74" r="2" fill="currentColor" opacity="0.6" />
  </svg>
);

export const EmptyFeedState = ({ onRefresh, isRefreshing }: EmptyFeedStateProps) => {
  const [showingSkeleton, setShowingSkeleton] = useState(false);

  const handleRefresh = async () => {
    setShowingSkeleton(true);
    onRefresh();
    
    // Show skeleton for 2 seconds
    setTimeout(() => {
      setShowingSkeleton(false);
    }, 2000);
  };

  if (showingSkeleton || isRefreshing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <FeedSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16 space-y-8"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center"
      >
        <ArtisanIllustration />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4 max-w-md mx-auto"
      >
        <h3 className="text-heading text-foreground">Your creative feed awaits</h3>
        <p className="text-body text-muted-foreground leading-relaxed">
          Follow inspiring artists to see their latest work, or create your first post to start building your artistic community.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-gradient-brand hover:opacity-90 text-white shadow-soft px-6"
          >
            {isRefreshing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for posts
              </>
            )}
          </Button>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/explore"}
            className="px-6"
          >
            <Users className="h-4 w-4 mr-2" />
            Discover artists
          </Button>
        </motion.div>
      </motion.div>

      {/* Subtle encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="pt-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-warm/5 rounded-full border border-accent-warm/20">
          <Sparkles className="h-4 w-4 text-accent-warm" />
          <span className="text-sm text-accent-warm-foreground">
            Share your art to inspire others
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};