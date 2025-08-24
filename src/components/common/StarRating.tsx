import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showCount?: boolean;
  reviewsCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  showCount = false, 
  reviewsCount, 
  size = "md",
  className 
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const filled = i <= rating;
      const halfFilled = i - 0.5 === rating;
      
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            filled || halfFilled 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-muted-foreground"
          }`}
          aria-hidden="true"
        />
      );
    }
    return stars;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center"
        role="img"
        aria-label={`${rating} out of ${maxRating} stars`}
      >
        {renderStars()}
      </div>
      {showCount && reviewsCount !== undefined && (
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          ({reviewsCount})
        </span>
      )}
    </div>
  );
};