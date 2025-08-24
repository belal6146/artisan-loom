import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsTab } from "@/features/experience/EventsTab";
import { ToolsTab } from "@/features/experience/ToolsTab";
import { Calendar, ShoppingBag } from "lucide-react";

export default function Experience() {
  return (
    <AppLayout>
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-display">Experience Art</h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Discover galleries, competitions, workshops, and events happening in your area and online.
              Explore trusted art tools and materials from verified vendors.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-8">
              <EventsTab />
            </TabsContent>

            <TabsContent value="tools" className="mt-8">
              <ToolsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}