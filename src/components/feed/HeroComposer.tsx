import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { CreatePostSchema, type CreatePost } from "@/schemas";
import { postAdapter } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { log } from "@/lib/log";
import { Image, Video, Type, Smile, Upload } from "lucide-react";

interface HeroComposerProps {
  onPostCreated?: () => void;
}

const mediaTypes = [
  { type: "text" as const, icon: Type, label: "Text", color: "text-primary" },
  { type: "image" as const, icon: Image, label: "Image", color: "text-accent-warm" },
  { type: "video" as const, icon: Video, label: "Video", color: "text-purple-600" },
  { type: "gif" as const, icon: Smile, label: "GIF", color: "text-green-600" },
];

export const HeroComposer = ({ onPostCreated }: HeroComposerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePost>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      type: "text",
      authorId: user?.id || "",
    },
  });

  const postType = watch("type");
  const content = watch("content");

  const onSubmit = async (data: CreatePost) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await postAdapter.create({
        ...data,
        authorId: user.id,
      });

      log.info("Post created successfully", { type: data.type, authorId: user.id });
      
      toast({
        title: "Post shared!",
        description: "Your post has been shared with your followers.",
      });

      reset();
      onPostCreated?.();
    } catch (error) {
      log.error("Failed to create post", { error: error.message, authorId: user.id });
      
      toast({
        variant: "destructive",
        title: "Failed to share post",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // Handle file drop logic here
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-premium ring-1 ring-border/50 overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User info and greeting */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-brand text-white">
                  {user.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-heading text-foreground">Share your art</h3>
                <p className="text-caption">What's inspiring you today?</p>
              </div>
            </div>

            {/* Media type selector */}
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl">
              {mediaTypes.map(({ type, icon: Icon, label, color }) => (
                <motion.button
                  key={type}
                  type="button"
                  onClick={() => setValue("type", type)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all focus-ring ${
                    postType === type
                      ? "bg-card shadow-soft text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                  whileTap={{ scale: 0.98 }}
                  aria-pressed={postType === type}
                  aria-label={`Select ${label} post type`}
                >
                  <Icon className={`h-4 w-4 ${postType === type ? color : ""}`} />
                  <span>{label}</span>
                </motion.button>
              ))}
            </div>

            {/* Content area */}
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts, process, or artwork story..."
                rows={4}
                {...register("content")}
                className="resize-none border-0 bg-muted/30 focus:bg-muted/50 rounded-xl focus-ring text-base placeholder:text-muted-foreground/70"
                aria-invalid={!!errors.content}
              />
              {errors.content && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.content.message}
                </p>
              )}

              {/* Character count hint */}
              <div className="text-xs text-muted-foreground text-right">
                {content?.length || 0}/280 characters
              </div>
            </div>

            {/* Media upload area for non-text posts */}
            {postType !== "text" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                  isDragOver
                    ? "border-accent-warm bg-accent-warm/5"
                    : "border-border bg-muted/20"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drop your {postType} here or paste a URL
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag and drop or enter a direct link
                    </p>
                  </div>
                  <Input
                    placeholder={`${postType.charAt(0).toUpperCase() + postType.slice(1)} URL`}
                    {...register("mediaUrl")}
                    className="max-w-md focus-ring"
                    aria-invalid={!!errors.mediaUrl}
                  />
                  {errors.mediaUrl && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.mediaUrl.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Your post will be shared with your followers
              </p>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting || !content?.trim()}
                  className="bg-gradient-brand hover:opacity-90 text-white shadow-soft px-8"
                >
                  {isSubmitting ? "Sharing..." : "Share"}
                </Button>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};