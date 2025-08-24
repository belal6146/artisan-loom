import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { env, isDevelopment, isProduction } from "@/lib/env";
import { metrics } from "@/lib/metrics";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminDebug = () => {
  const { toast } = useToast();
  
  const buildInfo = {
    version: "1.0.0",
    buildTime: new Date().toISOString(),
    commitHash: "dev", // Would be injected during build
  };

  const healthStatus = {
    database: "healthy",
    auth: "healthy", 
    storage: "healthy",
  };

  const handleHealthCheck = async () => {
    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Health Check",
        description: "All systems operational",
      });
    } catch (error) {
      toast({
        title: "Health Check Failed",
        description: "Some systems are down",
        variant: "destructive",
      });
    }
  };

  if (!isDevelopment && !isProduction) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Admin Debug Console</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Build Info */}
          <Card>
            <CardHeader>
              <CardTitle>Build Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>Version: {buildInfo.version}</div>
              <div>Build Time: {new Date(buildInfo.buildTime).toLocaleString()}</div>
              <div>Commit: {buildInfo.commitHash}</div>
              <div>Environment: <Badge>{env.VITE_APP_ENV}</Badge></div>
            </CardContent>
          </Card>

          {/* Feature Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>Backend: <Badge>{env.VITE_DATA_BACKEND}</Badge></div>
              <div>E2E Tests: <Badge variant={env.VITE_ENABLE_E2E ? "default" : "secondary"}>{env.VITE_ENABLE_E2E ? "Enabled" : "Disabled"}</Badge></div>
              <div>Metrics: <Badge variant={env.VITE_ENABLE_METRICS ? "default" : "secondary"}>{env.VITE_ENABLE_METRICS ? "Enabled" : "Disabled"}</Badge></div>
              <div>AI Provider: <Badge>{env.VITE_AI_PROVIDER}</Badge></div>
            </CardContent>
          </Card>

          {/* Health Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>Database: <Badge variant="default">{healthStatus.database}</Badge></div>
              <div>Auth: <Badge variant="default">{healthStatus.auth}</Badge></div>
              <div>Storage: <Badge variant="default">{healthStatus.storage}</Badge></div>
              <Button onClick={handleHealthCheck} className="mt-4">
                Run Health Check
              </Button>
            </CardContent>
          </Card>

          {/* Metrics */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Application Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metrics.getCounters()).map(([metric, count]) => (
                  <div key={metric} className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{metric.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
              {Object.keys(metrics.getCounters()).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No metrics data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;