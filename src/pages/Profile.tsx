import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, MessageCircle } from "lucide-react";

// Mock user data
const mockUser = {
  id: "user_1",
  name: "Elena Rodriguez",
  username: "elena_art", 
  bio: "Contemporary artist exploring the intersection of nature and urban life through abstract expressionism. Based in Barcelona, Spain.",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
  followers: ["user_2", "user_3", "user_4", "user_5"],
  following: ["user_2", "user_6"],
  location: "Barcelona, Spain",
  joinedAt: "March 2023",
};

const mockArtworks = [
  {
    id: "1",
    title: "Ocean Dreams",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    category: "painting",
    forSale: true,
    price: { amount: 850, currency: "USD" as const },
  },
  {
    id: "2",
    title: "City Lights",
    imageUrl: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop",
    category: "painting", 
    forSale: false,
  },
  {
    id: "3",
    title: "Abstract Flow",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
    category: "painting",
    forSale: true,
    price: { amount: 650, currency: "USD" as const },
  },
];

export default function Profile() {
  const { username } = useParams();

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback className="text-2xl">
                    {mockUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h1 className="text-heading-xl">{mockUser.name}</h1>
                    <p className="text-muted-foreground">@{mockUser.username}</p>
                  </div>
                  
                  <p className="text-body">{mockUser.bio}</p>
                  
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-caption text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mockUser.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {mockUser.joinedAt}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 justify-center md:justify-start">
                    <div className="text-center">
                      <p className="font-semibold">{mockUser.followers.length}</p>
                      <p className="text-caption text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{mockUser.following.length}</p>
                      <p className="text-caption text-muted-foreground">Following</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{mockArtworks.length}</p>
                      <p className="text-caption text-muted-foreground">Artworks</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-center md:justify-start">
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="artworks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="artworks">Artworks</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>
            
            <TabsContent value="artworks" className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockArtworks.map((artwork) => (
                  <Card 
                    key={artwork.id}
                    className="group cursor-pointer hover:shadow-medium transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold truncate">{artwork.title}</h3>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize">
                          {artwork.category}
                        </Badge>
                        {artwork.forSale && artwork.price && (
                          <span className="font-semibold text-accent-warm">
                            ${artwork.price.amount}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="posts" className="mt-8">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Posts will be displayed here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="collections" className="mt-8">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Collections will be displayed here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}