import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArtworkUploadModal } from "./ArtworkUploadModal";
import { useToast } from "@/hooks/use-toast";
import { artworkAdapter } from "@/lib/data-service";
import { log } from "@/lib/log";
import type { Artwork } from "@/types";
import { Plus, Eye, EyeOff, DollarSign } from "lucide-react";

interface ArtworkGridProps {
  artworks: Artwork[];
  isOwnProfile: boolean;
  onArtworkUpdate: () => void;
}

export const ArtworkGrid = ({ artworks, isOwnProfile, onArtworkUpdate }: ArtworkGridProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [updatingArtwork, setUpdatingArtwork] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTogglePrivacy = async (artwork: Artwork) => {
    setUpdatingArtwork(artwork.id);
    try {
      const newPrivacy = artwork.privacy === "public" ? "private" : "public";
      await artworkAdapter.update(artwork.id, { privacy: newPrivacy });
      
      log.info("Artwork privacy updated", { artworkId: artwork.id, privacy: newPrivacy });
      toast({
        title: "Privacy updated",
        description: `Artwork is now ${newPrivacy}`,
      });
      
      onArtworkUpdate();
    } catch (error) {
      log.error("Failed to update artwork privacy", { artworkId: artwork.id, error: error.message });
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Please try again.",
      });
    } finally {
      setUpdatingArtwork(null);
    }
  };

  const handleToggleForSale = async (artwork: Artwork) => {
    setUpdatingArtwork(artwork.id);
    try {
      const newForSale = !artwork.forSale;
      const updateData: { forSale: boolean; price?: undefined } = { forSale: newForSale };
      
      // If setting to not for sale, remove price
      if (!newForSale) {
        updateData.price = undefined;
      }
      
      await artworkAdapter.update(artwork.id, updateData);
      
      log.info("Artwork sale status updated", { artworkId: artwork.id, forSale: newForSale });
      toast({
        title: "Sale status updated",
        description: `Artwork is ${newForSale ? "now for sale" : "no longer for sale"}`,
      });
      
      onArtworkUpdate();
    } catch (error) {
      log.error("Failed to update artwork sale status", { artworkId: artwork.id, error: error.message });
      toast({
        variant: "destructive",
        title: "Update failed", 
        description: "Please try again.",
      });
    } finally {
      setUpdatingArtwork(null);
    }
  };

  const visibleArtworks = artworks.filter(artwork => 
    isOwnProfile || artwork.privacy === "public"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg">Artwork</h2>
        {isOwnProfile && (
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Artwork
          </Button>
        )}
      </div>

      {/* Grid */}
      {visibleArtworks.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="pt-6 text-center py-12">
            <h3 className="text-heading mb-2">No artworks yet</h3>
            <p className="text-caption text-muted-foreground mb-6">
              {isOwnProfile 
                ? "Upload your first artwork to showcase your talent" 
                : "This artist hasn't shared any public artworks yet"
              }
            </p>
            {isOwnProfile && (
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Artwork
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleArtworks.map((artwork) => (
            <Card 
              key={artwork.id} 
              className="group cursor-pointer hover:shadow-medium transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden rounded-t-lg relative">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {artwork.privacy === "private" && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold truncate">{artwork.title}</h3>
                  {artwork.description && (
                    <p className="text-caption text-muted-foreground line-clamp-2">
                      {artwork.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">
                    {artwork.category}
                  </Badge>
                  {artwork.forSale && artwork.price && (
                    <span className="font-semibold text-accent-warm">
                      ${artwork.price.amount}
                    </span>
                  )}
                </div>

                {/* Owner controls */}
                {isOwnProfile && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`privacy-${artwork.id}`} className="text-sm">
                        {artwork.privacy === "public" ? (
                          <>
                            <Eye className="h-4 w-4 inline mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 inline mr-1" />
                            Private
                          </>
                        )}
                      </Label>
                      <Switch
                        id={`privacy-${artwork.id}`}
                        checked={artwork.privacy === "public"}
                        onCheckedChange={() => handleTogglePrivacy(artwork)}
                        disabled={updatingArtwork === artwork.id}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`sale-${artwork.id}`} className="text-sm">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        For Sale
                      </Label>
                      <Switch
                        id={`sale-${artwork.id}`}
                        checked={artwork.forSale}
                        onCheckedChange={() => handleToggleForSale(artwork)}
                        disabled={updatingArtwork === artwork.id}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <ArtworkUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={onArtworkUpdate}
        />
      )}
    </div>
  );
};