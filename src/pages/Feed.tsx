import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Plus } from "lucide-react";

// Mock data for demonstration
const mockPosts = [
  {
    id: "1",
    author: {
      name: "Elena Rodriguez",
      username: "elena_art",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    content: "Just finished this abstract piece exploring the relationship between light and shadow. What do you think?",
    mediaUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    likes: 42,
    comments: 8,
    createdAt: "2h ago",
    category: "painting",
  },
  {
    id: "2",
    author: {
      name: "Marcus Chen",
      username: "marcus_sculptures",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    content: "Working on a new ceramic series inspired by ocean waves. The textures are everything! 🌊",
    mediaUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    likes: 73,
    comments: 15,
    createdAt: "4h ago",
    category: "sculpture",
  },
];

export default function Feed() {
  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Create Post */}
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback>DU</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="flex-1 justify-start text-muted-foreground">
                  Share your latest artwork...
                </Button>
                <Button size="sm" className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            {mockPosts.map((post) => (
              <Card key={post.id} className="shadow-soft">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.author.name}</p>
                        <p className="text-caption">@{post.author.username} • {post.createdAt}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {post.category}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-body">{post.content}</p>
                  
                  {post.mediaUrl && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={post.mediaUrl} 
                        alt="Post content"
                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent-warm">
                        <Heart className="h-4 w-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.comments}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load more posts
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}