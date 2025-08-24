import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DomainBadge } from "@/components/common/DomainBadge";
import { StarRating } from "@/components/common/StarRating";
import Img from "@/components/common/Img";
import { formatRelativeTime, formatMoney } from "@/lib/date";
import { useAuthStore } from "@/store/auth";
import { dataService } from "@/lib/data-service";
import { motion, focus, cardBase } from "@/lib/a11y";
import type { Post, Artwork, Collaboration, Resource } from "@/schemas";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  UserPlus,
  ShoppingCart,
  Info,
  ExternalLink,
  Users,
  Calendar,
  MapPin
} from "lucide-react";

type UnifiedCardItem = Post | Artwork | Collaboration | Resource;

interface UnifiedCardProps {
  item: UnifiedCardItem;
  onOpenDetail?: (item: UnifiedCardItem) => void;
  onLike?: (itemId: string) => void;
  onSave?: (itemId: string) => void;
  onFollow?: (userId: string) => void;
  className?: string;
}

const getItemType = (item: UnifiedCardItem): 'post' | 'artwork' | 'collaboration' | 'resource' => {
  if ('type' in item && typeof item.type === 'string') {
    if (['text', 'image', 'video', 'gif'].includes(item.type)) return 'post';
    if (['video', 'image', 'pdf'].includes(item.type)) return 'resource';
  }
  if ('forSale' in item) return 'artwork';
  if ('compensationType' in item) return 'collaboration';
  return 'post';
};

export const UnifiedCard = ({ 
  item, 
  onOpenDetail, 
  onLike, 
  onSave, 
  onFollow, 
  className 
}: UnifiedCardProps) => {
  const { user: currentUser } = useAuthStore();
  const itemType = getItemType(item);

  const isLiked = currentUser && 'likedBy' in item && item.likedBy?.includes(currentUser.id);
  const isSaved = false; // TODO: implement save functionality
  const authorId = 'authorId' in item ? item.authorId : 'userId' in item ? item.userId : 'creatorId' in item ? item.creatorId : null;
  const isOwnItem = currentUser && authorId === currentUser.id;

  const handleLike = () => {
    if (onLike) onLike(item.id);
  };

  const handleSave = () => {
    if (onSave) onSave(item.id);
  };

  const handleFollow = () => {
    if (onFollow && authorId) onFollow(authorId);
  };

  const handleKnowMore = () => {
    if (onOpenDetail) onOpenDetail(item);
  };

  const renderContent = () => {
    switch (itemType) {
      case 'post':
        const post = item as Post;
        return (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{post.content}</p>
             {post.mediaUrl && (
               <div className="rounded-xl overflow-hidden bg-muted">
                 {post.type === 'image' ? (
                   <Img
                     src={post.mediaUrl}
                     alt="Post media"
                     className="w-full h-auto max-h-96 object-cover"
                     width={600}
                     height={400}
                   />
                 ) : post.type === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    className="w-full h-auto max-h-96"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={post.mediaUrl}
                    alt="GIF"
                    className="w-full h-auto max-h-96 object-cover"
                    loading="lazy"
                  />
                )}
              </div>
            )}
          </div>
        );

      case 'artwork':
        const artwork = item as Artwork;
        return (
           <div className="space-y-3">
             <div className="rounded-xl overflow-hidden bg-muted">
               <Img
                 src={artwork.imageUrl}
                 alt={artwork.title}
                 className="w-full h-auto aspect-square object-cover"
                 width={400}
                 height={400}
               />
             </div>
             <div className="flex items-center gap-2">
               <h3 className="font-semibold text-lg truncate flex-1">{artwork.title}</h3>
               <DomainBadge url={artwork.imageUrl} verified={true} />
             </div>
             {artwork.description && (
               <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                 {artwork.description}
               </p>
             )}
             <div className="flex items-center justify-between gap-2 mt-2">
               <div className="flex items-center gap-2">
                 <Badge variant="secondary" className="text-xs">
                   {artwork.category}
                 </Badge>
               </div>
               {artwork.forSale && artwork.price && (
                 <div className="font-medium">
                   {formatMoney(artwork.price.amount, artwork.price.currency)}
                 </div>
               )}
             </div>
           </div>
         );

      case 'collaboration':
        const collab = item as Collaboration;
        return (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">{collab.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {collab.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {collab.compensationType}
              </Badge>
              {collab.skills.slice(0, 3).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {collab.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{collab.skills.length - 3}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{collab.participants} participants</span>
              </div>
              {collab.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due {formatRelativeTime(collab.deadline)}</span>
                </div>
              )}
              {collab.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{collab.location}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'resource':
        const resource = item as Resource;
        return (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">{resource.title}</h3>
              {resource.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {resource.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {resource.type}
              </Badge>
              {resource.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <DomainBadge url={resource.url} />
          </div>
        );

      default:
        return null;
    }
  };

  const renderActions = () => {
    const actions = [];

    // Like action (for posts, artworks, resources)
    if ('likes' in item) {
      actions.push(
        <Button
          key="like"
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{item.likes}</span>
        </Button>
      );
    }

    // Comments action
    if ('commentIds' in item) {
      actions.push(
        <Button
          key="comments"
          variant="ghost"
          size="sm"
          onClick={handleKnowMore}
          className="flex items-center gap-1"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{item.commentIds.length}</span>
        </Button>
      );
    }

    // Buy action (only for artworks that are for sale)
    if (itemType === 'artwork') {
      const artwork = item as Artwork;
      if (artwork.forSale && artwork.price && !isOwnItem) {
        actions.push(
          <Button
            key="buy"
            size="sm"
            className="flex items-center gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            Buy
          </Button>
        );
      }
    }

    // Know More action (for collaborations)
    if (itemType === 'collaboration') {
      actions.push(
        <Button
          key="know-more"
          variant="outline"
          size="sm"
          onClick={handleKnowMore}
          className="flex items-center gap-1"
        >
          <Info className="h-4 w-4" />
          Know More
        </Button>
      );
    }

    // External link action (for resources)
    if (itemType === 'resource') {
      const resource = item as Resource;
      actions.push(
        <Button
          key="open"
          variant="outline"
          size="sm"
          asChild
        >
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>
        </Button>
      );
    }

    // Save action
    actions.push(
      <Button
        key="save"
        variant="ghost"
        size="sm"
        onClick={handleSave}
        className={`flex items-center gap-1 ${isSaved ? 'text-blue-500' : ''}`}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
    );

    return actions.slice(0, 3); // Max 3 actions to avoid clutter
  };

  return (
    <Card className={`${cardBase} ${motion.hover} ${className}`} data-testid="unified-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="Author" />
              <AvatarFallback>
                {/* TODO: Get author info */}
                A
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">Author Name</p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(item.createdAt)}
              </p>
            </div>
          </div>
          
          {!isOwnItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFollow}
              className="flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              Follow
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {renderContent()}
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            {renderActions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};