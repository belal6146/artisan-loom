// RemixButton - Trigger for image remixing
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RemixModal } from "./RemixModal";
import { Palette } from "lucide-react";
import type { Artwork } from "@/types";

interface RemixButtonProps {
  artwork: Artwork;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const RemixButton = ({ 
  artwork, 
  variant = "outline", 
  size = "sm",
  className 
}: RemixButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Palette className="h-4 w-4 mr-2" />
        Remix
      </Button>

      <RemixModal
        artwork={artwork}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};