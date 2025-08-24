// RemixModal - Image-to-image generation interface
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChipGroup } from "@/components/common/ChipGroup";
import { ProgressBar } from "@/components/common/ProgressBar";
import { FieldHint } from "@/components/common/FieldHint";
import { useToast } from "@/hooks/use-toast";
import { aiClient } from "@/lib/aiClient";
import { artworkAdapter } from "@/lib/data-service";
import { useAuthStore } from "@/store/auth";
import { log } from "@/lib/log";
import { IMAGE_STYLES } from "@/types/ai";
import { Wand2, Save } from "lucide-react";
import type { Artwork } from "@/types";

interface RemixModalProps {
  artwork: Artwork;
  isOpen: boolean;
  onClose: () => void;
}

export const RemixModal = ({ artwork, isOpen, onClose }: RemixModalProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [strength, setStrength] = useState([0.7]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleRemix = async () => {
    if (!prompt.trim() || !user) return;

    const moderationResult = await aiClient.moderate({ text: prompt });
    if (!moderationResult.ok) {
      toast({
        variant: "destructive",
        title: "Content blocked",
        description: "Your prompt contains content that isn't allowed.",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      const styleText = selectedStyles.length > 0 ? `, ${selectedStyles.join(", ")} style` : "";
      const fullPrompt = `${prompt}${styleText}`;

      const generatedImage = await aiClient.generateImage({
        prompt: fullPrompt,
        refImageUrl: artwork.imageUrl,
        negative: negativePrompt || undefined,
        strength: strength[0],
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(generatedImage.url);
      
      toast({ title: "Remix complete!", description: "Your remixed image is ready." });
    } catch (error) {
      log.error("Failed to remix image", { error: error.message });
      toast({
        variant: "destructive",
        title: "Remix failed",
        description: "Failed to remix image. Please try again.",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;

    try {
      await artworkAdapter.create({
        userId: user.id,
        title: `Remix of "${artwork.title}"`,
        description: `Remixed with prompt: "${prompt}"`,
        imageUrl: result,
        category: "digital",
        forSale: false,
        privacy: "private",
        meta: {
          aiGenerated: true,
          tags: selectedStyles,
          originalArtworkId: artwork.id,
        },
      });

      toast({ title: "Remix saved!", description: "Your remixed artwork has been saved as a draft." });
      onClose();
    } catch (error) {
      log.error("Failed to save remix", { error: error.message });
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Failed to save remix. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Remix Artwork</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Original</Label>
              <img src={artwork.imageUrl} alt={artwork.title} className="w-full rounded-lg border" loading="lazy" />
            </div>
            <div>
              <Label>Preview</Label>
              {result ? (
                <div className="space-y-2">
                  <img src={result} alt="Remixed artwork" className="w-full rounded-lg border" loading="lazy" />
                  <div className="text-xs text-muted-foreground">⚡ AI-generated remix</div>
                </div>
              ) : (
                <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Result will appear here</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remix-prompt">Remix Prompt</Label>
            <Input
              id="remix-prompt"
              placeholder="How should this be transformed?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <FieldHint>Describe how you want to modify the original image</FieldHint>
          </div>

          <div className="space-y-2">
            <Label>Style</Label>
            <ChipGroup options={IMAGE_STYLES} selected={selectedStyles} onChange={setSelectedStyles} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remix-negative">Negative Prompt (Optional)</Label>
            <Input
              id="remix-negative"
              placeholder="What to avoid..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Strength: {strength[0]}</Label>
            <Slider value={strength} onValueChange={setStrength} min={0.1} max={1} step={0.1} />
            <FieldHint>Lower values stay closer to the original image</FieldHint>
          </div>

          {isGenerating && <ProgressBar value={progress} showText />}

          <div className="flex gap-2">
            <Button onClick={handleRemix} disabled={isGenerating || !prompt.trim()} className="flex-1">
              <Wand2 className="h-4 w-4 mr-2" />
              {isGenerating ? "Remixing..." : "Remix"}
            </Button>
            
            {result && (
              <Button onClick={handleSave} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};