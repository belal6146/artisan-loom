import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthStore } from "@/store/auth";
import { userAdapter, dataService } from "@/lib/data-service";
import { log } from "@/lib/log";
import type { User, ID } from "@/types";
import { Users, MessageCircle, UserMinus, UserPlus } from "lucide-react";

interface ConnectionsModalProps {
  userIds: ID[];
  type: "followers" | "following";
  onClose: () => void;
}

export const ConnectionsModal = ({ userIds, type, onClose }: ConnectionsModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const allUsers = await userAdapter.getAll();
        const filteredUsers = allUsers.filter(user => userIds.includes(user.id));
        setUsers(filteredUsers);
        
        log.info(`Loaded ${type} users`, { count: filteredUsers.length });
      } catch (error) {
        log.error(`Failed to load ${type} users`, { error: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    if (userIds.length > 0) {
      loadUsers();
    } else {
      setIsLoading(false);
    }
  }, [userIds, type]);

  const handleFollowToggle = async (targetUser: User) => {
    if (!currentUser || actioningUserId) return;

    setActioningUserId(targetUser.id);
    try {
      const isCurrentlyFollowing = targetUser.followers.includes(currentUser.id);
      
      if (isCurrentlyFollowing) {
        await dataService.unfollowUser(currentUser.id, targetUser.id);
      } else {
        await dataService.followUser(currentUser.id, targetUser.id);
      }

      // Reload user data to get updated follower counts
      const updatedUser = await userAdapter.getById(targetUser.id);
      if (updatedUser) {
        setUsers(prev => prev.map(user => 
          user.id === targetUser.id ? updatedUser : user
        ));
      }
    } catch (error) {
      log.error("Failed to toggle follow", { 
        targetUserId: targetUser.id, 
        error: error.message 
      });
    } finally {
      setActioningUserId(null);
    }
  };

  const isFollowing = (user: User) => {
    return currentUser && user.followers.includes(currentUser.id);
  };

  const isOwnProfile = (user: User) => {
    return currentUser && user.id === currentUser.id;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No {type} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>

                  {currentUser && !isOwnProfile(user) && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFollowToggle(user)}
                        disabled={actioningUserId === user.id}
                        className="min-w-[90px]"
                      >
                        {actioningUserId === user.id ? (
                          "..."
                        ) : isFollowing(user) ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-1" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};