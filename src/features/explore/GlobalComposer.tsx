import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { postAdapter } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import type { ExploreTab } from "@/lib/filters";
import { 
  Plus, 
  Type, 
  Image, 
  Video, 
  Sparkles,
  X
} from "lucide-react";

interface GlobalComposerProps {
  currentTab: ExploreTab;
  onPostCreated?: () => void;
  className?: string;
}

const postTypes = [
  { type: "text", label: "Text", icon: Type },
  { type: "image", label: "Image", icon: Image },
  { type: "video", label: "Video", icon: Video },
  { type: "gif", label: "GIF", icon: Sparkles },
] as const;

const getTabPrompt = (tab: ExploreTab): string => {
  const prompts = {
    "for-you": "Share what's inspiring you today...",
    "following": "Update your followers...",
    "nearby": "What's happening in your area?",
    "trending": "Join the conversation...",
    "collaborations": "Pitch a collaboration idea...",
    "learn": "Share a learning resource or tip...",
  };
  return prompts[tab];
};

export const GlobalComposer = ({ currentTab, onPostCreated, className }: GlobalComposerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState<"text" | "image" | "video" | "gif">("text");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await postAdapter.create({
        type: selectedType,
        content: content.trim(),
        mediaUrl: selectedType !== "text" ? mediaUrl : undefined,
      });

      toast({
        title: "Post created",
        description: "Your post has been shared successfully",
      });

      setContent("");
      setMediaUrl("");
      setIsExpanded(false);
      onPostCreated?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create post",
        description: "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFloatingClick = () => {
    setIsExpanded(true);
  };

  if (!user) return null;

  // Floating action button (mobile)
  if (!isExpanded) {
    return (
      <>
        <Button
          onClick={handleFloatingClick}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 md:hidden"
          aria-label="Create post"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Hero composer (desktop) */}
        <Card className={`hidden md:block mb-6 ${className}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleFloatingClick}
                className="flex-1 text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-smooth text-muted-foreground"
              >
                {getTabPrompt(currentTab)}
              </button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Expanded composer
  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              aria-label="Close composer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Post type selector */}
          <div className="flex gap-2">
            {postTypes.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-smooth ${
                  selectedType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content input */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={getTabPrompt(currentTab)}
            className="min-h-[100px] resize-none"
            maxLength={2000}
          />

          {/* Media URL input for non-text posts */}
          {selectedType !== "text" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedType === "image" ? "Image URL" : 
                 selectedType === "video" ? "Video URL" : "GIF URL"}
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={`Enter ${selectedType} URL...`}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>
          )}

          {/* Character count and actions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {content.length}/2000
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting || content.length > 2000}
              >
                {isSubmitting ? "Sharing..." : "Share"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};