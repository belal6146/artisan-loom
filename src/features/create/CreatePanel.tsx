// CreatePanel - AI image generation interface
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Wand2, Save, Share2 } from "lucide-react";

interface CreatePanelProps {
  onClose?: () => void;
}

export const CreatePanel = ({ onClose }: CreatePanelProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [refImageUrl, setRefImageUrl] = useState("");
  const [strength, setStrength] = useState([0.8]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    const moderationResult = await aiClient.moderate({ text: prompt });
    if (!moderationResult.ok) {
      toast({
        variant: "destructive",
        title: "Content blocked",
        description: "Your prompt contains content that isn't allowed. Please try a different prompt.",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResults([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const styleText = selectedStyles.length > 0 ? `, ${selectedStyles.join(", ")} style` : "";
      const fullPrompt = `${prompt}${styleText}`;

      const result = await aiClient.generateImage({
        prompt: fullPrompt,
        negative: negativePrompt || undefined,
        refImageUrl: refImageUrl || undefined,
        strength: strength[0],
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResults([result.url]);
      
      toast({ title: "Image generated!", description: "Your AI-generated image is ready." });
    } catch (error) {
      log.error("Failed to generate image", { error: error.message });
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Failed to generate image. Please try again.",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const saveArtwork = async (privacy: "public" | "private") => {
    if (!selectedResult || !user) return;

    try {
      await artworkAdapter.create({
        userId: user.id,
        title: `AI Generated: ${prompt.substring(0, 50)}...`,
        description: `Generated with prompt: "${prompt}"`,
        imageUrl: selectedResult,
        category: "digital",
        forSale: false,
        privacy,
        meta: { aiGenerated: true, tags: selectedStyles },
      });

      toast({
        title: privacy === "public" ? "Published!" : "Saved as draft",
        description: `Your AI-generated artwork is now ${privacy}.`,
      });
      
      onClose?.();
    } catch (error) {
      log.error(`Failed to ${privacy === "public" ? "publish" : "save draft"}`, { error: error.message });
      toast({
        variant: "destructive",
        title: `${privacy === "public" ? "Publish" : "Save"} failed`,
        description: "Failed to save artwork. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Create with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Describe the image you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <FieldHint>Be specific about what you want. Avoid referencing living artists.</FieldHint>
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <ChipGroup options={IMAGE_STYLES} selected={selectedStyles} onChange={setSelectedStyles} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="negative">Negative Prompt (Optional)</Label>
          <Input
            id="negative"
            placeholder="What to avoid in the image..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Reference Image URL (Optional)</Label>
          <Input
            id="reference"
            placeholder="https://example.com/image.jpg"
            value={refImageUrl}
            onChange={(e) => setRefImageUrl(e.target.value)}
          />
        </div>

        {refImageUrl && (
          <div className="space-y-2">
            <Label>Strength: {strength[0]}</Label>
            <Slider value={strength} onValueChange={setStrength} min={0.1} max={1} step={0.1} />
            <FieldHint>Lower values stay closer to the reference image</FieldHint>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full">
          <Wand2 className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate Image"}
        </Button>

        {isGenerating && <ProgressBar value={progress} showText className="mt-4" />}

        {results.length > 0 && (
          <div className="space-y-4">
            <Label>Generated Images</Label>
            <div className="grid gap-4">
              {results.map((url, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={url}
                    alt={`Generated image ${index + 1}`}
                    className={`w-full rounded-lg cursor-pointer transition-all ${
                      selectedResult === url ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedResult(url)}
                    loading="lazy"
                  />
                  <div className="text-xs text-muted-foreground">⚡ AI-generated content</div>
                </div>
              ))}
            </div>

            {selectedResult && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => saveArtwork("private")} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={() => saveArtwork("public")} className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};