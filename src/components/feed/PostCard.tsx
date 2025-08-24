import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { dataService, userAdapter } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { log } from "@/lib/log";
import type { Post, User } from "@/types";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface PostCardProps {
  post: Post;
  onPostUpdate?: () => void;
}

export const PostCard = ({ post, onPostUpdate }: PostCardProps) => {
  const [author, setAuthor] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const authorData = await userAdapter.getById(post.authorId);
        setAuthor(authorData);
      } catch (error) {
        log.error("Failed to load post author", { postId: post.id, error: error.message });
      }
    };

    loadAuthor();
    
    // Check if current user has liked this post
    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.id));
    }
  }, [post.authorId, post.id, post.likedBy, user]);

  const handleLike = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const newIsLiked = await dataService.toggleLike(user.id, post.id, "post");
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
      
      onPostUpdate?.();
    } catch (error) {
      log.error("Failed to toggle like", { postId: post.id, error: error.message });
      toast({
        variant: "destructive",
        title: "Failed to update like",
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (!author) {
    return (
      <Card className="shadow-soft animate-pulse">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-muted rounded" />
              <div className="w-16 h-3 bg-muted rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="w-full h-4 bg-muted rounded" />
            <div className="w-3/4 h-4 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${author.username}`}>
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>
                  {author.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link 
                to={`/profile/${author.username}`}
                className="font-semibold hover:text-primary transition-smooth"
              >
                {author.name}
              </Link>
              <p className="text-caption text-muted-foreground">
                @{author.username} • {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="capitalize">
            {post.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-body whitespace-pre-wrap">{post.content}</p>
        
        {post.mediaUrl && (
          <div className="rounded-lg overflow-hidden">
            {post.type === "image" && (
              <img 
                src={post.mediaUrl} 
                alt="Post content"
                className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            )}
            {post.type === "video" && (
              <video 
                src={post.mediaUrl}
                controls
                className="w-full aspect-video rounded-lg"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
            {post.type === "gif" && (
              <img 
                src={post.mediaUrl} 
                alt="GIF content"
                className="w-full max-h-96 object-contain rounded-lg"
                loading="lazy"
              />
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              disabled={!user || isLoading}
              className={`text-muted-foreground hover:text-accent-warm transition-smooth ${
                isLiked ? "text-accent-warm" : ""
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary transition-smooth"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {post.commentIds?.length || 0}
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary transition-smooth"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};