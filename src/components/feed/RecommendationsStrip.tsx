import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChipGroup } from "@/components/common/ChipGroup";
import { useAuthStore } from "@/store/auth";
import { Users, Palette } from "lucide-react";

const FEATURED_ARTISTS = [
  { id: "1", name: "Maya Chen", username: "mayaart", avatar: "/placeholder.svg" },
  { id: "2", name: "David Kim", username: "dkim.studio", avatar: "/placeholder.svg" },
  { id: "3", name: "Sofia Rodriguez", username: "sofia_creates", avatar: "/placeholder.svg" },
  { id: "4", name: "Alex Thompson", username: "athompsonart", avatar: "/placeholder.svg" },
  { id: "5", name: "Priya Patel", username: "priya.paints", avatar: "/placeholder.svg" },
];

const PROMPT_SUGGESTIONS = [
  "watercolor wash",
  "ukiyo-e style", 
  "cubist portrait",
  "impasto texture",
  "linocut print"
];

interface RecommendationsStripProps {
  onPromptSelect?: (prompt: string) => void;
}

export const RecommendationsStrip = ({ onPromptSelect }: RecommendationsStripProps) => {
  const { user } = useAuthStore();

  const handleFollowArtist = (artistId: string) => {
    // Handle follow logic
    console.log("Following artist:", artistId);
  };

  const handlePromptClick = (prompt: string) => {
    if (onPromptSelect) {
      onPromptSelect(prompt);
    } else {
      // Navigate to Explore with filter
      window.location.href = `/explore?search=${encodeURIComponent(prompt)}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-8"
    >
      {/* Discover Artists */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-brand rounded-lg">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-heading text-foreground">Discover Artists</h3>
            <p className="text-caption">Follow creators making amazing art</p>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {FEATURED_ARTISTS.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex-shrink-0"
            >
              <div className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-card hover:bg-muted/30 transition-colors border border-border/50 min-w-[120px]">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={artist.avatar} 
                    alt={artist.name}
                    loading="lazy"
                    width={48}
                    height={48}
                  />
                  <AvatarFallback className="bg-gradient-brand text-white text-sm">
                    {artist.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground truncate max-w-[100px]">
                    {artist.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                    @{artist.username}
                  </p>
                </div>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={() => handleFollowArtist(artist.id)}
                  >
                    Follow
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Try a Prompt */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-brand rounded-lg">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-heading text-foreground">Try a Prompt</h3>
            <p className="text-caption">Explore different artistic styles and techniques</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((prompt, index) => (
            <motion.div
              key={prompt}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent-warm/10 hover:border-accent-warm transition-colors px-3 py-1.5 text-sm"
                onClick={() => handlePromptClick(prompt)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePromptClick(prompt);
                  }
                }}
              >
                {prompt}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};