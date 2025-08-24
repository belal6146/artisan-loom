import { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/features/profile/header/ProfileHeader";
import { ProfileTabs } from "@/features/profile/tabs/ProfileTabs";
import AIStyleExplorerTab from "@/features/profile/AIStyleExplorerTab";
import { useAuthStore } from "@/store/auth";
import { userAdapter, dataService } from "@/lib/data-service";
import { log } from "@/lib/log";
import type { User, Artwork } from "@/types";

// Lazy load tab components
const OverviewTab = lazy(() => import("@/features/profile/overview/OverviewTab").then(m => ({ default: m.OverviewTab })));
const ArtworkTab = lazy(() => import("@/features/profile/artwork/ArtworkTab").then(m => ({ default: m.ArtworkTab })));
const UserFeedTab = lazy(() => import("@/features/profile/feed/UserFeedTab").then(m => ({ default: m.UserFeedTab })));
const CollaborationsTab = lazy(() => import("@/features/profile/collab/CollaborationsTab").then(m => ({ default: m.CollaborationsTab })));
const ConnectionsTab = lazy(() => import("@/features/profile/connections/ConnectionsTab").then(m => ({ default: m.ConnectionsTab })));
const InsightsTab = lazy(() => import("@/features/profile/insights/InsightsTab").then(m => ({ default: m.InsightsTab })));

type TabValue = "overview" | "artwork" | "feed" | "collaborations" | "connections" | "insights" | "ai-explorer";

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const { user: currentUser } = useAuthStore();

  const isOwnProfile = user && currentUser && user.id === currentUser.id;
  const isFollowing = currentUser && user && user.followers.includes(currentUser.id);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      setIsLoading(true);
      setNotFound(false);
      try {
        const users = await userAdapter.getAll();
        const profileUser = users.find(u => u.username === username);
        
        if (!profileUser) {
          log.error("User not found", { username });
          setNotFound(true);
          return;
        }

        setUser(profileUser);
        const userArtworks = await dataService.getUserArtworks(profileUser.id, !!isOwnProfile);
        setArtworks(userArtworks);
        log.info("Profile loaded", { userId: profileUser.id, username });
      } catch (error) {
        log.error("Failed to load profile", { username, error: error.message });
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username, isOwnProfile]);

  const handleFollow = async () => {
    if (!user || !currentUser) return;
    try {
      if (isFollowing) {
        await dataService.unfollowUser(currentUser.id, user.id);
      } else {
        await dataService.followUser(currentUser.id, user.id);
      }
      const updatedUser = await userAdapter.getById(user.id);
      if (updatedUser) setUser(updatedUser);
    } catch (error) {
      log.error("Failed to follow/unfollow user", { userId: user.id, error: error.message });
    }
  };

  const handleArtworkUpdate = async () => {
    if (!user) return;
    const userArtworks = await dataService.getUserArtworks(user.id, !!isOwnProfile);
    setArtworks(userArtworks);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (notFound || !user) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="text-6xl font-bold text-muted-foreground">404</div>
            <h1 className="text-2xl font-semibold">User not found</h1>
            <p className="text-muted-foreground">
              The profile <span className="font-mono bg-muted px-2 py-1 rounded">@{username}</span> doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const renderTabContent = () => {
    const tabProps = {
      userId: user.id,
      isOwnProfile: !!isOwnProfile,
      className: "min-h-[400px]"
    };

    switch (activeTab) {
      case "overview":
        return <OverviewTab user={user} artworks={artworks} onArtworkUpdate={handleArtworkUpdate} {...tabProps} />;
      case "artwork":
        return <ArtworkTab artworks={artworks} onArtworkUpdate={handleArtworkUpdate} {...tabProps} />;
      case "feed":
        return <UserFeedTab {...tabProps} />;
      case "collaborations":
        return <CollaborationsTab {...tabProps} />;
      case "connections":
        return <ConnectionsTab userIds={{ followers: user.followers, following: user.following }} {...tabProps} />;
      case "insights":
        return <InsightsTab {...tabProps} />;
      case "ai-explorer":
        return <AIStyleExplorerTab />;
      default:
        return <OverviewTab user={user} artworks={artworks} onArtworkUpdate={handleArtworkUpdate} {...tabProps} />;
    }
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProfileHeader
            user={user}
            artworkCount={artworks.length}
            postCount={0} // Would get from posts
            salesCount={isOwnProfile ? 5 : undefined}
            isOwnProfile={!!isOwnProfile}
            isFollowing={!!isFollowing}
            onFollow={handleFollow}
            onEdit={() => setActiveTab("overview")}
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOwnProfile={!!isOwnProfile}
            extraTabs={isOwnProfile ? [
              {
                key: "ai-explorer",
                label: "AI Explorer", 
                element: <AIStyleExplorerTab />
              }
            ] : []}
          />

          <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
            {renderTabContent()}
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}