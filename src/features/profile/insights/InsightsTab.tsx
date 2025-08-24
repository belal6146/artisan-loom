import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "./components/StatsCard";
import { TrendList } from "./components/TrendList";
import { Timeline } from "./components/Timeline";
import { insightsClient } from "@/lib/insightsClient";
import { formatMoney } from "@/lib/date";
import type { ProfileInsights, Period } from "@/schemas";
import { 
  Download, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageSquare, 
  ShoppingBag,
  Lock 
} from "lucide-react";

interface InsightsTabProps {
  userId: string;
  isOwnProfile: boolean;
  className?: string;
}

export const InsightsTab = ({ userId, isOwnProfile, className }: InsightsTabProps) => {
  const [insights, setInsights] = useState<ProfileInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    const loadInsights = async () => {
      setIsLoading(true);
      try {
        const data = await insightsClient.getInsights({ userId, period });
        setInsights(data);
      } catch (error) {
        console.error("Failed to load insights:", error);
        setInsights(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadInsights();
  }, [userId, period]);

  const handleExportCSV = () => {
    if (!insights) return;
    
    const csv = insightsClient.exportInsightsCSV(insights);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights-${userId}-${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getPeriodLabel = (p: Period) => {
    const labels = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days', 
      '90d': 'Last 3 months',
      '365d': 'Last year',
      'all': 'All time'
    };
    return labels[p];
  };

  if (isLoading) {
    return (
      <div className={`py-8 flex items-center justify-center ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className={`py-8 text-center ${className}`}>
        <p className="text-muted-foreground">Failed to load insights</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-heading-lg font-bold">Insights</h2>
          <p className="text-muted-foreground">
            {isOwnProfile ? "Your analytics and performance" : "Public creator metrics"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue aria-label="Time period">
                {getPeriodLabel(period)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          {isOwnProfile && (
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Creator Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Creator Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={TrendingUp}
            value={insights.creator.posts}
            label="Posts"
            trend={insights.creator.posts > 0 ? 'up' : 'neutral'}
            trendValue={period !== 'all' ? `in ${getPeriodLabel(period).toLowerCase()}` : undefined}
          />
          
          <StatsCard
            icon={Heart}
            value={insights.creator.likes}
            label="Likes Received"
            trend={insights.creator.likes > 0 ? 'up' : 'neutral'}
          />
          
          <StatsCard
            icon={MessageSquare}
            value={insights.creator.comments}
            label="Comments"
            trend={insights.creator.comments > 0 ? 'up' : 'neutral'}
          />
          
          <StatsCard
            icon={Users}
            value={insights.creator.followersDelta >= 0 ? `+${insights.creator.followersDelta}` : insights.creator.followersDelta}
            label="Follower Change"
            trend={insights.creator.followersDelta > 0 ? 'up' : insights.creator.followersDelta < 0 ? 'down' : 'neutral'}
          />
        </div>
      </div>

      {/* Top Posts */}
      {insights.creator.topPosts.length > 0 && (
        <TrendList
          title="Top Performing Posts"
          items={insights.creator.topPosts.slice(0, 5).map((postId, index) => ({
            label: `Post ${postId.slice(-6)}`,
            value: `#${index + 1}`,
            subtitle: "Most engagement"
          }))}
        />
      )}

      {/* Buyer Analytics (Owner Only) */}
      {isOwnProfile && insights.buyer && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Purchase Analytics</h3>
            <Badge variant="secondary" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Private Metrics
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              icon={ShoppingBag}
              value={insights.buyer.purchases}
              label="Purchases"
              isPrivate
            />
            
            <StatsCard
              value={formatMoney(insights.buyer.totalSpent.amount, insights.buyer.totalSpent.currency)}
              label="Total Spent"
              isPrivate
            />
            
            {insights.buyer.avgPrice && (
              <StatsCard
                value={formatMoney(insights.buyer.avgPrice.amount, insights.buyer.avgPrice.currency)}
                label="Average Price"
                isPrivate
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendList
              title="Top Categories"
              items={insights.buyer.topCategories.map(cat => ({
                label: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
                value: cat.count,
                subtitle: `${cat.count} purchase${cat.count !== 1 ? 's' : ''}`
              }))}
            />
            
            <TrendList
              title="Top Artists"
              items={insights.buyer.topArtists.map(artist => ({
                label: artist.name,
                value: artist.count,
                subtitle: `${artist.count} artwork${artist.count !== 1 ? 's' : ''}`
              }))}
            />
          </div>

          <Timeline
            title="Purchase History"
            items={insights.buyer.timeline.slice(0, 10).map(item => ({
              purchasedAt: item.purchasedAt,
              artworkId: item.artworkId,
              price: {
                amount: item.price.amount,
                currency: item.price.currency
              }
            }))}
          />
        </div>
      )}

      {/* Non-owner message for buyer analytics */}
      {!isOwnProfile && (
        <Card>
          <CardContent className="py-8 text-center">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Purchase Analytics</h4>
            <p className="text-sm text-muted-foreground">
              Purchase insights are only visible to the profile owner
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};