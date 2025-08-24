import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Lock } from "lucide-react";

interface StatsCardProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isPrivate?: boolean;
  className?: string;
}

export const StatsCard = ({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  trendValue, 
  isPrivate,
  className 
}: StatsCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-smooth ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {isPrivate && (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {trendValue && (
              <div className={`text-xs flex items-center gap-1 ${getTrendColor()}`}>
                <span>{getTrendIcon()}</span>
                <span>{trendValue}</span>
                <span className="sr-only">
                  {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'no change'}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <Icon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};