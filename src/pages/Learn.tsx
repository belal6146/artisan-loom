import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users, Star, Play, BookOpen } from "lucide-react";

// Mock learning content data
const mockCourses = [
  {
    id: "1",
    title: "Abstract Painting Fundamentals",
    description: "Learn the basics of abstract painting, including color theory, composition, and brush techniques.",
    instructor: {
      name: "Elena Rodriguez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      title: "Professional Artist",
    },
    thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop",
    duration: "4 hours",
    students: 342,
    rating: 4.8,
    price: 89,
    level: "Beginner",
    category: "Painting",
  },
  {
    id: "2",
    title: "Digital Art Mastery",
    description: "Master digital painting and illustration using industry-standard tools and techniques.",
    instructor: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      title: "Digital Artist",
    },
    thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop",
    duration: "8 hours",
    students: 567,
    rating: 4.9,
    price: 149,
    level: "Intermediate",
    category: "Digital Art",
  },
  {
    id: "3",
    title: "Sculpture Basics: Clay to Bronze",
    description: "Explore sculpture from concept to casting, working with clay, plaster, and bronze.",
    instructor: {
      name: "Zara Kim",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      title: "Sculptor",
    },
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    duration: "12 hours",
    students: 234,
    rating: 4.7,
    price: 199,
    level: "Advanced",
    category: "Sculpture",
  },
];

const mockWorkshops = [
  {
    id: "1",
    title: "Color Theory Workshop",
    description: "A hands-on workshop exploring the psychology and application of color in art.",
    date: "January 25, 2024",
    time: "2:00 PM - 5:00 PM",
    instructor: "Elena Rodriguez",
    price: 45,
    spots: 8,
    maxSpots: 12,
  },
  {
    id: "2",
    title: "Digital Portfolio Building",
    description: "Learn how to create a compelling digital portfolio that showcases your work effectively.",
    date: "February 2, 2024",
    time: "10:00 AM - 1:00 PM",
    instructor: "Marcus Chen",
    price: 65,
    spots: 15,
    maxSpots: 20,
  },
];

export default function Learn() {
  return (
    <AppLayout>
      <div className="container py-8">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-display">Learn & Grow</h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Expand your artistic skills with courses and workshops from professional artists.
            </p>
          </div>

          {/* Featured Courses */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-lg">Featured Courses</h2>
              <Button variant="outline">View All Courses</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <Card key={course.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                  <div className="aspect-video overflow-hidden rounded-t-lg relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="gap-2">
                        <Play className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{course.category}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <h3 className="text-heading">{course.title}</h3>
                      <p className="text-caption text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                        <AvatarFallback className="text-xs">
                          {course.instructor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{course.instructor.name}</p>
                        <p className="text-xs text-muted-foreground">{course.instructor.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-caption text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-bold">${course.price}</span>
                      <Button>Enroll Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Upcoming Workshops */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-lg">Upcoming Workshops</h2>
              <Button variant="outline">View All Workshops</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockWorkshops.map((workshop) => (
                <Card key={workshop.id} className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-heading">{workshop.title}</CardTitle>
                        <p className="text-caption text-muted-foreground mt-1">
                          {workshop.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        Workshop
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-caption">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span>{workshop.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span>{workshop.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Instructor</span>
                        <span>{workshop.instructor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Available Spots</span>
                        <span>{workshop.maxSpots - workshop.spots} of {workshop.maxSpots}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold">${workshop.price}</span>
                      <Button>Register</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Learning Resources */}
          <section className="space-y-6">
            <h2 className="text-heading-lg">Free Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-heading">Art Tutorials</h3>
                    <p className="text-caption text-muted-foreground">
                      Free step-by-step tutorials for various techniques
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">Browse Tutorials</Button>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-accent-warm/10 flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-accent-warm" />
                  </div>
                  <div>
                    <h3 className="text-heading">Community</h3>
                    <p className="text-caption text-muted-foreground">
                      Join discussions and get feedback from other artists
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">Join Community</Button>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center mx-auto">
                    <Star className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-heading">Resources</h3>
                    <p className="text-caption text-muted-foreground">
                      Templates, references, and helpful tools
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">Download Resources</Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}