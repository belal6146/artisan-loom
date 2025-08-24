import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { track } from "@/lib/track";
import { aiClient } from "@/lib/aiClient";
import { log } from "@/lib/log";
import { IMAGE_STYLES, type AIProvider } from "@/types/ai";

const PROVIDERS: AIProvider[] = ["gemini", "openai", "deepseek", "local"];

export default function AIStyleExplorerTab() {
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [style, setStyle] = useState<string | undefined>(undefined);
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [strength, setStrength] = useState([0.65]);
  const [refImage, setRefImage] = useState<string | undefined>();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = !!style && prompt.trim().length > 6;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    setIsGenerating(true);
    setGeneratedImage(null);
    track("ai_generate", { provider, style, promptLength: prompt.length });

    try {
      const result = await aiClient.generateImage({
        prompt: `${prompt} in ${style} style`,
        refImageUrl: refImage,
        style,
        negative,
        strength: strength[0]
      });
      
      setGeneratedImage(result.url);
      log.info("AI generation successful", { provider, style });
    } catch (error) {
      log.error("AI generation failed", { provider, style, error: error.message });
      alert("Generation failed. Please try a different prompt or provider.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishDraft = () => {
    track("ai_publish_draft", { provider, style });
    // TODO: Implement artwork draft creation
    alert("Saved as draft (feature coming soon).");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setRefImage(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI Art Style Explorer</h3>
            <p className="text-sm text-muted-foreground">
              Generate artwork using different AI providers and art styles
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <div className="flex gap-2 flex-wrap">
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                    provider === p
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  aria-pressed={provider === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Art Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger aria-label="Choose an art style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {IMAGE_STYLES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your vision</Label>
            <Textarea
              id="prompt"
              placeholder="A serene landscape with mountains and a lake at sunset..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="negative">Negative prompt (optional)</Label>
            <Input
              id="negative"
              placeholder="Elements to avoid in the image"
              value={negative}
              onChange={(e) => setNegative(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Remix strength: {strength[0].toFixed(2)}</Label>
            <Slider
              value={strength}
              onValueChange={setStrength}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref-image">Reference image (optional)</Label>
            <Input
              id="ref-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Artwork"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Generated images are labeled as AI-created. Content is moderated and artist mimicry is blocked.
          </p>
        </Card>

        <Card className="p-6 flex items-center justify-center min-h-[400px]">
          {generatedImage ? (
            <div className="w-full space-y-4" data-testid="ai-result">
              <img
                src={generatedImage}
                alt="AI generated artwork"
                className="w-full h-auto rounded-lg"
                loading="lazy"
              />
              <div className="text-xs text-muted-foreground">
                AI-generated • {provider} • {style}
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePublishDraft} size="sm">
                  Save as Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGeneratedImage(null)}
                >
                  Generate Another
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                Select a style and enter a prompt to generate AI artwork
              </div>
              {refImage && (
                <div className="mt-4">
                  <img
                    src={refImage}
                    alt="Reference"
                    className="max-w-full max-h-32 rounded border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Reference image</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}