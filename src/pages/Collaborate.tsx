import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, DollarSign, Plus } from "lucide-react";

// Mock collaborations data
const mockCollaborations = [
  {
    id: "1",
    name: "Urban Art Mural Project",
    description: "Looking for 3 artists to collaborate on a large-scale mural in downtown Barcelona. We need painters specializing in street art and abstract styles.",
    coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop",
    creator: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    skills: ["Street Art", "Painting", "Color Theory"],
    compensationType: "paid" as const,
    compensation: "€2,000 per artist",
    location: "Barcelona, Spain",
    deadline: "2024-02-15",
    participants: 2,
    maxParticipants: 5,
  },
  {
    id: "2",
    name: "Digital Art Collection",
    description: "Creating a collaborative NFT collection exploring themes of nature and technology. Looking for digital artists with experience in environmental storytelling.",
    creator: {
      name: "Zara Kim",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    skills: ["Digital Art", "NFT", "Environmental Design"],
    compensationType: "revenue-share" as const,
    compensation: "50/50 revenue split",
    location: "Remote",
    deadline: "2024-03-01",
    participants: 1,
    maxParticipants: 3,
  },
  {
    id: "3",
    name: "Community Art Workshop",
    description: "Organizing a free art workshop for local kids. Need volunteers to help teach basic painting and drawing techniques.",
    creator: {
      name: "Elena Rodriguez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    skills: ["Teaching", "Painting", "Working with Children"],
    compensationType: "voluntary" as const,
    location: "Community Center, Madrid",
    deadline: "2024-01-30",
    participants: 4,
    maxParticipants: 8,
  },
];

const getCompensationIcon = (type: string) => {
  switch (type) {
    case "paid":
      return <DollarSign className="h-4 w-4" />;
    case "revenue-share":
      return <Users className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

export default function Collaborate() {
  return (
    <AppLayout>
      <section className="space-y-6">
        {/* Header */}
        <header className="rounded-2xl p-6 bg-background border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Collaborate</h1>
              <p className="text-muted-foreground mt-1">Join creative projects, find collaborators, and bring ideas to life together.</p>
            </div>
            <Button className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </header>

        {/* Collaborations Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockCollaborations.map((collab) => (
            <Card key={collab.id} className="rounded-2xl border bg-background/60 backdrop-blur-sm shadow-sm hover:-translate-y-0.5 transition will-change-transform">
              {collab.coverImage && (
                <div className="aspect-[2/1] overflow-hidden rounded-t-2xl">
                  <img
                    src={collab.coverImage}
                    alt={collab.name}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-heading">{collab.name}</CardTitle>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-xl">
                        <AvatarImage src={collab.creator.avatar} alt={collab.creator.name} />
                        <AvatarFallback className="text-sm">{(collab.creator.name ?? "?").slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{collab.creator.name}</p>
                        <p className="text-sm text-muted-foreground">{collab.creator.handle}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={collab.compensationType === "paid" ? "default" : "secondary"}
                    className="flex items-center space-x-1"
                  >
                    {getCompensationIcon(collab.compensationType)}
                    <span className="capitalize">{collab.compensationType.replace('-', ' ')}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-body text-muted-foreground line-clamp-3">
                  {collab.description}
                </p>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {collab.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                {/* Details */}
                <div className="space-y-2 text-caption text-muted-foreground">
                  {collab.compensation && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{collab.compensation}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{collab.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {new Date(collab.deadline).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {collab.participants}/{collab.maxParticipants || '∞'} participants
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1">Apply to Join</Button>
                  <Button variant="outline">Learn More</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load more projects
          </Button>
        </div>
      </section>
    </AppLayout>
  );
}