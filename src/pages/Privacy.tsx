import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { getStoredConsent, setStoredConsent, detectGPC, type ConsentState } from "@/lib/privacy";
import { 
  Shield, Download, Trash2, Edit, Ban, Settings, 
  FileText, Users, Globe, Lock, AlertTriangle, CheckCircle 
} from "lucide-react";

interface DSARJob {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  downloadUrl?: string;
  createdAt: string;
}

export default function Privacy() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [gpcDetected, setGpcDetected] = useState(false);
  const [activeJobs, setActiveJobs] = useState<DSARJob[]>([]);
  const [rectifyData, setRectifyData] = useState({ name: "", bio: "", location: "" });
  const [deleteReason, setDeleteReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const currentConsent = getStoredConsent();
    const gpc = detectGPC();
    
    setConsent(currentConsent);
    setGpcDetected(gpc);
    
    // Load active DSAR jobs
    loadActiveJobs();
  }, []);

  const loadActiveJobs = async () => {
    try {
      const jobs = await apiClient.get<DSARJob[]>("/api/privacy/jobs");
      setActiveJobs(jobs.filter(job => job.status !== "completed" && job.status !== "failed"));
    } catch (error) {
      console.error("Failed to load DSAR jobs:", error);
    }
  };

  const handleConsentUpdate = (updates: Partial<ConsentState>) => {
    if (!consent) return;
    
    const newConsent = { ...consent, ...updates };
    setStoredConsent(newConsent);
    setConsent(newConsent);
    
    toast({
      title: "Preferences updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleDataExport = async () => {
    try {
      const response = await apiClient.post<{ jobId: string }>("/api/privacy/export", {});
      
      toast({
        title: "Export started",
        description: "We'll prepare your data for download. This may take a few minutes.",
      });
      
      loadActiveJobs();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Please try again later.",
      });
    }
  };

  const handleDataRectification = async () => {
    try {
      await apiClient.post("/api/privacy/rectify", rectifyData);
      
      toast({
        title: "Data updated",
        description: "Your information has been corrected.",
      });
      
      setRectifyData({ name: "", bio: "", location: "" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Please try again later.",
      });
    }
  };

  const handleAccountDeletion = async () => {
    if (!deleteReason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason required",
        description: "Please provide a reason for account deletion.",
      });
      return;
    }

    try {
      await apiClient.post("/api/privacy/delete", { reason: deleteReason });
      
      toast({
        title: "Deletion scheduled",
        description: "Your account will be deleted in 30 days. You can cancel this within the grace period.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: "Please contact support for assistance.",
      });
    }
  };

  const handleProcessingRestriction = async () => {
    try {
      await apiClient.post("/api/privacy/restrict", {});
      
      toast({
        title: "Processing restricted",
        description: "Non-essential data processing has been restricted for your account.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "Please try again later.",
      });
    }
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-accent-warm" />
              <h1 className="text-heading-xl">Privacy Center</h1>
            </div>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Manage your privacy preferences, access your data, and exercise your rights under GDPR and UK GDPR.
            </p>
            {gpcDetected && (
              <Badge variant="outline" className="border-accent-warm text-accent-warm">
                <Shield className="h-3 w-3 mr-1" />
                Global Privacy Control Active
              </Badge>
            )}
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Consent Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cookie Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Essential Cookies</Label>
                      <p className="text-xs text-muted-foreground">Required for core functionality</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Analytics</Label>
                      <p className="text-xs text-muted-foreground">Usage analytics and performance</p>
                    </div>
                    <Switch
                      checked={consent?.analytics ?? false}
                      disabled={gpcDetected}
                      onCheckedChange={(checked) => handleConsentUpdate({ analytics: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Marketing</Label>
                      <p className="text-xs text-muted-foreground">Personalized content and ads</p>
                    </div>
                    <Switch
                      checked={consent?.marketing ?? false}
                      disabled={gpcDetected}
                      onCheckedChange={(checked) => handleConsentUpdate({ marketing: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">AI Features</Label>
                      <p className="text-xs text-muted-foreground">AI-powered tools and recommendations</p>
                    </div>
                    <Switch
                      checked={consent?.aiFeatures ?? false}
                      onCheckedChange={(checked) => handleConsentUpdate({ aiFeatures: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Access & Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get a copy of all your data including artworks, posts, and account information.
                </p>
                
                {activeJobs.filter(job => job.type === "export").map(job => (
                  <div key={job.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Export in progress...</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} />
                  </div>
                ))}
                
                <Button onClick={handleDataExport} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Start Data Export
                </Button>
              </CardContent>
            </Card>

            {/* Data Rectification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Correct Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Update or correct personal information in your profile.
                </p>
                
                <div className="space-y-3">
                  <Input
                    placeholder="Name"
                    value={rectifyData.name}
                    onChange={(e) => setRectifyData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Location"
                    value={rectifyData.location}
                    onChange={(e) => setRectifyData(prev => ({ ...prev, location: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Bio"
                    value={rectifyData.bio}
                    onChange={(e) => setRectifyData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleDataRectification} className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Information
                </Button>
              </CardContent>
            </Card>

            {/* Processing Restriction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Restrict Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Limit how we process your data while keeping your account active.
                </p>
                
                <Button onClick={handleProcessingRestriction} className="w-full" variant="outline">
                  <Ban className="h-4 w-4 mr-2" />
                  Restrict Data Processing
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Account Deletion - Full Width */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <Textarea
                placeholder="Please tell us why you're deleting your account..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={3}
              />
              
              <Button 
                onClick={handleAccountDeletion} 
                variant="destructive"
                disabled={!deleteReason.trim()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Button variant="outline" size="sm" onClick={() => window.open("/privacy-policy", "_blank")}>
              <FileText className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open("/terms", "_blank")}>
              <FileText className="h-4 w-4 mr-2" />
              Terms of Service
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open("/contact", "_blank")}>
              <Users className="h-4 w-4 mr-2" />
              Contact DPO
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open("/vendors", "_blank")}>
              <Globe className="h-4 w-4 mr-2" />
              Data Partners
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}