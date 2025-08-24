import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendItem {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

interface TrendListProps {
  title: string;
  items: TrendItem[];
  className?: string;
}

export const TrendList = ({ title, items, className }: TrendListProps) => {
  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '▲';
      case 'down': return '▼';
      default: return '●';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex-1">
                <p className="font-medium">{item.label}</p>
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{item.value}</span>
                <span className={`text-sm ${getTrendColor(item.trend)}`}>
                  {getTrendIcon(item.trend)}
                  <span className="sr-only">
                    {item.trend === 'up' ? 'increase' : item.trend === 'down' ? 'decrease' : 'neutral'}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};