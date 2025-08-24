import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateShort, formatMoney } from "@/lib/date";

interface TimelineItem {
  purchasedAt: string;
  artworkId: string;
  price: {
    amount: number;
    currency: string;
  };
  artworkTitle?: string;
  artistName?: string;
}

interface TimelineProps {
  title: string;
  items: TimelineItem[];
  className?: string;
}

export const Timeline = ({ title, items, className }: TimelineProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No purchase history yet
            </p>
          ) : (
            <ul className="space-y-3" role="list">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.artworkTitle || `Artwork ${item.artworkId.slice(-6)}`}
                        </p>
                        {item.artistName && (
                          <p className="text-xs text-muted-foreground">
                            by {item.artistName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(item.purchasedAt)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-semibold text-sm">
                          {formatMoney(item.price.amount, item.price.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};