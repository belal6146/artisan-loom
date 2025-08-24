import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { aiClient } from "@/lib/aiClient";
import { artworkAdapter } from "@/lib/data-service";
import { useAuthStore } from "@/store/auth";
import { log } from "@/lib/log";
import { CreateArtworkSchema, type CreateArtwork } from "@/schemas";
import { Upload, DollarSign, Tag } from "lucide-react";
import type { Money } from "@/types";

interface ArtworkUploadModalProps {
  onClose: () => void;
  onUpload: () => void;
}

export const ArtworkUploadModal = ({ onClose, onUpload }: ArtworkUploadModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAITagging, setUseAITagging] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateArtwork>({
    resolver: zodResolver(CreateArtworkSchema),
    defaultValues: {
      userId: user?.id || "",
      privacy: "public",
      forSale: false,
    },
  });

  const isForSale = watch("forSale");

  const onSubmit = async (data: CreateArtwork) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const artworkData = {
        ...data,
        userId: user.id,
        // Remove price if not for sale
        price: data.forSale ? data.price : undefined,
      };

      // Auto-tag with AI if enabled
      if (useAITagging && data.imageUrl) {
        setIsTagging(true);
        try {
          const tagResult = await aiClient.tagImage({ imageUrl: data.imageUrl });
          artworkData.meta = {
            tags: tagResult.tags,
            colors: tagResult.colors,
            caption: tagResult.caption,
          };
          
          log.info("AI tagging completed", { 
            tags: tagResult.tags.length,
            colors: tagResult.colors.length 
          });
        } catch (error) {
          log.error("AI tagging failed", { error: error.message });
          // Continue without tagging
        } finally {
          setIsTagging(false);
        }
      }

      await artworkAdapter.create(artworkData);

      log.info("Artwork uploaded successfully", { 
        title: data.title, 
        category: data.category,
        forSale: data.forSale,
        userId: user.id 
      });
      
      toast({
        title: "Artwork uploaded",
        description: useAITagging ? "Your artwork has been uploaded and auto-tagged!" : "Your artwork has been added to your gallery.",
      });

      onUpload();
      onClose();
    } catch (error) {
      log.error("Failed to upload artwork", { error: error.message, userId: user.id });
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Artwork</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter artwork title"
                {...register("title")}
                className="focus-ring"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="focus-ring">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="painting">Painting</SelectItem>
                      <SelectItem value="sculpture">Sculpture</SelectItem>
                      <SelectItem value="handicraft">Handicraft</SelectItem>
                      <SelectItem value="digital">Digital Art</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/artwork.jpg"
              {...register("imageUrl")}
              className="focus-ring"
              aria-invalid={!!errors.imageUrl}
            />
            {errors.imageUrl && (
              <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your artwork, inspiration, or technique..."
              rows={4}
              {...register("description")}
              className="focus-ring resize-none"
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="Where was this created?"
              {...register("location")}
              className="focus-ring"
              aria-invalid={!!errors.location}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="privacy">Privacy</Label>
                <Controller
                  name="privacy"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="forSale" className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  For Sale
                </Label>
                <Controller
                  name="forSale"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="forSale"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {isForSale && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price.amount">Price</Label>
                  <Input
                    id="price.amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register("price.amount", { valueAsNumber: true })}
                    className="focus-ring"
                    aria-invalid={!!errors.price?.amount}
                  />
                  {errors.price?.amount && (
                    <p className="text-sm text-destructive">{errors.price.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price.currency">Currency</Label>
                  <Controller
                    name="price.currency"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value || "USD"}>
                        <SelectTrigger className="focus-ring">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.price?.currency && (
                    <p className="text-sm text-destructive">{errors.price.currency.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="useAITagging"
              checked={useAITagging}
              onCheckedChange={(checked) => setUseAITagging(checked === true)}
            />
            <Label htmlFor="useAITagging" className="flex items-center cursor-pointer">
              <Tag className="h-4 w-4 mr-2" />
              Use AI to auto-tag this artwork
            </Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isTagging}
              className="min-w-[120px]"
            >
              {isTagging ? (
                "Auto-tagging..."
              ) : isSubmitting ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};