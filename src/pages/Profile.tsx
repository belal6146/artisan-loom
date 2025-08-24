import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ArtworkGrid } from "@/components/profile/ArtworkGrid";
import { ConnectionsModal } from "@/components/profile/ConnectionsModal";
import { useAuthStore } from "@/store/auth";
import { userAdapter, dataService } from "@/lib/data-service";
import { log } from "@/lib/log";
import type { User, Artwork } from "@/types";
import { MapPin, Calendar, Users, MessageCircle, Settings } from "lucide-react";

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [showConnections, setShowConnections] = useState<"followers" | "following" | null>(null);
  const { user: currentUser } = useAuthStore();

  const isOwnProfile = user && currentUser && user.id === currentUser.id;

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      setIsLoading(true);
      try {
        // Find user by username
        const users = await userAdapter.getAll();
        const profileUser = users.find(u => u.username === username);
        
        if (!profileUser) {
          log.error("User not found", { username });
          return;
        }

        setUser(profileUser);

        // Load artworks (include private if own profile)
        const userArtworks = await dataService.getUserArtworks(
          profileUser.id, 
          isOwnProfile
        );
        setArtworks(userArtworks);

        log.info("Profile loaded", { userId: profileUser.id, username });
      } catch (error) {
        log.error("Failed to load profile", { username, error: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username, isOwnProfile]);

  const handleFollow = async () => {
    if (!user || !currentUser) return;

    try {
      const isFollowing = user.followers.includes(currentUser.id);
      
      if (isFollowing) {
        await dataService.unfollowUser(currentUser.id, user.id);
      } else {
        await dataService.followUser(currentUser.id, user.id);
      }

      // Reload user data
      const updatedUser = await userAdapter.getById(user.id);
      if (updatedUser) setUser(updatedUser);
    } catch (error) {
      log.error("Failed to follow/unfollow user", { userId: user.id, error: error.message });
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleArtworkUpdate = async () => {
    if (!user) return;
    
    const userArtworks = await dataService.getUserArtworks(user.id, isOwnProfile);
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

  if (!user) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-heading-lg mb-4">User not found</h1>
            <p className="text-caption text-muted-foreground mb-6">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/explore">Explore Artists</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isFollowing = currentUser && user.followers.includes(currentUser.id);

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h1 className="text-heading-xl">{user.name}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                  
                  {user.bio && <p className="text-body">{user.bio}</p>}
                  
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-caption text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 justify-center md:justify-start">
                    <button
                      onClick={() => setShowConnections("followers")}
                      className="text-center hover:text-primary transition-smooth"
                    >
                      <p className="font-semibold">{user.followers.length}</p>
                      <p className="text-caption text-muted-foreground">Followers</p>
                    </button>
                    <button
                      onClick={() => setShowConnections("following")}
                      className="text-center hover:text-primary transition-smooth"
                    >
                      <p className="font-semibold">{user.following.length}</p>
                      <p className="text-caption text-muted-foreground">Following</p>
                    </button>
                    <div className="text-center">
                      <p className="font-semibold">{artworks.length}</p>
                      <p className="text-caption text-muted-foreground">Artworks</p>
                    </div>
                  </div>
                  
                  {currentUser && !isOwnProfile && (
                    <div className="flex gap-3 justify-center md:justify-start">
                      <Button onClick={handleFollow}>
                        <Users className="h-4 w-4 mr-2" />
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="artwork">Artwork</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              {isOwnProfile && <TabsTrigger value="edit">Edit Profile</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="about" className="mt-8">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>About {user.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.bio ? (
                    <p className="text-body">{user.bio}</p>
                  ) : (
                    <p className="text-caption text-muted-foreground italic">
                      {isOwnProfile ? "Add a bio to tell others about yourself" : "No bio available"}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Member since</h4>
                    <p className="text-caption text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="artwork" className="mt-8">
              <ArtworkGrid 
                artworks={artworks}
                isOwnProfile={isOwnProfile}
                onArtworkUpdate={handleArtworkUpdate}
              />
            </TabsContent>
            
            <TabsContent value="connections" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Followers ({user.followers.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowConnections("followers")}
                    >
                      View All Followers
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Following ({user.following.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowConnections("following")}
                    >
                      View All Following
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {isOwnProfile && (
              <TabsContent value="edit" className="mt-8">
                <ProfileEditor user={user} onUpdate={handleProfileUpdate} />
              </TabsContent>
            )}
          </Tabs>

          {/* Connections Modal */}
          {showConnections && (
            <ConnectionsModal
              userIds={showConnections === "followers" ? user.followers : user.following}
              type={showConnections}
              onClose={() => setShowConnections(null)}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}