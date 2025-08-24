import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/date";
import type { User } from "@/types";
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  Settings,
  ExternalLink,
  Share,
  UserPlus,
  UserMinus
} from "lucide-react";

interface ProfileHeaderProps {
  user: User;
  artworkCount: number;
  postCount: number;
  salesCount?: number;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onEdit: () => void;
}

export const ProfileHeader = ({
  user,
  artworkCount,
  postCount,
  salesCount,
  isOwnProfile,
  isFollowing,
  onFollow,
  onEdit
}: ProfileHeaderProps) => {
  const [isSticky, setIsSticky] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY >= 24);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name} on Artisan`,
          text: user.bio || `Check out ${user.name}'s profile`,
          url: window.location.href,
        });
      } catch (err) {
        // Share was cancelled or failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const getDomain = (url?: string) => {
    if (!url) return null;
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <>
      {/* Cover area with gradient */}
      <div className="h-32 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-t-2xl"></div>
      
      <Card className="shadow-elegant -mt-16 relative">
        <CardContent className="pt-20 pb-6 px-6">
          {/* Avatar positioned over cover */}
          <Avatar className="absolute -top-16 left-6 h-32 w-32 border-4 border-background shadow-soft">
            <AvatarImage 
              src={user.avatar} 
              alt={`${user.name}'s profile picture`}
              loading="lazy"
              width={128}
              height={128}
            />
            <AvatarFallback className="text-2xl bg-primary/10">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-4">
            {/* Name and actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <div>
                  <h1 className="text-heading-xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
                
                {user.bio && (
                  <p className="text-body max-w-2xl">{user.bio}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {isOwnProfile ? (
                  <>
                    <Button onClick={onEdit} variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button onClick={handleShare} variant="outline" size="icon">
                      <Share className="h-4 w-4" />
                      <span className="sr-only">Share profile</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={onFollow}>
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Meta information */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              
              {user.website && (
                <a 
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-smooth"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{getDomain(user.website)}</span>
                </a>
              )}
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-2">
              <div className="text-center">
                <p className="font-bold text-lg">{postCount}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              
              <div className="text-center">
                <p className="font-bold text-lg">{artworkCount}</p>
                <p className="text-sm text-muted-foreground">Artworks</p>
              </div>
              
              <button className="text-center hover:text-primary transition-smooth">
                <p className="font-bold text-lg">{user.followers.length}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </button>
              
              <button className="text-center hover:text-primary transition-smooth">
                <p className="font-bold text-lg">{user.following.length}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </button>
              
              {salesCount !== undefined && (
                <div className="text-center">
                  <p className="font-bold text-lg">{salesCount}</p>
                  <p className="text-sm text-muted-foreground">Sales</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky action bar */}
      {isSticky && (
        <div className="fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 py-2">
          <div className="container max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button onClick={onEdit} size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <Button onClick={onFollow} size="sm">
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};