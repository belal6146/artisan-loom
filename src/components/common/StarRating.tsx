import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  interactive = false,
  onRatingChange,
  className 
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5',
  };

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1;
    const isFilled = rating >= starValue;
    const isHalfFilled = rating >= starValue - 0.5 && rating < starValue;

    return (
      <button
        key={index}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onRatingChange?.(starValue)}
        className={cn(
          'text-yellow-400 transition-colors',
          interactive && 'hover:text-yellow-500 cursor-pointer',
          !interactive && 'cursor-default',
          sizeClasses[size]
        )}
        aria-label={`Rate ${starValue} out of ${maxRating} stars`}
      >
        {isFilled ? (
          <Star className={cn(sizeClasses[size], 'fill-current')} />
        ) : isHalfFilled ? (
          <StarHalf className={cn(sizeClasses[size], 'fill-current')} />
        ) : (
          <Star className={cn(sizeClasses[size], 'stroke-current')} />
        )}
      </button>
    );
  });

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {stars}
      {!interactive && (
        <span className="text-sm text-muted-foreground ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};