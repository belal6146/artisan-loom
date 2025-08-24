import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";
import { CreatePostSchema, type CreatePost } from "@/schemas";
import { postAdapter } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { log } from "@/lib/log";
import { Image, Video, Type, Smile } from "lucide-react";

interface NewPostProps {
  onPostCreated?: () => void;
}

export const NewPost = ({ onPostCreated }: NewPostProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        title: "Post created",
        description: "Your post has been shared with your followers.",
      });

      reset();
      onPostCreated?.();
    } catch (error) {
      log.error("Failed to create post", { error: error.message, authorId: user.id });
      
      toast({
        variant: "destructive",
        title: "Failed to create post",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="shadow-soft">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              {/* Post type selector */}
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={postType === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("type", "text")}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Text
                </Button>
                <Button
                  type="button"
                  variant={postType === "image" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("type", "image")}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant={postType === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("type", "video")}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button
                  type="button"
                  variant={postType === "gif" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("type", "gif")}
                >
                  <Smile className="h-4 w-4 mr-2" />
                  GIF
                </Button>
              </div>

              {/* Content input */}
              <Textarea
                placeholder="Share your thoughts or describe your artwork..."
                rows={3}
                {...register("content")}
                className="resize-none focus-ring"
                aria-invalid={!!errors.content}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}

              {/* Media URL input for non-text posts */}
              {postType !== "text" && (
                <div>
                  <Input
                    placeholder={`${postType.charAt(0).toUpperCase() + postType.slice(1)} URL`}
                    {...register("mediaUrl")}
                    className="focus-ring"
                    aria-invalid={!!errors.mediaUrl}
                  />
                  {errors.mediaUrl && (
                    <p className="text-sm text-destructive">{errors.mediaUrl.message}</p>
                  )}
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};