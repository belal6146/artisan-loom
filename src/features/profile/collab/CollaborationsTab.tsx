import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { dataService } from "@/lib/data-service";
import { formatRelativeTime } from "@/lib/date";
import type { Collaboration } from "@/types";
import { 
  Users, 
  Clock, 
  MapPin, 
  DollarSign,
  Star,
  ExternalLink,
  Calendar,
  Plus
} from "lucide-react";

interface CollaborationsTabProps {
  userId: string;
  isOwnProfile: boolean;
  className?: string;
}

export const CollaborationsTab = ({ userId, isOwnProfile, className }: CollaborationsTabProps) => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCollaborations = async () => {
      setIsLoading(true);
      try {
        // Mock empty collaborations for now
        setCollaborations([]);
      } catch (error) {
        console.error("Failed to load collaborations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollaborations();
  }, [userId]);

  const getCompensationIcon = (type: Collaboration['compensationType']) => {
    switch (type) {
      case 'paid': return DollarSign;
      case 'revenue-share': return Star;
      case 'voluntary': return Users;
      default: return Users;
    }
  };

  const getCompensationColor = (type: Collaboration['compensationType']) => {
    switch (type) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'revenue-share': return 'bg-blue-100 text-blue-800';
      case 'voluntary': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className={`py-8 flex items-center justify-center ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {isOwnProfile ? "Your Collaborations" : "Collaborations"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isOwnProfile ? "Projects you've created" : "Open collaboration projects"}
          </p>
        </div>
        
        {isOwnProfile && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Collaboration
          </Button>
        )}
      </div>

      {/* Collaborations List */}
      {collaborations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-semibold mb-2">No collaborations yet</h4>
            <p className="text-sm text-muted-foreground">
              {isOwnProfile 
                ? "Create your first collaboration to work with other artists" 
                : "This user hasn't created any collaboration projects yet"}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" variant="outline">
                Create Collaboration
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {collaborations.map((collab) => {
            const CompensationIcon = getCompensationIcon(collab.compensationType);
            const isDeadlineSoon = collab.deadline && 
              new Date(collab.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

            return (
              <Card key={collab.id} className="hover:shadow-md transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{collab.name}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getCompensationColor(collab.compensationType)}>
                          <CompensationIcon className="h-3 w-3 mr-1" />
                          {collab.compensationType === 'revenue-share' ? 'Revenue Share' : 
                           collab.compensationType.charAt(0).toUpperCase() + collab.compensationType.slice(1)}
                        </Badge>
                        
                        {collab.deadline && (
                          <Badge variant={isDeadlineSoon ? "destructive" : "secondary"}>
                            <Clock className="h-3 w-3 mr-1" />
                            Due {formatRelativeTime(collab.deadline)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {collab.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {collab.participants}
                        {collab.maxParticipants && ` / ${collab.maxParticipants}`} participants
                      </span>
                    </div>
                    
                    {collab.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{collab.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {formatRelativeTime(collab.createdAt)}</span>
                    </div>
                  </div>
                  
                  {collab.skills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Skills needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {collab.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {collab.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{collab.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {collab.compensation && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Compensation:</span> {collab.compensation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};