import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/features/profile/header/ProfileHeader";
import { ProfileTabs } from "@/features/profile/tabs/ProfileTabs";
import { InsightsTab } from "@/features/profile/insights/InsightsTab";
import AIStyleExplorerTab from "@/features/profile/AIStyleExplorerTab";
import { useAuthStore } from "@/store/auth";
import { getUserByHandle } from "@/lib/users";
import { artworkAdapter } from "@/lib/data-service";
import { log } from "@/lib/log";
import type { User, Artwork } from "@/types";

// Simple placeholder components for tabs until we create them properly
const SimpleTab = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 text-center text-muted-foreground">{children}</div>
);

type TabValue = "overview" | "artwork" | "feed" | "collaborations" | "connections" | "insights" | "ai-explorer";

export default function Profile() {
  const { id: handle } = useParams();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const { user: currentUser } = useAuthStore();

  // Use React Query for user data with handle lookup
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', handle],
    queryFn: async () => {
      if (!handle) throw new Error('No handle provided');
      
      log.info("Profile lookup", { handle });
      const user = await getUserByHandle(handle);
      
      if (!user) {
        log.warn("User not found", { handle });
        throw new Error(`User not found: ${handle}`);
      }
      
      log.info("Profile loaded", { userId: user.id, username: user.username });
      return user;
    },
    enabled: !!handle,
    retry: false
  });

  const isOwner = currentUser?.id === user?.id;

  // Load artworks when user is available
  useEffect(() => {
    if (!user) return;
    
    const loadArtworks = async () => {
      try {
        const allArtworks = await artworkAdapter.getAll();
        const userArtworks = allArtworks.filter(artwork => artwork.userId === user.id);
        setArtworks(userArtworks);
      } catch (error) {
        log.error("Failed to load artworks", { userId: user.id, error: error.message });
      }
    };
    
    loadArtworks();
  }, [user]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="text-6xl font-bold text-muted-foreground">404</div>
            <h1 className="text-2xl font-semibold">User not found</h1>
            <p className="text-muted-foreground">
              The profile <span className="font-mono bg-muted px-2 py-1 rounded">@{handle}</span> doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const filteredArtworks = artworks.filter(artwork => 
    isOwner || artwork.privacy === 'public'
  );

  // Simple tab content renderer
  const tabContent = () => {
    switch (activeTab) {
      case "ai-explorer":
        return <AIStyleExplorerTab />;
      case "artwork":
        return (
          <SimpleTab>
            <h3 className="text-lg font-semibold mb-2">Artworks</h3>
            <p>Found {filteredArtworks.length} artworks</p>
          </SimpleTab>
        );
      case "feed":
        return <SimpleTab>User feed content coming soon</SimpleTab>;
      case "collaborations":
        return <SimpleTab>Collaborations content coming soon</SimpleTab>;
      case "connections":
        return <SimpleTab>Connections content coming soon</SimpleTab>;
      case "insights":
        return <InsightsTab userId={user.id} isOwnProfile={isOwner} />;
      default:
        return (
          <SimpleTab>
            <h3 className="text-lg font-semibold mb-4">Overview</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Bio</h4>
                <p className="text-sm">{user.bio || 'No bio available'}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Stats</h4>
                <div className="text-sm space-y-1">
                  <p>Artworks: {filteredArtworks.length}</p>
                  <p>Followers: {user.followers?.length || 0}</p>
                  <p>Following: {user.following?.length || 0}</p>
                </div>
              </div>
            </div>
          </SimpleTab>
        );
    }
  };

  return (
    <AppLayout>
      <div className="py-8 space-y-8">
        <div className="grid md:grid-cols-[200px,1fr] gap-6 items-start">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <img 
              src={user.avatar || '/placeholder.svg'} 
              alt={user.name}
              className="size-32 rounded-2xl object-cover shadow-lg"
            />
            {isOwner && (
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              {user.location && (
                <p className="text-sm text-muted-foreground mt-1">{user.location}</p>
              )}
            </div>
            
            <div className="flex gap-6 text-sm">
              <span><strong>{filteredArtworks.length}</strong> Artworks</span>
              <span><strong>{user.followers?.length || 0}</strong> Followers</span>
              <span><strong>{user.following?.length || 0}</strong> Following</span>
            </div>
            
            {user.bio && (
              <p className="text-muted-foreground">{user.bio}</p>
            )}
          </div>
        </div>
        
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwnProfile={!!isOwner}
          extraTabs={isOwner ? [
            {
              key: "ai-explorer",
              label: "AI Explorer", 
              element: <AIStyleExplorerTab />
            }
          ] : []}
        />

        <div>
          {tabContent()}
        </div>
      </div>
    </AppLayout>
  );
}