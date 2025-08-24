import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchMetrics } from "@/lib/apiClient";
import { seedReport } from "@/lib/seedReport";
import { userAdapter, artworkAdapter, postAdapter, purchaseAdapter } from "@/lib/data-service";
import { 
  Activity, Database, Users, Image, FileText, ShoppingCart, 
  TrendingUp, AlertTriangle, CheckCircle, Clock 
} from "lucide-react";

interface SeedCounts {
  users: number;
  artworks: number;
  posts: number;
  events: number;
  tools: number;
  purchases: number;
}

interface SLOMetrics {
  errorRate: number;
  timeoutRate: number;
  circuitBreakerTripRate: number;
  availability: number;
}

export default function AdminDebug() {
  const [seedCounts, setSeedCounts] = useState<SeedCounts | null>(null);
  const [sloMetrics, setSloMetrics] = useState<SLOMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get seed counts
      const counts = await seedReport({
        users: userAdapter,
        artworks: artworkAdapter,
        posts: postAdapter,
        events: { list: () => [] }, // Mock for now
        tools: { list: () => [] }, // Mock for now
        purchases: purchaseAdapter,
      });
      setSeedCounts(counts);

      // Get SLO metrics
      const metrics = fetchMetrics.getSLOs();
      setSloMetrics(metrics);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load debug data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (value: number, threshold: number) => {
    if (value <= threshold) return "default";
    if (value <= threshold * 1.5) return "secondary";
    return "destructive";
  };

  const getStatusIcon = (value: number, threshold: number) => {
    if (value <= threshold) return <CheckCircle className="h-4 w-4" />;
    if (value <= threshold * 1.5) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="rounded-2xl p-6 bg-background border">
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <Database className="h-8 w-8" />
            Admin Debug
          </h1>
          <p className="text-muted-foreground mt-2">
            System health, seed counts, and SLO monitoring
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Seed Counts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Seed Counts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {seedCounts ? (
                <>
                  <div className="flex justify-between">
                    <span>Users:</span>
                    <Badge variant="outline">{seedCounts.users}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Artworks:</span>
                    <Badge variant="outline">{seedCounts.artworks}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Posts:</span>
                    <Badge variant="outline">{seedCounts.posts}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Events:</span>
                    <Badge variant="outline">{seedCounts.events}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tools:</span>
                    <Badge variant="outline">{seedCounts.tools}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchases:</span>
                    <Badge variant="outline">{seedCounts.purchases}</Badge>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">Loading...</div>
              )}
            </CardContent>
          </Card>

          {/* SLO Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SLO Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sloMetrics ? (
                <>
                  <div className="flex justify-between items-center">
                    <span>Error Rate:</span>
                    <Badge variant={getStatusColor(sloMetrics.errorRate, 5)}>
                      {getStatusIcon(sloMetrics.errorRate, 5)}
                      {sloMetrics.errorRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Timeout Rate:</span>
                    <Badge variant={getStatusColor(sloMetrics.timeoutRate, 2)}>
                      {getStatusIcon(sloMetrics.timeoutRate, 2)}
                      {sloMetrics.timeoutRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Circuit Breaker:</span>
                    <Badge variant={getStatusColor(sloMetrics.circuitBreakerTripRate, 1)}>
                      {getStatusIcon(sloMetrics.circuitBreakerTripRate, 1)}
                      {sloMetrics.circuitBreakerTripRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Availability:</span>
                    <Badge variant={getStatusColor(100 - sloMetrics.availability, 5)}>
                      {getStatusIcon(100 - sloMetrics.availability, 5)}
                      {sloMetrics.availability.toFixed(1)}%
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">Loading...</div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <Badge variant="default">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Updated:</span>
                <span className="text-sm text-muted-foreground">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <Button 
                onClick={loadData} 
                disabled={isLoading}
                className="w-full mt-4"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Health Endpoints Info */}
        <Card>
          <CardHeader>
            <CardTitle>Health Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><code>/healthz</code> - Liveness probe (process health)</div>
              <div><code>/readyz</code> - Readiness probe (service health)</div>
              <div><code>/metrics</code> - SLO metrics and system stats</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}